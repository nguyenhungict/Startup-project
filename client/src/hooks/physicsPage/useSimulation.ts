// src/hooks/physicsPage/useSimulation.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { useTopicSelection } from "./useTopicSelection";
import { useSubtopicSelection } from "./useSubtopicSelection";
import { useAttributeForm } from "./useAttributeForm";
import { useSimulationControl } from "./useSimulationControl";
import { getAttributesConfig } from "../../data/physicConfig";
import { physicsData, type PhysicsData } from "../../data/physicsData";
import { KinematicSimulationManager } from "../../Model/physic/Topic/Mechanics/Kinematics/kinematicSimulationManaGer";
import type { PhysicsPageLogic, ToolKind } from "./type";
import { useCanvasObjects } from "./useCanvasObject";
import { useObjectsSync } from "./useObjectsSync";
import { useCanvasSelection } from "./useCanvasSelection";

export type CanvasObject = {
  id: string;
  type: string;
};

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
  handleCanvasObjectClick: (objectId: string) => void;
  selectedCanvasObjectId: string | null;
  formAttributes: Record<string, any>;
  pendingToolType: string | null;                        // ⬅️ add this
  setPendingToolType: (tool: string | null) => void
} => {
  const managerRef = useRef<KinematicSimulationManager | null>(null);
  if (!managerRef.current) {
    managerRef.current = new KinematicSimulationManager();
  }
  const manager = managerRef.current;

  const { selectedTopic, handleTopicSelect } = useTopicSelection();
  const { selectedSubtopic, handleSubtopicSelect } = useSubtopicSelection(selectedTopic);

  // Canvas objects and selection state
  const { createObject } = useCanvasObjects(manager);
  const [canvasObjects, setCanvasObjects] = useState<CanvasObject[]>([]);
  const [selectedCanvasObjectId, setSelectedCanvasObjectId] = useState<string | null>(null);
  const [globalTools, setGlobalTools] = useState<SupportTool[]>([]);
  const [objectTools, setObjectTools] = useState<SupportTool[]>([]);
  const { selectedId, selectObject, clearSelection, } = useCanvasSelection();

  // Attribute states
  const [objectAttributes, setObjectAttributes] = useState<Record<string, any>>({});
  const [globalToolAttributes, setGlobalToolAttributes] = useState<Record<string, any>>({});
  const [objectToolAttributes, setObjectToolAttributes] = useState<Record<string, any>>({});

  const [pendingToolType, setPendingToolType] = useState<string | null>(null);

  // Popup state for attribute editing
  const [showPopup, setShowPopup] = useState(false);
  const [popupItem, setPopupItem] = useState<{ id: string; type: string; kind: ToolKind; targetObjectId?: string } | null>(null);

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

  useEffect(() => {
    if (gravity.enabled) {
      manager.updateItem("gravity_global", "Gravity", { ...gravity, enabled: true }, true);
    } else {
      manager.removeItem("gravity_global");
    }
  }, [gravity, manager]);

  useObjectsSync(
    manager,
    canvasObjects,
    globalTools,
    objectTools,
    objectAttributes,
    globalToolAttributes,
    objectToolAttributes,
    isSimulationRunning,
    setObjectAttributes
  );

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
    () => handlePopupClose()
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

  // TOOLBOX INTERACTIONS - Create new objects/tools with default values
  const handleObjectSelect = useCallback((object: string, position?: { x: number; y: number }) => {
    console.log("handleObjectSelect called with:", { object, position });
    const id = createObject(object); // Capture the ID from createObject
    setCanvasObjects(prev => {
      const newObjects = [...prev, { id, type: object }];
      console.log("Updated canvasObjects:", newObjects);
      return newObjects;
    });

  }, [createObject]);

  const handleGlobalToolSelect = useCallback((toolType: string) => {
    const id = crypto.randomUUID();
    const newTool = { id, type: toolType };
    
    setGlobalTools(prev => [...prev, newTool]);
    setPopupItem({ id, type: toolType, kind: "globalTool" });
    setShowPopup(true);
  }, []);

  const handleObjectToolSelect = useCallback((toolType: string, targetObjectId?: string) => {
    const id = crypto.randomUUID();
    const newTool = { id, type: toolType, targetObjectId };
    
    setObjectTools(prev => [...prev, newTool]);
    setPopupItem({ id, type: toolType, kind: "objectTool", targetObjectId });
    setShowPopup(true);
  }, []);

  const handleCanvasObjectClick = useCallback((objectId: string) => {
    console.log("handleCanvasObjectClick", { objectId, objectAttributes, canvasObjects });
    const obj = canvasObjects.find(o => o.id === objectId);
    if (pendingToolType) {
      if (obj) {
      selectObject(objectId);
      handleObjectToolSelect(pendingToolType, objectId);
      setPendingToolType(null);
    } else {
      console.warn("handleCanvasObjectClick: Object not found", { objectId });
      }   
    } else {
      if (obj) {
      selectObject(objectId);
      setPopupItem({ id: objectId, type: obj.type, kind: "object" });
      setShowPopup(true);
    } else {
      console.warn("handleCanvasObjectClick: Object not found", { objectId });
      }  
    }
        
  }, [canvasObjects, objectAttributes, selectObject]);

  // Popup handlers
  const handlePopupClose = useCallback(() => {
    setShowPopup(false);
    setPopupItem(null);
  }, []);

  const handlePopupSave = useCallback((attributes: Record<string, any>) => {
    if (popupItem) {
      if (popupItem.kind === "object") {
        setObjectAttributes(prev => ({
          ...prev,
          [popupItem.id]: {
            ...prev[popupItem.id],
            ...attributes,
          },
        }));
        manager.updateItem(popupItem.id, popupItem.type, attributes, false);
      } else if (popupItem.kind === "globalTool") {
        setGlobalToolAttributes(prev => ({
          ...prev,
          [popupItem.id]: {
            ...prev[popupItem.id],
            ...attributes,
          },
        }));
        manager.updateItem(popupItem.id, popupItem.type, attributes, true);
      } else if (popupItem.kind === "objectTool") {
        setObjectToolAttributes(prev => ({
          ...prev,
          [popupItem.id]: {
            ...prev[popupItem.id],
            ...attributes,
          },
        }));
        manager.updateItem(popupItem.id, popupItem.type, attributes, true);
      }
      originalHandlePopupSave(attributes);
    }
  }, [popupItem, manager, originalHandlePopupSave]);

  // Topic/subtopic handlers
  const wrappedHandleTopicSelect = (topic: string) => {
    handleTopicSelect(topic);
    setCanvasObjects([]);
    setGlobalTools([]);
    setObjectTools([]);
    setSelectedCanvasObjectId(null);
    setObjectAttributes({});
    setGlobalToolAttributes({});
    setObjectToolAttributes({});
    handlePopupClose();
    manager.setTopic(topic);
  };

  const wrappedHandleSubtopicSelect = (subtopic: string | null) => {
    handleSubtopicSelect(subtopic);
    setCanvasObjects([]);
    setGlobalTools([]);
    setObjectTools([]);
    setSelectedCanvasObjectId(null);
    setObjectAttributes({});
    setGlobalToolAttributes({});
    setObjectToolAttributes({});
    handlePopupClose();
    manager.setSubtopic(subtopic);
  };

  // Simulation control handlers
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
    setCanvasObjects([]);
    setGlobalTools([]);
    setObjectTools([]);
    setSelectedCanvasObjectId(null);
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
    selectedObjects: canvasObjects,
    selectedGlobalTools: globalTools,
    selectedObjectTools: objectTools,
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
    handleObjectSelect,
    handleGlobalToolSelect,
    handleObjectToolSelect,
    handlePopupClose,
    handlePopupSave,
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
    handleCanvasObjectClick,
    selectedCanvasObjectId,
    formAttributes,

    pendingToolType,
  setPendingToolType,
  };
};