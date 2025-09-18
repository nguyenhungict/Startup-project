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
  onObjectSelect: (item: string) => void;           // <- used for creating objects
  onGlobalToolSelect: (item: string) => void;
  setPendingToolType: (item: string) => void;
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
  setPendingToolType,
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

  const handleItemClick = (item: string) => {
    if (activeToolbox === "object") {
      onObjectSelect(item); // ✅ create a new object
    } else if (activeToolbox === "globalTool") {
      onGlobalToolSelect(item);
    } else if (activeToolbox === "objectTool") {
      setPendingToolType(item);
    } else {
      onSubtopicSelect(item);
    }
  };

  const gridClasses =
    activeToolbox === "object" || activeToolbox === "globalTool" || activeToolbox === "objectTool"
      ? "grid-cols-2"
      : "grid-cols-1";

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

      <div className={`grid gap-2 w-full ${gridClasses}`}>
        {items.length > 0 ? (
          items.map((item, index) => (
            <Item
              key={index}
              object={item}
              onObjectSelect={() => handleItemClick(item)}
              isSelected={selectedItem === item}
              kind={activeToolbox === "object" ? "object" : "subtopic"}
            />
          ))
        ) : (
          <p className="text-center col-span-2">
            No {activeToolbox === "object"
                ? "objects"
                : activeToolbox === "globalTool"
                ? "global tools"
                : activeToolbox === "objectTool"
                ? "object tools"
                : "subtopics"} available.
          </p>
        )}
      </div>
    </div>
  );
};

export default Toolbox;
