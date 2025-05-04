import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function LogoutButton() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Show success message
    toast({
      title: "Success",
      description: "Logged out successfully"
    });
    
    // Redirect to auth page
    setLocation('/auth');
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout}
      className="ml-4"
    >
      Logout
    </Button>
  );
} 