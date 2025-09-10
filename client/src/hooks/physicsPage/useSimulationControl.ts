import { useState, type Dispatch, type SetStateAction } from "react";

interface SimulationControlState {
  isSimulationRunning: boolean;
  canvasResetTrigger: number;
  handleRunSimulation: () => void;
  handleStopSimulation: () => void;
  handleResetSimulation: () => void;
  setIsSimulationRunning: Dispatch<SetStateAction<boolean>>;
  gravity: { enabled: boolean; magnitude: number; direction: number };
  updateGravity: (newValues: Partial<{ enabled: boolean; magnitude: number; direction: number }>) => void;
}

export const useSimulationControl = (): SimulationControlState => {
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [canvasResetTrigger, setCanvasResetTrigger] = useState(0);
  const [gravity, setGravity] = useState({
    enabled: true,
    magnitude: 9.81,
    direction: 270,
  });

  const handleRunSimulation = () => {
    setIsSimulationRunning(true);
  };

  const handleStopSimulation = () => {
    setIsSimulationRunning(false);
  };

  const handleResetSimulation = () => {
    setCanvasResetTrigger((prev) => prev + 1);
    setIsSimulationRunning(false);
    setGravity({ enabled: true, magnitude: 9.81, direction: 270 });
  };

  const updateGravity = (newValues: Partial<typeof gravity>) => {
    setGravity((prev) => ({ ...prev, ...newValues }));
  };

  return {
    isSimulationRunning,
    canvasResetTrigger,
    handleRunSimulation,
    handleStopSimulation,
    handleResetSimulation,
    setIsSimulationRunning,
    gravity,
    updateGravity,
  };
};