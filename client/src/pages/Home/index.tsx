import React from "react";
import SubjectCard from "../../components/HomePage/SubjectCard";
import { CubeTransparentIcon, CalculatorIcon, BeakerIcon, SparklesIcon } from "@heroicons/react/24/outline";
import HeroSection from "../../components/HomePage/herosection";
import AboutUs from "../../components/HomePage/aboutUs";
import Pricing from "../../components/HomePage/pricingSection";
import FAQ from "../../components/HomePage/faqSection";
import Footer from "../../components/HomePage/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white pt-12">
       <HeroSection />
      {/* Sử dụng container với max-width và center */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
          <SubjectCard
            color="bg-sky-500"
            hoverColor="group-hover:bg-sky-400"
            icon={<CalculatorIcon className="h-10 w-10 text-white" />}
            text="Math"
            description="Master your skills with interactive problems."
            link="/math"
          />
          <SubjectCard
            color="bg-amber-500"
            hoverColor="group-hover:bg-amber-400"
            icon={<CubeTransparentIcon className="h-10 w-10 text-white" />}
            text="Physics"
            description="Discover the laws that govern the universe."
            link="/physics"
          />
          <SubjectCard
            color="bg-indigo-500"
            hoverColor="group-hover:bg-indigo-400"
            icon={<BeakerIcon className="h-10 w-10 text-white" />}
            text="Chemistry"
            description="Explore experiments and chemical reactions."
            link="/chemistry"
          />
          <SubjectCard
            color="bg-teal-500"
            hoverColor="group-hover:bg-teal-400"
            icon={<SparklesIcon className="h-10 w-10 text-white" />}
            text="Biology"
            description="Learn about life, organisms, and ecosystems."
            link="/biology"
          />
        </div>
      </div>
      <AboutUs/>
      <Pricing/>
      <FAQ/>
      <Footer/>
    </div>
  );
}