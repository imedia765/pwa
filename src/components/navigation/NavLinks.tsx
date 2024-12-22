import { Link } from "react-router-dom";
import { Link2Icon, InfoIcon, Stethoscope } from "lucide-react";

export const NavLinks = () => {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <Link 
        to="/terms" 
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
        <Link2Icon className="h-4 w-4" />
        Terms
      </Link>
      <Link 
        to="/collector-responsibilities" 
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
        <InfoIcon className="h-4 w-4" />
        Collector Info
      </Link>
      <Link 
        to="/medical-examiner-process" 
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
        <Stethoscope className="h-4 w-4" />
        Medical Process
      </Link>
    </div>
  );
};