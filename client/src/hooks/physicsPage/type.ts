import type { Dispatch, SetStateAction } from "react";
import type { PhysicsData } from "../../data/physicsData";
import type { Attribute } from "../../data/physicConfig";

export type ToolKind = "object" | "globalTool" | "objectTool";
export type AttributeValue = number | string | boolean | { x: number; y: number };
export type AttributeMap = Record<string, AttributeValue>;
export type DragItemType = "object" | "objectTool";

export interface PhysicsPageLogic {
  selectedTopic: string | null;
  selectedSubtopic: string | null;

  selectedObjects: { id: string; type: string }[];
  selectedGlobalTools: { id: string; type: string }[];
  selectedObjectTools: { id: string; type: string; targetObjectId?: string }[];

  showPopup: boolean;
  popupItem: { id: string; type: string; kind: ToolKind; targetObjectId?: string } | null;

  isSimulationRunning: boolean;
  canvasResetTrigger: number;

  physicsData: PhysicsData;
  objectAttributes: Record<string, AttributeMap>;
  globalToolAttributes: Record<string, AttributeMap>;
  objectToolAttributes: Record<string, AttributeMap>;

  handleTopicSelect: (topic: string) => void;
  handleSubtopicSelect: (subtopic: string | null) => void;
  handleObjectSelect: (object: string) => void;

  handleGlobalToolSelect: (tool: string) => void;
  handleObjectToolSelect: (tool: string, targetObjectId?: string) => void;

  handlePopupClose: () => void;
  handlePopupSave: (data: {
    object: AttributeMap; // Changed from 'attributes' to 'object'
    tools: { id: string; attributes: AttributeMap }[];
  }) => void;

  handleAttributeChange: (
    key: string,
    value: AttributeValue | { x: string | number; y: string | number },
    section: string // Added 'section' parameter
  ) => void;

  handleRunSimulation: () => void;
  handleStopSimulation: () => void;
  handleResetSimulation: () => void;

  getAttributesConfig: (item: string | null, kind: ToolKind) => Attribute[];
  setIsSimulationRunning: Dispatch<SetStateAction<boolean>>;
  showCoordinates: boolean;
  toggleCoordinates: () => void;
  getCurrentSimulation: () => any;

  gravity: { enabled: boolean; magnitude: number; direction: number };
  updateGravity: (newValues: Partial<{ enabled: boolean; magnitude: number; direction: number }>) => void;
}