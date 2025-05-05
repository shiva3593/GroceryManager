import { Link } from "wouter";
import { Home, Utensils, ShoppingCart, Search } from "lucide-react";

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="container mx-auto px-4">
        <div className="flex justify-around py-2">
          <Link
            href="/"
            className="flex flex-col items-center text-sm"
          >
            <Home className="h-6 w-6" />
            <span>Home</span>
          </Link>
          <Link
            href="/recipes"
            className="flex flex-col items-center text-sm"
          >
            <Utensils className="h-6 w-6" />
            <span>Recipes</span>
          </Link>
          <Link
            href="/recipe-finder"
            className="flex flex-col items-center text-sm"
          >
            <Search className="h-6 w-6" />
            <span>Recipe Finder</span>
          </Link>
          <Link
            href="/shopping-list"
            className="flex flex-col items-center text-sm"
          >
            <ShoppingCart className="h-6 w-6" />
            <span>Shopping List</span>
          </Link>
        </div>
      </div>
    </nav>
  );
} 