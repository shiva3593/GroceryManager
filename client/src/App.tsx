import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import Recipes from "@/pages/recipes";
import Inventory from "@/pages/inventory";
import ShoppingList from "@/pages/shopping-list";
import Compare from "@/pages/compare";
import Profile from "@/pages/profile";
import Auth from "@/pages/auth";
import { useState, useEffect } from "react";

// Protected route wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLocation("/auth");
    }
  }, [setLocation]);

  return localStorage.getItem('token') ? <Component /> : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/" component={() => <ProtectedRoute component={Recipes} />} />
      <Route path="/recipes" component={() => <ProtectedRoute component={Recipes} />} />
      <Route path="/inventory" component={() => <ProtectedRoute component={Inventory} />} />
      <Route path="/shopping-list" component={() => <ProtectedRoute component={ShoppingList} />} />
      <Route path="/compare" component={() => <ProtectedRoute component={Compare} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("recipes");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="mobile-container bg-slate-50">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <Router />
        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        {/* NetworkInfo removed as requested */}
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
