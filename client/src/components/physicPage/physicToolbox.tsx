import React from "react";
import Item from "./toolBoxItems";


interface ToolboxProps {
  simulationObjects: string[];
  selectedTopic: string | null;
  onObjectSelect: (object: string) => void;
}

const Toolbox: React.FC<ToolboxProps> = ({ simulationObjects, selectedTopic, onObjectSelect }) => {
  return (
    <div className="p-4 border rounded bg-white w-full max-w-md">
      <h2 className="text-lg font-bold mb-4 text-center">
        {selectedTopic
          ? `${selectedTopic.charAt(0).toUpperCase() + selectedTopic.slice(1)} Toolbox`
          : "Toolbox"}
      </h2>
      {simulationObjects.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {simulationObjects.map((obj, index) => (
            <Item key={index} object={obj} onObjectSelect={onObjectSelect} />
          ))}
        </div>
      ) : (
        <p className="text-center">No simulation objects available.</p>
      )}
    </div>
  );
};

export default Toolbox;