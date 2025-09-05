import type { Dispatch, SetStateAction } from "react";
import type { PhysicsData } from "../../data/physicsData";
import type { Attribute } from "../../data/physicConfig";

export interface PhysicsPageLogic {
  selectedTopic: string | null;
  selectedSubtopic: string | null;
  selectedObjects: { id: string; type: string }[];
  selectedSupportTools: { id: string; type: string }[];
  showPopup: boolean;
  popupItem: { id: string; type: string; isSupportTool: boolean } | null;
  isSimulationRunning: boolean;
  canvasResetTrigger: number;
  physicsData: PhysicsData;
  objectAttributes: Record<string, Record<string, number | string | boolean | { x: number; y: number }>>;
  supportToolAttributes: Record<string, Record<string, number | string | boolean | { x: number; y: number }>>;
  
  handleTopicSelect: (topic: string) => void;
  handleSubtopicSelect: (subtopic: string | null) => void;
  handleObjectSelect: (object: string) => void;
  handleSupportToolSelect: (supportTool: string) => void;
  
  handlePopupClose: () => void;
  handlePopupSave: (attributes: Record<string, number | string | boolean | { x: number; y: number }>) => void;
  handleAttributeChange: (key: string, value: number | string | boolean | { x: string | number; y: string | number }) => void;
  handleRunSimulation: () => void;
  handleStopSimulation: () => void;
  handleResetSimulation: () => void;
  getAttributesConfig: (item: string | null, isForce: boolean) => Attribute[];
  setIsSimulationRunning: Dispatch<SetStateAction<boolean>>;
  showCoordinates: boolean; // New
  toggleCoordinates: () => void; // New
}