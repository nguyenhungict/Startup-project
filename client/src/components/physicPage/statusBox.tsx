import React from "react";

interface StatusBoxProps {
  selectedObject: string | null;
}

const StatusBox: React.FC<StatusBoxProps> = ({ selectedObject }) => {
  return (
    <div className="h-[calc(25vh-1rem)] bg-white rounded-lg shadow-md p-3 overflow-y-auto">
      <h2 className="text-base font-semibold text-gray-900 mb-2">Experiment Status</h2>
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          {selectedObject
            ? `Selected Object: ${selectedObject}`
            : "No object selected. Drag an object to the canvas to start the experiment."}
        </p>
        {/* Sample content to demonstrate scrolling */}
        {[...Array(10)].map((_, i) => (
          <p key={i} className="text-sm text-gray-600">
            Status update {i + 1}: {selectedObject ? `${selectedObject} is active` : "Waiting for object selection"}.
          </p>
        ))}
      </div>
    </div>
  );
};

export default StatusBox;