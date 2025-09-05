// ==========================================
// src/hooks/physicsPage/useAttributeForm.ts
// ==========================================
import { useState, useEffect } from "react";
import { getAttributesConfig } from "../../data/physicConfig";

export const useAttributeForm = (
  popupItem: { id: string; type: string; isSupportTool: boolean } | null,
  objectAttributes: Record<string, any>,
  supportToolAttributes: Record<string, any>,
  setObjectAttributes: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  setSupportToolAttributes: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  onClose: () => void
) => {
  const [formAttributes, setFormAttributes] = useState<Record<string, any>>({});

  useEffect(() => {
    if (popupItem) {
      const config = getAttributesConfig(popupItem.type, popupItem.isSupportTool);
      const existingAttributes = popupItem.isSupportTool
        ? supportToolAttributes[popupItem.id] || {}
        : objectAttributes[popupItem.id] || {};
      const defaultAttributes = config.reduce(
        (acc, attr) => ({ ...acc, [attr.key]: attr.defaultValue }),
        {}
      );
      setFormAttributes({ ...defaultAttributes, ...existingAttributes });
    }
  }, [popupItem, objectAttributes, supportToolAttributes]);

  // In your useSimulation hook, make sure handleAttributeChange updates state:

const handleAttributeChange = (
  key: string, 
  value: number | string | boolean | { x: number | string; y: number | string }
) => {
  if (popupItem?.isSupportTool) {
    setSupportToolAttributes((prev) => ({
      ...prev,
      [popupItem.id]: {
        ...(prev[popupItem.id] || {}), // Make sure we spread existing attributes
        [key]: value
      }
    }));
  } else if (popupItem) {
    setObjectAttributes((prev) => ({
      ...prev,
      [popupItem.id]: {
        ...(prev[popupItem.id] || {}), // Make sure we spread existing attributes
        [key]: value
      }
    }));
  }
};

  const handlePopupSave = (attributes: Record<string, number | string | boolean | { x: number; y: number }>) => {
    if (popupItem?.isSupportTool) {
      setSupportToolAttributes((prev) => ({ ...prev, [popupItem.id]: attributes }));
    } else if (popupItem) {
      setObjectAttributes((prev) => ({ ...prev, [popupItem.id]: attributes }));
    }
    onClose();
  };

  return {
    formAttributes,
    handleAttributeChange,
    handlePopupSave,
  };
};
