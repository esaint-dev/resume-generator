import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "./ui/navigation-menu";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "./ui/use-toast";

export default function Navbar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error logging out",
        variant: "destructive",
      });
    }
  };

  return (
    <NavigationMenu className="max-w-full w-full justify-between px-4 py-2 border-b">
      <NavigationMenuList>
        <NavigationMenuItem className="font-bold text-xl cursor-pointer" onClick={() => navigate("/")}>
          Resume Builder
        </NavigationMenuItem>
      </NavigationMenuList>

      <NavigationMenuList className="space-x-2">
        {user ? (
          <NavigationMenuItem>
            <Button
              onClick={handleLogout}
              className="bg-gradient-to-r from-[#e59b7d] to-[#452095] hover:opacity-90"
            >
              <LogOut className="mr-2" />
              Logout
            </Button>
          </NavigationMenuItem>
        ) : (
          <>
            <NavigationMenuItem>
              <Button
                onClick={() => navigate("/auth/login")}
                className="bg-gradient-to-r from-[#e59b7d] to-[#452095] hover:opacity-90"
              >
                <LogIn className="mr-2" />
                Login
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button
                onClick={() => navigate("/auth/signup")}
                variant="outline"
                className="border-2 border-[#452095] text-[#452095] hover:bg-[#452095] hover:text-white"
              >
                <UserPlus className="mr-2" />
                Sign Up
              </Button>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}