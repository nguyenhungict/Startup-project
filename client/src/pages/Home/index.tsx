import React from "react";
import SubjectCard from "../../components/ui/SubjectCard";
import { CubeTransparentIcon, CalculatorIcon, BeakerIcon, SparklesIcon } from "@heroicons/react/24/outline";
import HeroSection from "../../components/ui/herosection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white py-12">
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
            color="bg-green-500"
            hoverColor="group-hover:bg-green-400"
            icon={<CubeTransparentIcon className="h-10 w-10 text-white" />}
            text="Physics"
            description="Discover the laws that govern the universe."
            link="/physics"
          />
          <SubjectCard
            color="bg-yellow-500"
            hoverColor="group-hover:bg-yellow-400"
            icon={<BeakerIcon className="h-10 w-10 text-white" />}
            text="Chemistry"
            description="Explore experiments and chemical reactions."
            link="/chemistry"
          />
          <SubjectCard
            color="bg-purple-500"
            hoverColor="group-hover:bg-purple-400"
            icon={<SparklesIcon className="h-10 w-10 text-white" />}
            text="Biology"
            description="Learn about life, organisms, and ecosystems."
            link="/biology"
          />
        </div>
      </div>
    </div>
  );
}