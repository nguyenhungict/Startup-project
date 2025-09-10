// src/hooks/physicsPage/useSimulation.ts
import { useState, useEffect, useRef } from "react";
import { useTopicSelection } from "./useTopicSelection";
import { useSubtopicSelection } from "./useSubtopicSelection";
import { useObjectSelection } from "./useObjectsSelection";
import { useAttributeForm } from "./useAttributeForm";
import { useSimulationControl } from "./useSimulationControl";
import { getAttributesConfig } from "../../data/physicConfig";
import { physicsData, type PhysicsData } from "../../data/physicsData";
import { KinematicSimulationManager } from "../../Model/physic/Topic/Mechanics/Kinematics/kinematicSimulationManaGer";
import type { PhysicsPageLogic,ToolKind } from "./type";

export type SupportTool = {
  id: string;
  type: string;
  targetObjectId?: string;
};

export const getCurrentSimulationData = (
  physicsData: PhysicsData,
  selectedTopic: string | null,
  selectedSubtopic: string | null
) => {
  const defaultSimulation = {
    objects: [],
    globalTools: [],
    objectTools: [],
    subtopics: [],
  };

  if (!selectedTopic) return defaultSimulation;

  const topicData = physicsData[selectedTopic];
  if (!topicData) return defaultSimulation;

  if (!selectedSubtopic) {
    return {
      objects: [],
      globalTools: ["Gravity"],
      objectTools: [],
      subtopics: Object.keys(topicData),
    };
  }

  const subtopicData = topicData[selectedSubtopic];
  if (!subtopicData) return defaultSimulation;

  return {
    objects: subtopicData.objects || [],
    globalTools: subtopicData.globalTools || [],
    objectTools: subtopicData.objectTools || [],
    subtopics: [],
  };
};

