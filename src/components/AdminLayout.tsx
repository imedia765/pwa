import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ProfileCompletionGuard } from "./auth/ProfileCompletionGuard";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="default" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Menu className="h-5 w-5 mr-2" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[385px]">
              <div className="flex flex-col gap-4 p-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
                  Admin Navigation
                </h2>
                <Button
                  variant="outline"
                  className="justify-start bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  onClick={() => handleNavigation("/admin/members")}
                >
                  Members
                </Button>
                <Button
                  variant="outline"
                  className="justify-start bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                  onClick={() => handleNavigation("/admin/collectors")}
                >
                  Collectors
                </Button>
                <Button
                  variant="outline"
                  className="justify-start bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                  onClick={() => handleNavigation("/admin/registrations")}
                >
                  Registrations
                </Button>
                <Button
                  variant="outline"
                  className="justify-start bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                  onClick={() => handleNavigation("/admin/profile")}
                >
                  Profile
                </Button>
                <Button
                  variant="outline"
                  className="justify-start bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
                  onClick={() => handleNavigation("/admin/database")}
                >
                  Database
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <ProfileCompletionGuard>
          <Outlet />
        </ProfileCompletionGuard>
      </main>
      <Footer />
    </div>
  );
};