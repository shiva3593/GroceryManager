import { Link, useLocation } from "wouter";

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, setActiveTab }: BottomNavigationProps) {
  const [location, setLocation] = useLocation();
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setLocation(tab === "recipes" ? "/" : `/${tab}`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex sm:hidden z-20">
      <button 
        onClick={() => handleTabChange("recipes")}
        className={`flex flex-col items-center justify-center flex-1 py-2 ${activeTab === "recipes" ? "text-primary" : "text-slate-500"}`}
      >
        <i className="fas fa-book text-lg"></i>
        <span className="text-xs mt-1">Recipes</span>
      </button>
      <button 
        onClick={() => handleTabChange("inventory")}
        className={`flex flex-col items-center justify-center flex-1 py-2 ${activeTab === "inventory" ? "text-primary" : "text-slate-500"}`}
      >
        <i className="fas fa-boxes text-lg"></i>
        <span className="text-xs mt-1">Inventory</span>
      </button>
      <button 
        onClick={() => handleTabChange("shopping-list")}
        className={`flex flex-col items-center justify-center flex-1 py-2 ${activeTab === "shopping-list" ? "text-primary" : "text-slate-500"}`}
      >
        <i className="fas fa-shopping-cart text-lg"></i>
        <span className="text-xs mt-1">Shopping</span>
      </button>
      <button 
        onClick={() => handleTabChange("compare")}
        className={`flex flex-col items-center justify-center flex-1 py-2 ${activeTab === "compare" ? "text-primary" : "text-slate-500"}`}
      >
        <i className="fas fa-map text-lg"></i>
        <span className="text-xs mt-1">Cook Map</span>
      </button>
    </nav>
  );
}