export const useSimulation = (): PhysicsPageLogic & {
  getCurrentSimulation: () => any;
  gravity: { enabled: boolean; magnitude: number; direction: number };
  updateGravity: (newValues: Partial<{ enabled: boolean; magnitude: number; direction: number }>) => void;
} => {
  const managerRef = useRef<KinematicSimulationManager | null>(null);
  if (!managerRef.current) {
    managerRef.current = new KinematicSimulationManager();
  }
  const manager = managerRef.current;

  const { selectedTopic, handleTopicSelect } = useTopicSelection();
  const { selectedSubtopic, handleSubtopicSelect } = useSubtopicSelection(selectedTopic);
  const {
    selectedObjects,
    selectedGlobalTools,
    selectedObjectTools,
    showPopup,
    popupItem,
    handleObjectSelect,
    handleGlobalToolSelect,
    handleObjectToolSelect,
    handlePopupClose,
    setSelectedObjects,
    setSelectedGlobalTools,
    setSelectedObjectTools,
  } = useObjectSelection() as {
    selectedObjects: { id: string; type: string }[];
    selectedGlobalTools: { id: string; type: string }[];
    selectedObjectTools: SupportTool[];
    showPopup: boolean;
    popupItem: any;
    handleObjectSelect: (object: string) => void;
    handleGlobalToolSelect: (tool: string) => void;
    handleObjectToolSelect: (tool: string, targetObjectId?: string) => void;
    handlePopupClose: () => void;
    setSelectedObjects: React.Dispatch<React.SetStateAction<{ id: string; type: string }[]>>;
    setSelectedGlobalTools: React.Dispatch<React.SetStateAction<{ id: string; type: string }[]>>;
    setSelectedObjectTools: React.Dispatch<React.SetStateAction<SupportTool[]>>;
  };

  const [objectAttributes, setObjectAttributes] = useState<Record<string, any>>({});
  const [globalToolAttributes, setGlobalToolAttributes] = useState<Record<string, any>>({});
  const [objectToolAttributes, setObjectToolAttributes] = useState<Record<string, any>>({});
  const {
    isSimulationRunning,
    canvasResetTrigger,
    handleRunSimulation: originalHandleRunSimulation,
    handleStopSimulation: originalHandleStopSimulation,
    handleResetSimulation: originalHandleResetSimulation,
    setIsSimulationRunning,
    gravity,
    updateGravity,
  } = useSimulationControl();
  const {
    formAttributes,
    handleAttributeChange,
    handlePopupSave: originalHandlePopupSave,
  } = useAttributeForm(
    popupItem,
    objectAttributes,
    { ...globalToolAttributes, ...objectToolAttributes },
    setObjectAttributes,
    (attrs) => {
      if (popupItem?.kind === "globalTool") {
        setGlobalToolAttributes(attrs);
      } else if (popupItem?.kind === "objectTool") {
        setObjectToolAttributes(attrs);
      }
    },
    handlePopupClose
  );

  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);

  const toggleCoordinates = () => {
    setShowCoordinates((prev) => !prev);
  };

  // Sync manager with topic/subtopic
  useEffect(() => {
    manager.setTopic(selectedTopic);
  }, [selectedTopic, manager]);

  useEffect(() => {
    manager.setSubtopic(selectedSubtopic);
  }, [selectedSubtopic, manager]);

  // Sync gravity with manager
  useEffect(() => {
    if (gravity.enabled) {
      manager.updateItem("gravity_global", "Gravity", {
        magnitude: gravity.magnitude,
        direction: gravity.direction,
        enabled: true,
      }, true);
    } else {
      manager.removeItem("gravity_global");
    }
  }, [gravity, manager]);

  // Sync objects, global tools, and object tools
  useEffect(() => {
    if (isSimulationRunning) return;

    selectedObjects.forEach((obj) => {
      const attrs = objectAttributes[obj.id] || {};
      manager.updateItem(obj.id, obj.type, attrs, false);
    });

    selectedGlobalTools.forEach((tool) => {
      const attrs = globalToolAttributes[tool.id] || {};
      manager.updateItem(tool.id, tool.type, attrs, true);
    });

    selectedObjectTools.forEach((tool) => {
      const attrs = objectToolAttributes[tool.id] || {};
      manager.updateItem(tool.id, tool.type, { ...attrs, targetObjectId: tool.targetObjectId }, true);
    });
  }, [
    selectedObjects,
    selectedGlobalTools,
    selectedObjectTools,
    objectAttributes,
    globalToolAttributes,
    objectToolAttributes,
    isSimulationRunning,
    manager,
  ]);

  // Update attributes during simulation
  useEffect(() => {
    let animationFrame: number | null = null;

    const updateAttributesFromSimulation = () => {
      if (!isSimulationRunning) return;
      const state = manager.getState();

      setObjectAttributes((prev) => {
        const newAttrs = { ...prev };
        state.forEach((item: any) => {
          if (newAttrs[item.id] && item.type !== "surface") {
            newAttrs[item.id] = {
              ...newAttrs[item.id],
              position: { x: item.x, y: item.y },
              velocityX: item.velocityX,
              velocityY: item.velocityY,
              accelerationX: item.accelerationX,
              accelerationY: item.accelerationY,
              angle: item.angle,
              size: item.size,
              color: item.color,
            };
          }
        });
        return newAttrs;
      });

      animationFrame = requestAnimationFrame(updateAttributesFromSimulation);
    };

    if (isSimulationRunning) {
      animationFrame = requestAnimationFrame(updateAttributesFromSimulation);
    }
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isSimulationRunning, manager]);

  // Wrapped handlers
  const wrappedHandleTopicSelect = (topic: string) => {
    handleTopicSelect(topic);
    setSelectedObjects([]);
    setSelectedGlobalTools([]);
    setSelectedObjectTools([]);
    handlePopupClose();
    manager.setTopic(topic);
  };

  const wrappedHandleSubtopicSelect = (subtopic: string | null) => {
    handleSubtopicSelect(subtopic);
    setSelectedObjects([]);
    setSelectedGlobalTools([]);
    setSelectedObjectTools([]);
    handlePopupClose();
    manager.setSubtopic(subtopic);
  };

  const wrappedHandleObjectSelect = (object: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    handleObjectSelect(object);
    manager.addObjectFromType(object, id);
  };

  const wrappedHandleGlobalToolSelect = (tool: string) => {
    handleGlobalToolSelect(tool);
  };

  const wrappedHandleObjectToolSelect = (tool: string, targetObjectId?: string) => {
    handleObjectToolSelect(tool, targetObjectId);
  };

  const wrappedHandlePopupSave = (attributes: Record<string, any>) => {
    originalHandlePopupSave(attributes);
    if (popupItem) {
      manager.updateItem(popupItem.id, popupItem.type, attributes, popupItem.kind !== "object");
    }
  };

  const wrappedHandleRunSimulation = () => {
    originalHandleRunSimulation();
    manager.run();
  };

  const wrappedHandleStopSimulation = () => {
    originalHandleStopSimulation();
    manager.stop();
  };

  const wrappedHandleResetSimulation = () => {
    originalHandleResetSimulation();
    manager.reset();
    setSelectedObjects([]);
    setSelectedGlobalTools([]);
    setSelectedObjectTools([]);
    setObjectAttributes({});
    setGlobalToolAttributes({});
    setObjectToolAttributes({});
  };

  const getCurrentSimulation = () => {
    return getCurrentSimulationData(physicsData, selectedTopic, selectedSubtopic);
  };

  return {
    selectedTopic,
    selectedSubtopic,
    selectedObjects,
    selectedGlobalTools,
    selectedObjectTools,
    showPopup,
    popupItem,
    isSimulationRunning,
    canvasResetTrigger,
    physicsData,
    objectAttributes,
    globalToolAttributes,
    objectToolAttributes,
    handleTopicSelect: wrappedHandleTopicSelect,
    handleSubtopicSelect: wrappedHandleSubtopicSelect,
    handleObjectSelect: wrappedHandleObjectSelect,
    handleGlobalToolSelect: wrappedHandleGlobalToolSelect,
    handleObjectToolSelect: wrappedHandleObjectToolSelect,
    handlePopupClose,
    handlePopupSave: wrappedHandlePopupSave,
    handleAttributeChange,
    handleRunSimulation: wrappedHandleRunSimulation,
    handleStopSimulation: wrappedHandleStopSimulation,
    handleResetSimulation: wrappedHandleResetSimulation,
    getAttributesConfig: (item: string | null, kind: ToolKind) =>
      getAttributesConfig(item, kind),
    setIsSimulationRunning,
    showCoordinates,
    toggleCoordinates,
    getCurrentSimulation,
    gravity,
    updateGravity,
  };
};