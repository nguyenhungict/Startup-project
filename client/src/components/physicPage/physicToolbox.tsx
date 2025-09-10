
// src/components/physicPage/PhysicsToolbox.tsx
import React from "react";
import Item from "./toolBoxItems";

interface ToolboxProps {
  simulations: {
    objects: string[];
    globalTools: string[];
    objectTools: string[];
    subtopics?: string[];
  };
  selectedSubtopic: string | null;
  selectedObjects: { id: string; type: string }[];
  selectedGlobalTools: { id: string; type: string }[];
  selectedObjectTools: { id: string; type: string; targetObjectId?: string }[];
  onSubtopicSelect: (subtopic: string | null) => void;
  onObjectSelect: (item: string) => void;
  onGlobalToolSelect: (item: string) => void;
  onObjectToolSelect: (item: string, targetObjectId?: string) => void;
  activeToolbox: "subtopic" | "object" | "globalTool" | "objectTool";
}

const Toolbox: React.FC<ToolboxProps> = ({
  simulations,
  selectedSubtopic,
  selectedObjects,
  selectedGlobalTools,
  selectedObjectTools,
  onSubtopicSelect,
  onObjectSelect,
  onGlobalToolSelect,
  onObjectToolSelect,
  activeToolbox,
}) => {
  const items =
    activeToolbox === "object"
      ? simulations.objects
      : activeToolbox === "globalTool"
      ? simulations.globalTools
      : activeToolbox === "objectTool"
      ? simulations.objectTools
      : simulations.subtopics || [];

  const selectedItem =
    activeToolbox === "object"
      ? selectedObjects[0]?.type
      : activeToolbox === "globalTool"
      ? selectedGlobalTools[0]?.type
      : activeToolbox === "objectTool"
      ? selectedObjectTools[0]?.type
      : selectedSubtopic;

  return (
    <div className="p-4 border rounded bg-white w-64 flex-shrink-0 z-10 max-h-[calc(100vh-12rem)] overflow-y-auto">
      <h2 className="text-lg font-bold mb-4 text-center">
        {activeToolbox === "subtopic"
          ? "Subtopics"
          : activeToolbox === "object"
          ? "Objects"
          : activeToolbox === "globalTool"
          ? "Global Tools"
          : "Object Tools"}
      </h2>
      {activeToolbox === "subtopic" ? (
        <div className="grid grid-cols-1 gap-2">
          {simulations.subtopics?.map((subtopic) => (
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
                  onObjectSelect={
                    activeToolbox === "object"
                      ? () => onObjectSelect(item)
                      : activeToolbox === "globalTool"
                      ? () => onGlobalToolSelect(item)
                      : () => onObjectToolSelect(item)
                  }
                  isSelected={selectedItem === item}
                />
              ))
            ) : (
              <p className="text-center col-span-2">
                No {activeToolbox === "object" ? "objects" : activeToolbox === "globalTool" ? "global tools" : "object tools"} available.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbox;
