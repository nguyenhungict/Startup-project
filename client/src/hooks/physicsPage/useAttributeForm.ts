// ==========================================
// src/hooks/physicsPage/useAttributeForm.ts
// ==========================================
import { useState, useEffect } from "react";
import { getAttributesConfig, getToolKind } from "../../data/physicConfig";

export const useAttributeForm = (
  popupItem: { id: string; type: string } | null,
  objectAttributes: Record<string, any>,
  supportToolAttributes: Record<string, any>,
  setObjectAttributes: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  setSupportToolAttributes: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  onClose: () => void
) => {
  const [formAttributes, setFormAttributes] = useState<Record<string, any>>({});

  // ✅ Chỉ chạy khi popupItem thay đổi (không phụ thuộc vào objectAttributes/supportToolAttributes)
  useEffect(() => {
    if (popupItem) {
      const kind = getToolKind(popupItem.type);
      const config = getAttributesConfig(popupItem.type, kind);

      const existingAttributes =
        kind === "objectTool" || kind === "globalTool"
          ? supportToolAttributes[popupItem.id] || {}
          : objectAttributes[popupItem.id] || {};

      const defaultAttributes = config.reduce(
        (acc, attr) => ({ ...acc, [attr.key]: attr.defaultValue }),
        {}
      );

      setFormAttributes({ ...defaultAttributes, ...existingAttributes });
    }
  }, [popupItem]);

  const handleAttributeChange = (
    key: string,
    value: number | string | boolean | { x: number | string; y: number | string }
  ) => {
    setFormAttributes((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePopupSave = (
    attributes: Record<string, number | string | boolean | { x: number; y: number }>
  ) => {
    if (!popupItem) return;
    const kind = getToolKind(popupItem.type);

    let normalizedAttributes = { ...attributes };

    if (normalizedAttributes.initialPosition && typeof normalizedAttributes.initialPosition === "object") {
      normalizedAttributes.position = normalizedAttributes.initialPosition;
    }

    if (normalizedAttributes.initialVelocity && typeof normalizedAttributes.initialVelocity === "object") {
      const vel = normalizedAttributes.initialVelocity as { x: number; y: number };
      normalizedAttributes.velocityX = vel.x;
      normalizedAttributes.velocityY = vel.y;
    }

    if (normalizedAttributes.initialAcceleration && typeof normalizedAttributes.initialAcceleration === "object") {
      const acc = normalizedAttributes.initialAcceleration as { x: number; y: number };
      normalizedAttributes.accelerationX = acc.x;
      normalizedAttributes.accelerationY = acc.y;
    }

    if (kind === "objectTool" || kind === "globalTool") {
      setSupportToolAttributes((prev) => ({
        ...prev,
        [popupItem.id]: normalizedAttributes,
      }));
    } else {
      setObjectAttributes((prev) => ({
        ...prev,
        [popupItem.id]: normalizedAttributes,
      }));
    }

    onClose();
  };

  return {
    formAttributes,
    handleAttributeChange,
    handlePopupSave,
  };
};
