// src/components/physicPage/PhysicsToolbox.tsx
import React from "react";

import type { PhysicsPageLogic } from "../../hooks/physicsPage/type";
import Item from "./toolBoxItems";

interface ToolboxProps {
  simulations: { objects: string[]; supportTools: string[]; subtopics?: string[] };
  selectedSubtopic: string | null;
  selectedObjects: { id: string; type: string }[];
  selectedSupportTools: { id: string; type: string }[];
  onSubtopicSelect: (subtopic: string | null) => void;
  onObjectSelect: (item: string) => void;
  onSupportToolSelect: (item: string) => void;
  isSupportToolToolbox: boolean;
}

const Toolbox: React.FC<ToolboxProps> = ({
  simulations,
  selectedSubtopic,
  selectedObjects,
  selectedSupportTools,
  onSubtopicSelect,
  onObjectSelect,
  onSupportToolSelect,
  isSupportToolToolbox,
}) => {
  const items = isSupportToolToolbox ? simulations.supportTools : simulations.objects;
  const selectedItem = isSupportToolToolbox
    ? selectedSupportTools[0]?.type
    : selectedObjects[0]?.type;

  return (
    <div className="p-4 border rounded bg-white w-64 flex-shrink-0 z-10 max-h-[calc(100vh-12rem)] overflow-y-auto">
      <h2 className="text-lg font-bold mb-4 text-center">
        {isSupportToolToolbox ? "Support Tools" : simulations.subtopics ? "Subtopics" : "Objects"}
      </h2>
      {simulations.subtopics ? (
        <div className="grid grid-cols-1 gap-2">
          {simulations.subtopics.map((subtopic) => (
            <button
              key={subtopic}
              onClick={() => onSubtopicSelect(subtopic)}
              className={`p-2 rounded text-center transition-colors ${
                selectedSubtopic === subtopic
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {subtopic}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-2 gap-2 w-full">
            {items.length > 0 ? (
              items.map((item, index) => (
                <Item
                  key={index}
                  object={item}
                  onObjectSelect={isSupportToolToolbox ? onSupportToolSelect : onObjectSelect}
                  isSelected={selectedItem === item}
                />
              ))
            ) : (
              <p className="text-center col-span-2">
                No {isSupportToolToolbox ? "support tools" : "objects"} available.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbox;