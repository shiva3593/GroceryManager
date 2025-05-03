import { InventoryItem as InventoryItemType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

interface InventoryItemProps {
  item: InventoryItemType;
  onClick: (item: InventoryItemType) => void;
  onDelete?: (item: InventoryItemType) => void;
}

export default function InventoryItem({ item, onClick, onDelete }: InventoryItemProps) {
  const getExpiryText = () => {
    if (!item.expiryDate) return null;
    
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    
    // Check if valid date
    if (isNaN(expiryDate.getTime())) return null;
    
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 0) {
      return <p className="text-xs text-red-500 font-medium">Expired</p>;
    } else if (daysUntilExpiry <= 3) {
      return <p className="text-xs text-orange-500 font-medium">Expires in {daysUntilExpiry} days</p>;
    } else {
      return <p className="text-xs text-slate-500">Expires {format(expiryDate, 'MMM dd, yyyy')}</p>;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent triggering the parent div's onClick when clicking buttons
    if ((e.target as HTMLElement).closest('button')) {
      e.stopPropagation();
    } else {
      onClick(item);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="flex items-center p-4 bg-white hover:bg-slate-50 cursor-pointer transition-colors relative group"
    >
      <div className="mr-3 w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
        ) : (
          <i className="fas fa-box text-slate-400"></i>
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-xs text-slate-500">
              {item.quantity} {item.unit} • {item.category} • {item.location}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center">
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-sm font-medium mr-2">
                {item.count}
              </span>
              <div className="hidden group-hover:flex items-center">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(item);
                  }}
                >
                  <i className="fas fa-edit text-slate-500 hover:text-primary text-sm"></i>
                </Button>
                {onDelete && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8" 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDelete) onDelete(item);
                    }}
                  >
                    <i className="fas fa-trash text-slate-500 hover:text-red-500 text-sm"></i>
                  </Button>
                )}
              </div>
            </div>
            {getExpiryText()}
          </div>
        </div>
      </div>
    </div>
  );
}
