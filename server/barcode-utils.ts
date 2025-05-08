import axios from 'axios';
import * as cheerio from 'cheerio';
import type { InventoryItem } from '../shared/schema.ts';

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
      } else if (/spice|herb|seasoning|pepper|cinnamon|turmeric|cumin|coriander|cardamom|clove|ginger|garlic|paprika|oregano|basil|thyme|rosemary|sage|parsley|mint|chili|curry|masala|nutmeg|allspice|bay leaf|dill|fennel|mustard|saffron|vanilla|star anise|fenugreek|tarragon|marjoram|celery seed|caraway|juniper|lavender|lemongrass|citrus peel|sumac|za'atar|herbes de provence|garam masala|five spice|seven spice|ras el hanout|berbere|dukkah|shichimi|gomasio|furikake|togarashi|zaatar|baharat|advieh|mitmita|berbere|dukkah|shichimi|gomasio|furikake|togarashi|zaatar|baharat|advieh|mitmita/i.test(productName)) {
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
        image_url: productImage,
        quantity: quantity,
        unit: unit,
        count: 1,
        barcode: barcode,
        location: location,
        category: category,
        expiry_date: null
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
              image_url: '',
              quantity: '1',
              unit: 'unit',
              count: 1,
              barcode: barcode,
              location: 'Pantry',
              category: 'Other',
              expiry_date: null
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
    }
  ];
  
  console.log(`Looking up barcode ${barcode} from web sources`);
  
  // Create a promise that rejects after 1 second
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Web search timeout')), 1000);
  });

  // Try the first source only
  try {
    console.log(`Trying source: ${sources[0].name}`);
    const response = await Promise.race([
      axios.get(sources[0].url, {
        headers: sources[0].headers,
        timeout: 1000 // 1-second timeout for the request
      }),
      timeoutPromise
    ]) as { status: number; data: string };
    
    if (response.status === 200) {
      // Check for rate limit errors in response text
      if (response.data && typeof response.data === 'string' && 
         (response.data.includes('Too Many Requests') || 
          response.data.includes('rate limit') || 
          response.data.includes('sign up'))) {
        console.log(`Rate limited by ${sources[0].name}`);
        return null;
      }
        
      // Try to extract product details from the HTML
      const product = extractProductFromHtml(response.data, barcode);
      
      if (product) {
        console.log(`Found product details from ${sources[0].name}: ${product.name}`);
        return product;
      }
    }
  } catch (error) {
    console.error(`Error with source ${sources[0].name}:`, error);
  }
  
  // Return null if no product found or error occurred
  console.log(`No product information found for barcode ${barcode}`);
  return null;
}