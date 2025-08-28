import { useState, type Dispatch, type SetStateAction } from "react";

interface SimulationControlState {
  isSimulationRunning: boolean;
  canvasResetTrigger: number;
  handleRunSimulation: () => void;
  handleStopSimulation: () => void;
  handleResetSimulation: () => void;
  setIsSimulationRunning: Dispatch<SetStateAction<boolean>>;
}

export const useSimulationControl = (): SimulationControlState => {
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [canvasResetTrigger, setCanvasResetTrigger] = useState(0);

  const handleRunSimulation = () => {
    setIsSimulationRunning(true);
  };

  const handleStopSimulation = () => {
    setIsSimulationRunning(false);
  };

  const handleResetSimulation = () => {
    setCanvasResetTrigger((prev) => prev + 1);
    setIsSimulationRunning(false);
  };

  return {
    isSimulationRunning,
    canvasResetTrigger,
    handleRunSimulation,
    handleStopSimulation,
    handleResetSimulation,
    setIsSimulationRunning,
  };
};