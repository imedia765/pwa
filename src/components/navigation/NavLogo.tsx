import { Link } from "react-router-dom";

export const NavLogo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        PWA Burton
      </span>
    </Link>
  );
};