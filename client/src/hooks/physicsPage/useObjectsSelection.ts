import { useState } from "react";

export const useObjectSelection = () => {
  const [selectedObjects, setSelectedObjects] = useState<{ id: string; type: string }[]>([]);
  const [selectedSupportTools, setSelectedSupportTools] = useState<{ id: string; type: string }[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupItem, setPopupItem] = useState<{ id: string; type: string; isSupportTool: boolean } | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleObjectSelect = (object: string) => {
    const id = generateId();
    setSelectedObjects([{ id, type: object }]);
    setSelectedSupportTools([]);
    setPopupItem({ id, type: object, isSupportTool: false });
    setShowPopup(true);
  };

  const handleSupportToolSelect = (supportTool: string) => {
    const id = generateId();
    setSelectedSupportTools([{ id, type: supportTool }]);
    setSelectedObjects([]);
    setPopupItem({ id, type: supportTool, isSupportTool: true });
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setPopupItem(null);
  };

  return {
    selectedObjects,
    selectedSupportTools,
    showPopup,
    popupItem,
    handleObjectSelect,
    handleSupportToolSelect,
    handlePopupClose,
    setSelectedObjects,
    setSelectedSupportTools,
  };
};