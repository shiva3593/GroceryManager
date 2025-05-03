import { ShoppingItem } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ShoppingListItemProps {
  item: ShoppingItem;
  onStatusChange: (id: number, checked: boolean) => void;
}

export default function ShoppingListItem({ item, onStatusChange }: ShoppingListItemProps) {
  const [isChecked, setIsChecked] = useState(item.checked);
  const { toast } = useToast();

  const handleCheckboxChange = async (checked: boolean) => {
    setIsChecked(checked);
    
    try {
      await apiRequest('PUT', `/api/shopping-list/${item.id}`, { checked });
      onStatusChange(item.id, checked);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item status",
        variant: "destructive",
      });
      // Revert UI state if API call fails
      setIsChecked(!checked);
    }
  };

  return (
    <div className="flex items-center p-3 pl-4">
      <Checkbox 
        id={`item-${item.id}`} 
        checked={isChecked}
        onCheckedChange={handleCheckboxChange}
        className="w-5 h-5 rounded-full border-slate-300 text-primary focus:ring-primary"
      />
      <label 
        htmlFor={`item-${item.id}`} 
        className={`ml-3 flex-1 flex justify-between items-center ${isChecked ? 'text-slate-400 line-through' : 'text-slate-800'}`}
      >
        <span className="font-medium">{item.name}</span>
        <span className="text-sm text-slate-500">{item.quantity} {item.unit}</span>
      </label>
      <button className="ml-2 text-slate-400 hover:text-slate-600">
        <i className="fas fa-ellipsis-v"></i>
      </button>
    </div>
  );
}
