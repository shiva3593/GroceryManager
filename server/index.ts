import express, { Request, Response } from 'express';
import cors from 'cors';
import { Recipe, InventoryItem, ShoppingList, CookMap } from '../src/types/database';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with a proper database in production)
let recipes: Recipe[] = [];
let inventory: InventoryItem[] = [];
let shoppingLists: ShoppingList[] = [];
let cookMaps: CookMap[] = [];

// Recipe endpoints
app.get('/recipes', (req: Request, res: Response) => {
  const since = req.query.since ? new Date(req.query.since as string) : new Date(0);
  const changes = recipes.filter(recipe => new Date(recipe.last_synced!) > since);
  res.json(changes);
});

app.post('/recipes/sync', (req: Request, res: Response) => {
  const changes: Recipe[] = req.body;
  for (const recipe of changes) {
    const index = recipes.findIndex(r => r.id === recipe.id);
    if (index >= 0) {
      recipes[index] = recipe;
    } else {
      recipes.push(recipe);
    }
  }
  res.json({ success: true });
});

// Inventory endpoints
app.get('/inventory', (req: Request, res: Response) => {
  const since = req.query.since ? new Date(req.query.since as string) : new Date(0);
  const changes = inventory.filter(item => new Date(item.last_synced!) > since);
  res.json(changes);
});

app.post('/inventory/sync', (req: Request, res: Response) => {
  const changes: InventoryItem[] = req.body;
  for (const item of changes) {
    const index = inventory.findIndex(i => i.id === item.id);
    if (index >= 0) {
      inventory[index] = item;
    } else {
      inventory.push(item);
    }
  }
  res.json({ success: true });
});

// Shopping List endpoints
app.get('/shopping-lists', (req: Request, res: Response) => {
  const since = req.query.since ? new Date(req.query.since as string) : new Date(0);
  const changes = shoppingLists.filter(list => new Date(list.last_synced!) > since);
  res.json(changes);
});

app.post('/shopping-lists/sync', (req: Request, res: Response) => {
  const changes: ShoppingList[] = req.body;
  for (const list of changes) {
    const index = shoppingLists.findIndex(l => l.id === list.id);
    if (index >= 0) {
      shoppingLists[index] = list;
    } else {
      shoppingLists.push(list);
    }
  }
  res.json({ success: true });
});

// Cook Map endpoints
app.get('/cook-maps', (req: Request, res: Response) => {
  const since = req.query.since ? new Date(req.query.since as string) : new Date(0);
  const changes = cookMaps.filter(map => new Date(map.last_synced!) > since);
  res.json(changes);
});

app.post('/cook-maps/sync', (req: Request, res: Response) => {
  const changes: CookMap[] = req.body;
  for (const map of changes) {
    const index = cookMaps.findIndex(m => m.id === map.id);
    if (index >= 0) {
      cookMaps[index] = map;
    } else {
      cookMaps.push(map);
    }
  }
  res.json({ success: true });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 