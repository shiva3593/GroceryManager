import axios from 'axios';
import * as cheerio from 'cheerio';
import { InventoryItem } from '@shared/schema';

// Helper function to extract product details from HTML using Cheerio
function extractProductFromHtml(html: string, barcode: string): Partial<InventoryItem> | null {
  try {
    // Load the HTML response into cheerio
    const $ = cheerio.load(html);
    
    // Debug the HTML structure to help identify the right selectors
    console.log('Parsing product details from HTML');
    
    // Extract product details - trying multiple potential selectors used by various websites
    let productName = '';
    
    // Try different selectors for the product name in order of likelihood
    const nameSelectors = [
      '.product-details h4', 
      'h1.product-name', 
      '.product-name h1',
      '.product-title',
      '.product h1',
      '.card .product-title',
      '.card-title',
      '.item-title',
      '.product-name',
      '.details h1',
      '.details h2'
    ];
    
    for (const selector of nameSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        productName = element.text().trim();
        console.log(`Found product name using selector: ${selector}`);
        break;
      }
    }
    
    // If still not found, try a more general approach
    if (!productName) {
      // Look for any heading that might contain product info
      $('h1, h2, h3, h4').each(function() {
        const text = $(this).text().trim();
        if (text && !productName) {
          productName = text;
          console.log(`Found product name in heading: ${text}`);
        }
      });
    }
    
    // Try different selectors for the product image
    let productImage = '';
    const imageSelectors = [
      '.product-image img', 
      '.product-img img', 
      'img.product-image',
      '.item-image img',
      '.card-img-top',
      '.product img'
    ];
    
    for (const selector of imageSelectors) {
      const element = $(selector);
      if (element.length > 0 && element.attr('src')) {
        productImage = element.attr('src') || '';
        console.log(`Found product image using selector: ${selector}`);
        break;
      }
    }
    
    // Log what we found
    console.log(`Product name extracted: "${productName}"`);
    console.log(`Product image URL: "${productImage}"`);
    
    // If we found a product name, create an item with it
    if (productName) {
      console.log(`Found product: ${productName}`);
      
      // Try to extract other details if available
      let category = 'Other';
      let location = 'Pantry';
      let quantity = '1';
      let unit = 'unit';
      
      // Attempt to categorize based on product name
      if (/milk|cream|yogurt|cheese|butter/i.test(productName)) {
        category = 'Dairy';
        location = 'Refrigerator';
      } else if (/fruit|vegetable|produce|salad/i.test(productName)) {
        category = 'Produce';
        location = 'Refrigerator';
      } else if (/meat|beef|chicken|pork|fish|seafood/i.test(productName)) {
        category = 'Meat';
        location = 'Refrigerator';
      } else if (/cereal|pasta|rice|flour|sugar|salt/i.test(productName)) {
        category = 'Pantry';
        location = 'Pantry';
      } else if (/spice|herb|seasoning/i.test(productName)) {
        category = 'Spices';
        location = 'Spice Rack';
      } else if (/beer|wine|juice|soda|water/i.test(productName)) {
        category = 'Beverages';
        location = 'Refrigerator';
      } else if (/bread|cake|pie|pastry/i.test(productName)) {
        category = 'Bakery';
        location = 'Pantry';
      } else if (/chips|cookie|candy|snack/i.test(productName)) {
        category = 'Snacks';
        location = 'Pantry';
      }
      
      // Try to extract quantity and unit from the product name
      const qtyMatch = productName.match(/(\d+)\s*(ml|l|g|kg|oz|lb|piece|pack)/i);
      if (qtyMatch) {
        quantity = qtyMatch[1];
        unit = qtyMatch[2].toLowerCase();
      }
      
      return {
        name: productName,
        imageUrl: productImage,
        quantity: quantity,
        unit: unit,
        count: 1,
        barcode: barcode,
        location: location,
        category: category,
        expiryDate: null
      };
    } else {
      // Try direct inspection of the HTML for a product name
      console.log(`No product found with standard selectors, trying to extract from HTML directly`);
      
      // Search for barcode in the HTML text
      const barcodePositions: number[] = [];
      let pos = html.indexOf(barcode);
      while (pos !== -1) {
        barcodePositions.push(pos);
        pos = html.indexOf(barcode, pos + 1);
      }
      
      if (barcodePositions.length > 0) {
        // Look at surrounding text for each occurrence
        for (const pos of barcodePositions) {
          // Get a chunk of HTML around the barcode occurrence
          const startPos = Math.max(0, pos - 300);
          const endPos = Math.min(html.length, pos + 300);
          const chunk = html.substring(startPos, endPos);
          
          console.log(`Analyzing chunk around barcode at position ${pos}`);
          
          // Check if this chunk contains product information
          const chunkDom = cheerio.load(chunk);
          const textNodes = chunkDom('*').contents().filter(function() {
            return this.type === 'text';
          });
          
          // Extract potential product names (any text node over 3 words)
          const potentialNames: string[] = [];
          textNodes.each(function() {
            const text = chunkDom(this).text().trim();
            if (text && text.split(/\s+/).length > 3 && !/^\d+$/.test(text)) {
              potentialNames.push(text);
            }
          });
          
          if (potentialNames.length > 0) {
            // Use the longest text as the potential product name
            productName = potentialNames.reduce((a, b) => a.length > b.length ? a : b);
            console.log(`Potential product name from direct HTML analysis: "${productName}"`);
            
            // Return a basic item with just the extracted name
            return {
              name: productName,
              imageUrl: '',
              quantity: '1',
              unit: 'unit',
              count: 1,
              barcode: barcode,
              location: 'Pantry',
              category: 'Other',
              expiryDate: null
            };
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return null;
  }
}

/**
 * Multi-source barcode lookup utility 
 * Tries multiple sources in case of rate limiting or service unavailability
 */
export async function lookupBarcodeInfo(barcode: string): Promise<Partial<InventoryItem> | null> {
  // Clean and validate the barcode
  barcode = barcode.trim();
  if (!/^\d{6,14}$/.test(barcode)) {
    console.error(`Invalid barcode format: ${barcode}`);
    return null;
  }
  
  // Sources to try in order of preference
  const sources = [
    {
      name: 'go-upc.com',
      url: `https://go-upc.com/search?q=${barcode}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    },
    {
      name: 'barcodelookup.com',
      url: `https://www.barcodelookup.com/${barcode}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive', 
        'Referer': 'https://www.barcodelookup.com/',
        'Upgrade-Insecure-Requests': '1'
      }
    },
    {
      // Alternative format structure
      name: 'upcdatabase.org',
      url: `https://www.upcdatabase.org/code/${barcode}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      }
    }
  ];
  
  console.log(`Looking up barcode ${barcode} from web sources`);
  
  // Try each source until we find product information
  for (const source of sources) {
    try {
      console.log(`Trying source: ${source.name}`);
      const response = await axios.get(source.url, {
        headers: source.headers,
        timeout: 5000 // 5-second timeout to prevent long waits
      });
      
      if (response.status === 200) {
        // Check for rate limit errors in response text
        if (response.data && typeof response.data === 'string' && 
           (response.data.includes('Too Many Requests') || 
            response.data.includes('rate limit') || 
            response.data.includes('sign up'))) {
          console.log(`Rate limited by ${source.name}, trying next source`);
          continue; // Skip to next source
        }
          
        // Try to extract product details from the HTML
        const product = extractProductFromHtml(response.data, barcode);
        
        if (product) {
          console.log(`Found product details from ${source.name}: ${product.name}`);
          return product;
        } else {
          console.log(`No product found at ${source.name}, trying next source`);
        }
      } else {
        console.log(`Non-200 response from ${source.name}: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error with source ${source.name}:`, error);
      // Continue to next source on error
    }
  }
  
  // Fallback - create a generic product with just the barcode
  console.log(`No product information found for barcode ${barcode} from any source`);
  return {
    name: `Product (${barcode})`,
    imageUrl: '',
    quantity: '1',
    unit: 'unit',
    count: 1,
    barcode: barcode,
    location: 'Pantry',
    category: 'Other',
    expiryDate: null
  };
}