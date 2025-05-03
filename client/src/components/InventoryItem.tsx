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
    if (!item.expiry_date) return null;
    const expiryDate = new Date(item.expiry_date);
    const today = new Date();
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="text-red-500">Expired {Math.abs(diffDays)} days ago</span>;
    } else if (diffDays === 0) {
      return <span className="text-red-500">Expires today</span>;
    } else if (diffDays <= 7) {
      return <span className="text-yellow-500">Expires in {diffDays} days</span>;
    } else {
      return <span className="text-green-500">Expires on {format(expiryDate, 'MMM d, yyyy')}</span>;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(item);
  };

  return (
    <div 
      onClick={handleClick}
      className="flex items-center p-4 bg-white hover:bg-slate-50 cursor-pointer transition-colors relative group"
    >
      <div className="mr-3 w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
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
            {getExpiryText() && (
              <p className="text-xs mt-1">{getExpiryText()}</p>
            )}
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
            >
              <i className="fas fa-trash text-red-500"></i>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
