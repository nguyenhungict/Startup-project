import React from "react";
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/solid";

interface SimulationControlsProps {
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  showCoordinates: boolean;
  onToggleCoordinates: () => void;

  // Gravity toggle
  isGravityEnabled: boolean;
  onToggleGravity: () => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  onRun,
  onStop,
  onReset,
  showCoordinates,
  onToggleCoordinates,
  isGravityEnabled,
  onToggleGravity,
}) => {
  return (
    <div className="bg-white border border-gray-300 px-4 py-3 flex flex-wrap justify-center gap-4">
      {/* Run Button */}
      <div
        onClick={onRun}
        className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:cursor-pointer hover:shadow-xl hover:scale-105 transition-all ${
          isRunning
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600 text-white"
        }`}
        aria-disabled={isRunning}
      >
        <PlayIcon className="h-6 w-6 text-current font-bold" />
      </div>

      {/* Stop Button */}
      <div
        onClick={onStop}
        className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:cursor-pointer hover:shadow-xl hover:scale-105 transition-all ${
          !isRunning
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
        aria-disabled={!isRunning}
      >
        <PauseIcon className="h-6 w-6 text-current" />
      </div>

      {/* Reset Button */}
      <div
        onClick={onReset}
        className="w-12 h-12 flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg hover:cursor-pointer hover:shadow-xl hover:scale-105 transition-all text-white"
      >
        <ArrowPathIcon className="h-6 w-6 text-current" />
      </div>

      {/* Toggle Coordinates */}
      <div
        onClick={onToggleCoordinates}
        className="w-12 h-12 flex items-center justify-center bg-purple-500 hover:bg-purple-600 rounded-full shadow-lg hover:cursor-pointer hover:shadow-xl hover:scale-105 transition-all text-white"
      >
        {showCoordinates ? (
          <EyeIcon className="h-6 w-6 text-current" />
        ) : (
          <EyeSlashIcon className="h-6 w-6 text-current" />
        )}
      </div>

      {/* Toggle Gravity */}
      <div
        onClick={onToggleGravity}
        className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:cursor-pointer hover:shadow-xl hover:scale-105 transition-all ${
          isGravityEnabled
            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
            : "bg-gray-400 hover:bg-gray-500 text-white"
        }`}
      >
        <GlobeAltIcon className="h-6 w-6 text-current" />
      </div>
    </div>
  );
};

export default SimulationControls;
