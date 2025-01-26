import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "./ui/navigation-menu";
import { LogIn, LogOut, UserPlus, User, FileText, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "./ui/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export default function Navbar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      setIsMobileMenuOpen(false);
    } catch (error) {
      toast({
        title: "Error logging out",
        variant: "destructive",
      });
    }
  };

  const NavItems = () => (
    <>
      {user ? (
        <>
          <NavigationMenuItem>
            <Button
              variant="outline"
              onClick={() => {
                navigate("/resume-builder");
                setIsMobileMenuOpen(false);
              }}
              className="w-full border-2 border-[#452095] text-[#452095] hover:bg-[#452095] hover:text-white"
            >
              <FileText className="mr-2" />
              Resume Builder
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button
              variant="outline"
              onClick={() => {
                navigate("/profile");
                setIsMobileMenuOpen(false);
              }}
              className="w-full border-2 border-[#452095] text-[#452095] hover:bg-[#452095] hover:text-white"
            >
              <User className="mr-2" />
              Profile
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-[#e59b7d] to-[#452095] hover:opacity-90"
            >
              <LogOut className="mr-2" />
              Logout
            </Button>
          </NavigationMenuItem>
        </>
      ) : (
        <>
          <NavigationMenuItem>
            <Button
              onClick={() => {
                navigate("/auth/login");
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-gradient-to-r from-[#e59b7d] to-[#452095] hover:opacity-90"
            >
              <LogIn className="mr-2" />
              Login
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button
              onClick={() => {
                navigate("/auth/signup");
                setIsMobileMenuOpen(false);
              }}
              variant="outline"
              className="w-full border-2 border-[#452095] text-[#452095] hover:bg-[#452095] hover:text-white"
            >
              <UserPlus className="mr-2" />
              Sign Up
            </Button>
          </NavigationMenuItem>
        </>
      )}
    </>
  );

  return (
    <NavigationMenu className="max-w-full w-full justify-between px-4 py-2 border-b">
      <NavigationMenuList>
        <NavigationMenuItem 
          className="font-bold text-xl cursor-pointer" 
          onClick={() => navigate("/")}
        >
          Resume Builder
        </NavigationMenuItem>
      </NavigationMenuList>

      {/* Desktop Navigation */}
      <NavigationMenuList className="hidden md:flex space-x-2">
        <NavItems />
      </NavigationMenuList>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] sm:w-[385px]">
            <NavigationMenuList className="mt-6 flex flex-col space-y-4">
              <NavItems />
            </NavigationMenuList>
          </SheetContent>
        </Sheet>
      </div>
    </NavigationMenu>
  );
}