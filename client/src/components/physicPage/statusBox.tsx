// src/components/physicPage/StatusBox.tsx
import React from "react";
import type { PhysicsPageLogic } from "../../hooks/physicsPage/type";

interface StatusBoxProps {
  selectedObjects: { id: string; type: string }[];
  selectedSupportTools: { id: string; type: string }[];
  objectAttributes: Record<string, Record<string, any>>;
}

const StatusBox: React.FC<StatusBoxProps> = ({
  selectedObjects,
  selectedSupportTools,
  objectAttributes,
}) => {
  return (
    <div className="h-[calc(25vh-1rem)] bg-white rounded-lg shadow-md p-3 overflow-y-auto">
      <h2 className="text-base font-semibold text-gray-900 mb-2">Experiment Status</h2>
      <div className="space-y-2">
        {selectedObjects.length > 0 ? (
          selectedObjects.map((obj) => (
            <div key={obj.id} className="text-sm text-gray-600">
              <p>Object: {obj.type}</p>
              {objectAttributes[obj.id] && (
                <>
                  <p>Position: ({(objectAttributes[obj.id].position?.x ?? 0).toFixed(1)}, {(objectAttributes[obj.id].position?.y ?? 0).toFixed(1)})</p>
                  <p>Velocity: {(objectAttributes[obj.id].velocityX ?? 0).toFixed(1)}, {(objectAttributes[obj.id].velocityY ?? 0).toFixed(1)}</p>
                </>
              )}
            </div>
          ))
        ) : selectedSupportTools.length > 0 ? (
          selectedSupportTools.map((tool) => (
            <p key={tool.id} className="text-sm text-gray-600">Selected Tool: {tool.type}</p>
          ))
        ) : (
          <p className="text-sm text-gray-600">
            No object or tool selected. Select from the toolbox to start the experiment.
          </p>
        )}
      </div>
    </div>
  );
};

export default StatusBox;