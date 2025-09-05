
// src/hooks/physicsPage/useSimulation.ts
import { useState, useEffect } from "react";
import { useTopicSelection } from "./useTopicSelection";
import { useSubtopicSelection } from "./useSubtopicSelection";
import { useObjectSelection } from "./useObjectsSelection";
import { useAttributeForm } from "./useAttributeForm";
import { useSimulationControl } from "./useSimulationControl";
import { getAttributesConfig } from "../../data/physicConfig";
import { physicsData, type PhysicsData } from "../../data/physicsData";
import { KinematicSimulationManager } from "../../Model/physic/Mechanics/Kinematics/kinematicSimulationManaGer";
import type { PhysicsPageLogic } from "./type";

export const getCurrentSimulationData = (
  physicsData: PhysicsData,
  selectedTopic: string | null,
  selectedSubtopic: string | null
) => {
  const defaultSimulation = {
    objects: [],
    supportTools: [],
    subtopics: [],
  };

  if (!selectedTopic) {
    return defaultSimulation;
  }

  const topicData = physicsData[selectedTopic];
  if (!topicData) {
    return defaultSimulation;
  }

  if (!selectedSubtopic) {
    return {
      objects: [],
      supportTools: [],
      subtopics: Object.keys(topicData),
    };
  }

  const subtopicData = topicData[selectedSubtopic];
  if (!subtopicData) {
    return defaultSimulation;
  }

  return {
    objects: subtopicData.objects || [],
    supportTools: subtopicData.supportTools || [],
    subtopics: [],
  };
};

export const useSimulation = (): PhysicsPageLogic & { getCurrentSimulation: () => any } => {
  const manager = new KinematicSimulationManager();
  const { selectedTopic, handleTopicSelect } = useTopicSelection();
  const { selectedSubtopic, handleSubtopicSelect } = useSubtopicSelection(selectedTopic);
  const {
    selectedObjects,
    selectedSupportTools,
    showPopup,
    popupItem,
    handleObjectSelect,
    handleSupportToolSelect,
    handlePopupClose,
    setSelectedObjects,
    setSelectedSupportTools,
  } = useObjectSelection();
  const [objectAttributes, setObjectAttributes] = useState<Record<string, any>>({});
  const [supportToolAttributes, setSupportToolAttributes] = useState<Record<string, any>>({});
  const {
    isSimulationRunning,
    canvasResetTrigger,
    handleRunSimulation: originalHandleRunSimulation,
    handleStopSimulation: originalHandleStopSimulation,
    handleResetSimulation: originalHandleResetSimulation,
    setIsSimulationRunning,
  } = useSimulationControl();
  const {
    formAttributes,
    handleAttributeChange,
    handlePopupSave: originalHandlePopupSave,
  } = useAttributeForm(
  popupItem,
  objectAttributes,
  supportToolAttributes,
  setObjectAttributes,
  setSupportToolAttributes,
  handlePopupClose
);;
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);

  const toggleCoordinates = () => {
    setShowCoordinates((prev) => !prev);
  };

  // Sync manager with topic/subtopic changes
  useEffect(() => {
    manager.setTopic(selectedTopic);
  }, [selectedTopic]);

  useEffect(() => {
    manager.setSubtopic(selectedSubtopic);
  }, [selectedSubtopic]);

  // Sync manager with object selections
  useEffect(() => {
    selectedObjects.forEach((obj) => {
      const attrs = objectAttributes[obj.id] || {};
      manager.updateItem(obj.id, obj.type, attrs, false);
    });
    selectedSupportTools.forEach((tool) => {
      const attrs = supportToolAttributes[tool.id] || {};
      manager.updateItem(tool.id, tool.type, attrs, true);
    });
  }, [selectedObjects, selectedSupportTools, objectAttributes, supportToolAttributes]);

  // Update React state with simulation state during running
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
              angle: item.angle,
              size: item.size,
              color: item.color,
            };
          }
        });
        return newAttrs;
      });

      setSupportToolAttributes((prev) => {
        const newAttrs = { ...prev };
        state.forEach((item: any) => {
          if (newAttrs[item.id] && item.type === "surface") {
            newAttrs[item.id] = {
              ...newAttrs[item.id],
              startX: item.startX,
              startY: item.startY,
              endX: item.endX,
              endY: item.endY,
              angle: item.angle,
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
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isSimulationRunning, manager]);

  const wrappedHandleTopicSelect = (topic: string) => {
    handleTopicSelect(topic);
    setSelectedObjects([]);
    setSelectedSupportTools([]);
    handlePopupClose();
    manager.setTopic(topic);
  };

  const wrappedHandleSubtopicSelect = (subtopic: string | null) => {
    handleSubtopicSelect(subtopic);
    setSelectedObjects([]);
    setSelectedSupportTools([]);
    handlePopupClose();
    manager.setSubtopic(subtopic);
  };

  const wrappedHandleObjectSelect = (object: string) => {
    handleObjectSelect(object);
    const id = selectedObjects[selectedObjects.length - 1]?.id;
    if (id) {
      manager.addObjectFromType(object);
    }
  };

  const wrappedHandleSupportToolSelect = (tool: string) => {
    handleSupportToolSelect(tool);
    const id = selectedSupportTools[selectedSupportTools.length - 1]?.id;
    if (id) {
      manager.addObjectFromType(tool);
    }
  };

  const wrappedHandlePopupSave = (attributes: Record<string, any>) => {
  originalHandlePopupSave(attributes); // truyền attributes vào
  if (popupItem) {
    manager.updateItem(popupItem.id, popupItem.type, attributes, popupItem.isSupportTool);
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
  };

  const getCurrentSimulation = () => {
    return getCurrentSimulationData(physicsData, selectedTopic, selectedSubtopic);
  };

  return {
    selectedTopic,
    selectedSubtopic,
    selectedObjects,
    selectedSupportTools,
    showPopup,
    popupItem,
    isSimulationRunning,
    canvasResetTrigger,
    physicsData,
    objectAttributes,
    supportToolAttributes,
    handleTopicSelect: wrappedHandleTopicSelect,
    handleSubtopicSelect: wrappedHandleSubtopicSelect,
    handleObjectSelect: wrappedHandleObjectSelect,
    handleSupportToolSelect: wrappedHandleSupportToolSelect,
    handlePopupClose,
    handlePopupSave: wrappedHandlePopupSave,
    handleAttributeChange,
    handleRunSimulation: wrappedHandleRunSimulation,
    handleStopSimulation: wrappedHandleStopSimulation,
    handleResetSimulation: wrappedHandleResetSimulation,
    getAttributesConfig: (item: string | null, isSupportTool: boolean) =>
      getAttributesConfig(item, isSupportTool),
    setIsSimulationRunning,
    showCoordinates,
    toggleCoordinates,
    getCurrentSimulation,
  };
};
