import { useState, useEffect } from "react";
import { getAttributesConfig } from "../../data/physicConfig";

export const useAttributeForm = (
  popupItem: { id: string; type: string; isSupportTool: boolean } | null,
  setObjectAttributes: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  setSupportToolAttributes: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  onClose: () => void
) => {
  const [formAttributes, setFormAttributes] = useState<Record<string, any>>({});

  useEffect(() => {
    if (popupItem) {
      const config = getAttributesConfig(popupItem.type, popupItem.isSupportTool);
      setFormAttributes(config.reduce((acc, attr) => ({ ...acc, [attr.key]: attr.defaultValue }), {}));
    }
  }, [popupItem]);

  const handleAttributeChange = (key: string, value: any) => {
    setFormAttributes((prev) => ({ ...prev, [key]: value }));
  };

  const handlePopupSave = () => {
    if (popupItem?.isSupportTool) {
      setSupportToolAttributes((prev) => ({ ...prev, [popupItem.id]: formAttributes }));
    } else if (popupItem) {
      setObjectAttributes((prev) => ({ ...prev, [popupItem.id]: formAttributes }));
    }
    onClose();
  };

  return {
    formAttributes,
    handleAttributeChange,
    handlePopupSave,
  };
};