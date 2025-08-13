import React from "react";
import SubjectCard from "../../components/ui/SubjectCard";
import { CubeTransparentIcon, CalculatorIcon, BeakerIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
      <SubjectCard
        color="bg-sky-500"
        hoverColor="group-hover:bg-sky-400"
        icon={<CalculatorIcon className="h-10 w-10 text-white" />}
        text="Math"
        description="Master your skills with interactive problems."
        link="/math" // Example route
      />
      <SubjectCard
        color="bg-green-500"
        hoverColor="group-hover:bg-green-400"
        icon={<CubeTransparentIcon className="h-10 w-10 text-white" />}
        text="Physics"
        description="Discover the laws that govern the universe."
        link="/physics" // Example route
      />
      <SubjectCard
        color="bg-yellow-500"
        hoverColor="group-hover:bg-yellow-400"
        icon={<BeakerIcon className="h-10 w-10 text-white" />}
        text="Chemistry"
        description="Explore experiments and chemical reactions."
        link="/chemistry" // Example route
      />
      <SubjectCard
        color="bg-purple-500"
        hoverColor="group-hover:bg-purple-400"
        icon={<SparklesIcon className="h-10 w-10 text-white" />}
        text="Biology"
        description="Learn about life, organisms, and ecosystems."
        link="/biology" // Example route
      />
    </div>
  );
} 