import { Link, useLocation } from "wouter";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const [location, setLocation] = useLocation();
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setLocation(tab === "recipes" ? "/" : `/${tab}`);
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold text-primary">Grocery Manager</h1>
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-slate-100" aria-label="Search">
            <i className="fas fa-search text-slate-600"></i>
          </button>
          <Link href="/profile">
            <button className="p-2 rounded-full hover:bg-slate-100" aria-label="Profile">
              <i className="fas fa-user text-slate-600"></i>
            </button>
          </Link>
        </div>
      </div>
      
      {/* Tab Navigation for Desktop */}
      <nav className="hidden sm:flex px-4 border-b border-slate-200">
        <button 
          onClick={() => handleTabChange("recipes")}
          className={`px-4 py-2 font-medium ${activeTab === "recipes" ? "text-primary border-b-2 border-primary" : "text-slate-600 hover:text-slate-900"}`}
        >
          Recipes
        </button>
        <button 
          onClick={() => handleTabChange("inventory")}
          className={`px-4 py-2 font-medium ${activeTab === "inventory" ? "text-primary border-b-2 border-primary" : "text-slate-600 hover:text-slate-900"}`}
        >
          Inventory
        </button>
        <button 
          onClick={() => handleTabChange("shopping-list")}
          className={`px-4 py-2 font-medium ${activeTab === "shopping-list" ? "text-primary border-b-2 border-primary" : "text-slate-600 hover:text-slate-900"}`}
        >
          Shopping List
        </button>
        <button 
          onClick={() => handleTabChange("compare")}
          className={`px-4 py-2 font-medium ${activeTab === "compare" ? "text-primary border-b-2 border-primary" : "text-slate-600 hover:text-slate-900"}`}
        >
          Cook Map
        </button>
      </nav>
    </header>
  );
}
