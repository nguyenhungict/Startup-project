
// src/components/physicPage/PhysicsSidebar.tsx
import React, { type JSX } from "react";
import { CogIcon, ChartBarIcon, SpeakerWaveIcon, LightBulbIcon, BoltIcon, FireIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

import type { PhysicsData } from "../../data/physicsData";
import NavItem from "../ui/navItem";

interface PhysicsSidebarProps {
  physicsData: PhysicsData;
  onTopicSelect: (topicId: string) => void;
  selectedTopic: string | null;
}

export default function PhysicsSidebar({ physicsData, onTopicSelect, selectedTopic }: PhysicsSidebarProps) {
  const icons: { [key: string]: JSX.Element } = {
    mechanics: <CogIcon className="h-6 w-6" />,
    "oscillations-waves": <ChartBarIcon className="h-6 w-6" />,
    sound: <SpeakerWaveIcon className="h-6 w-6" />,
    optics: <LightBulbIcon className="h-6 w-6" />,
    electricity: <BoltIcon className="h-6 w-6" />,
    electromagnetism: (
      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 4h4v4h-4V4zm0 12h4v4h-4v-4zm-6-6h4v4H4v-4zm12 0h4v4h-4v-4z" />
      </svg>
    ),
    thermodynamics: <FireIcon className="h-6 w-6" />,
    "astronomy-earth": <GlobeAltIcon className="h-6 w-6" />,
  };

  const physicsTopics = Object.keys(physicsData).map((id) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1).replace("-", " "),
    icon: icons[id] || <CogIcon className="h-6 w-6" />,
  }));

  return (
    <aside className="w-20 bg-white border-r border-gray-200 hover:w-64 transition-all duration-300 ease-in-out group z-10">
      <div className="h-full flex flex-col items-center py-4">
        <nav className="flex-1 w-full px-2 space-y-2 mt-6">
          {physicsTopics.map((item) => (
            <NavItem
              key={item.id}
              topicId={item.id}
              label={item.label}
              icon={item.icon}
              onSelect={onTopicSelect}
              isSelected={selectedTopic === item.id}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
