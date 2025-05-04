import { Router } from 'express';
import { db } from '../../db';
import { shoppingItems } from '@shared/schema';
import { PantryIntelligenceService } from '../../services/pantryIntelligence';

const router = Router();
const pantryIntelligence = PantryIntelligenceService.getInstance();

// Get all shopping items
router.get('/', async (req, res) => {
  try {
    const items = await db.select().from(shoppingItems).orderBy(shoppingItems.created_at);
    res.json(items);
  } catch (error) {
    console.error('Error fetching shopping items:', error);
    res.status(500).json({ error: 'Failed to fetch shopping items' });
  }
});

// Add new shopping item
router.post('/', async (req, res) => {
  try {
    const { name, quantity, unit } = req.body;
    
    // Insert the item
    const [newItem] = await db.insert(shoppingItems)
      .values({
        name,
        quantity,
        unit,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();

    // Analyze and update category
    await pantryIntelligence.updateItemCategory(newItem.id, name);

    // Fetch the updated item
    const [updatedItem] = await db.select()
      .from(shoppingItems)
      .where({ id: newItem.id });

    res.json(updatedItem);
  } catch (error) {
    console.error('Error adding shopping item:', error);
    res.status(500).json({ error: 'Failed to add shopping item' });
  }
});

// Update shopping item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, unit, checked } = req.body;

    const updates: any = { updated_at: new Date() };
    if (name !== undefined) updates.name = name;
    if (quantity !== undefined) updates.quantity = quantity;
    if (unit !== undefined) updates.unit = unit;
    if (checked !== undefined) updates.checked = checked;

    const [updatedItem] = await db.update(shoppingItems)
      .set(updates)
      .where({ id: parseInt(id) })
      .returning();

    // If name was updated, re-analyze category
    if (name) {
      await pantryIntelligence.updateItemCategory(parseInt(id), name);
    }

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating shopping item:', error);
    res.status(500).json({ error: 'Failed to update shopping item' });
  }
});

// Delete shopping item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(shoppingItems).where({ id: parseInt(id) });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting shopping item:', error);
    res.status(500).json({ error: 'Failed to delete shopping item' });
  }
});

export default router; 