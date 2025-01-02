import React from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { LoginForm } from "./auth/LoginForm";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-background py-16 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50" />
      <div className="container mx-auto relative z-10">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-primary">
            Pakistan Welfare Association
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Welcome to our community platform. Please login with your member number.
          </p>
          <div className="flex flex-col items-center justify-center space-y-6">
            <LoginForm />
            <Button
              variant="outline"
              className="hover:bg-accent"
              asChild
            >
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};