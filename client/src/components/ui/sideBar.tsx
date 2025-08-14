import React from "react";

import { CogIcon, ChartBarIcon, SpeakerWaveIcon, LightBulbIcon, BoltIcon, FireIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import NavItem from "./navItem";

interface SidebarProps {
  onTopicSelect: (topicId: string) => void;
}

export default function Sidebar({ onTopicSelect }: SidebarProps) {
  const physicsTopics = [
    { id: "mechanics", icon: <CogIcon className="h-6 w-6" /> },
    { id: "oscillations-waves", icon: <ChartBarIcon className="h-6 w-6" /> },
    { id: "sound", icon: <SpeakerWaveIcon className="h-6 w-6" /> },
    { id: "optics", icon: <LightBulbIcon className="h-6 w-6" /> },
    { id: "electricity", icon: <BoltIcon className="h-6 w-6" /> },
    {
      id: "electromagnetism",
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 4h4v4h-4V4zm0 12h4v4h-4v-4zm-6-6h4v4H4v-4zm12 0h4v4h-4v-4z" />
        </svg>
      ),
    },
    { id: "thermodynamics", icon: <FireIcon className="h-6 w-6" /> },
    { id: "astronomy-earth", icon: <GlobeAltIcon className="h-6 w-6" /> },
  ];

  return (
    <aside className="w-20 bg-white border-r border-gray-200">
      <div className="h-full flex flex-col items-center py-4">

        {/* Topics */}
        <nav className="flex-1 w-full px-2 space-y-2 mt-6">
          {physicsTopics.map((item) => (
            <NavItem
              key={item.id}
              topicId={item.id}
              icon={item.icon}
              onSelect={onTopicSelect}
            />
          ))}
        </nav>

        
      </div>
    </aside>
  );
}