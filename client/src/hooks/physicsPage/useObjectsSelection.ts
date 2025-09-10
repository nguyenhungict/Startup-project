// src/hooks/physicsPage/useObjectSelection.ts
import { useState } from "react";

export const useObjectSelection = () => {
  const [selectedObjects, setSelectedObjects] = useState<{ id: string; type: string }[]>([]);
  const [selectedGlobalTools, setSelectedGlobalTools] = useState<{ id: string; type: string }[]>([]);
  const [selectedObjectTools, setSelectedObjectTools] = useState<{ id: string; type: string; targetObjectId?: string }[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupItem, setPopupItem] = useState<{ id: string; type: string; kind: "object" | "globalTool" | "objectTool"; targetObjectId?: string } | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleObjectSelect = (object: string) => {
    const id = generateId();
    setSelectedObjects((prev) => [...prev, { id, type: object }]);
    setPopupItem({ id, type: object, kind: "object" });
    setShowPopup(true);
  };

  const handleGlobalToolSelect = (tool: string) => {
    const id = generateId();
    setSelectedGlobalTools((prev) => {
      const existing = prev.find((t) => t.type === tool);
      if (existing) {
        return prev.filter((t) => t.type !== tool);
      } else {
        setPopupItem({ id, type: tool, kind: "globalTool" });
        setShowPopup(true);
        return [...prev, { id, type: tool }];
      }
    });
  };

  const handleObjectToolSelect = (tool: string, targetObjectId?: string) => {
    const id = generateId();
    setSelectedObjectTools((prev) => {
      // Allow multiple object tools for the same object (to support vector addition)
      setPopupItem({ id, type: tool, kind: "objectTool", targetObjectId });
      setShowPopup(true);
      return [...prev, { id, type: tool, targetObjectId }];
    });
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setPopupItem(null);
  };

  return {
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
  };
};