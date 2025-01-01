import { Link, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, UserCheck, ClipboardList, Database, DollarSign, UserCircle, ChevronDown, HeadsetIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { UserRole } from "@/types/roles";

// Define menu items with role restrictions
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/admin", roles: ["admin", "collector"] },
  { icon: Users, label: "Members", to: "/admin/members", roles: ["admin", "collector"] },
  { icon: UserCheck, label: "Collectors", to: "/admin/collectors", roles: ["admin"] },
  { icon: ClipboardList, label: "Registrations", to: "/admin/registrations", roles: ["admin"] },
  { icon: Database, label: "Database", to: "/admin/database", roles: ["admin"] },
  { icon: DollarSign, label: "Finance", to: "/admin/finance", roles: ["admin", "collector"] },
  { icon: HeadsetIcon, label: "Support Tickets", to: "/admin/support", roles: ["admin"] },
  { icon: UserCircle, label: "Profile", to: "/admin/profile", roles: ["admin", "collector", "member"] },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setIsLoggedIn(false);
          navigate("/login");
          return;
        }

        if (!session) {
          setIsLoggedIn(false);
          navigate("/login");
          return;
        }

        // Get user role from members table instead of profiles
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('role')
          .eq('auth_user_id', session.user.id)
          .single();

        if (memberError) {
          console.error("Member fetch error:", memberError);
          setIsLoggedIn(false);
          navigate("/login");
          return;
        }

        setUserRole(member.role);
        setIsLoggedIn(true);

        // Check if current route is allowed for user's role
        const currentPath = window.location.pathname;
        const allowedPaths = menuItems.filter(item => item.roles.includes(member.role)).map(item => item.to);
        
        if (!allowedPaths.includes(currentPath) && currentPath !== "/admin/profile") {
          console.log("Access denied to path:", currentPath);
          navigate("/admin/profile");
          toast({
            title: "Access Restricted",
            description: "You don't have permission to access this page",
            variant: "destructive",
          });
        }

      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session);
      
      if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        setUserRole(null);
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  // Filter menu items based on user role
  const allowedMenuItems = menuItems.filter(item => userRole && item.roles.includes(userRole));

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                className="w-full justify-between h-12"
              >
                <span className="font-semibold">Menu</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(100vw-2rem)] max-w-[calc(1400px-4rem)]">
              {allowedMenuItems.map((item) => (
                <DropdownMenuItem
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className="flex items-center gap-3 cursor-pointer py-3 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 text-base"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <main className="flex-1">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}