import { Link } from "react-router-dom";
import { LogIn, LogOut, User } from "lucide-react";
import { Button } from "../ui/button";

interface AuthButtonsProps {
  isLoggedIn: boolean;
  handleLogout: () => Promise<void>;
  className?: string;
}

export const AuthButtons = ({ isLoggedIn, handleLogout, className = "" }: AuthButtonsProps) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isLoggedIn ? (
        <>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <User className="mr-2 h-4 w-4" />
              Admin Panel
            </Button>
          </Link>
        </>
      ) : (
        <>
          <Link to="/login">
            <Button variant="outline" size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="default" size="sm">
              <User className="mr-2 h-4 w-4" />
              Register
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};