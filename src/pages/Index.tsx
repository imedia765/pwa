import React from "react";
import { Hero } from "../components/Hero";
import { NewsSection } from "../components/NewsSection";
import { Footer } from "../components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#1a1f2c]">
      <Hero />
      <NewsSection />
      <Footer />
    </div>
  );
};

export default Index;