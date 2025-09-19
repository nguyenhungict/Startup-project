
// src/hooks/physicsPage/useAttributeForm.ts
import { useState, useEffect } from "react";
import { getAttributesConfig, getToolKind } from "../../data/physicConfig";
import type { AttributeMap, ToolKind, AttributeValue } from "./type";

export const useAttributeForm = (
  popupItem: { id: string; type: string; kind: ToolKind } | null,
  objectAttributes: Record<string, AttributeMap>,
  supportToolAttributes: Record<string, AttributeMap>,
  setObjectAttributes: React.Dispatch<React.SetStateAction<Record<string, AttributeMap>>>,
  setSupportToolAttributes: (id: string, attrs: AttributeMap) => void,
  onClose: () => void,
  objectTools: { id: string; type: string; targetObjectId?: string }[] = [],
  objectToolAttributes: Record<string, AttributeMap> = {},
  onAttributesSaved?: (id: string, type: string, attrs: AttributeMap, isSupportTool: boolean) => void
) => {
  const [formAttributes, setFormAttributes] = useState<{
    object: AttributeMap;
    tools: { id: string; type: string; attrs: AttributeMap }[];
  }>({ object: {}, tools: [] });

  useEffect(() => {
    if (!popupItem) return;

    const kind = getToolKind(popupItem.type);
    console.log("useAttributeForm useEffect", { popupItem, kind, objectTools });

    if (kind === "object") {
      const objectAttrs = objectAttributes?.[popupItem.id] ?? {};
      const attachedTools = objectTools
        .filter((t) => t.targetObjectId === popupItem.id)
        .map((t) => ({
          id: t.id,
          type: t.type,
          attrs: objectToolAttributes?.[t.id] ?? {},
        }));

      console.log("Setting formAttributes for object", { objectAttrs, attachedTools });
      setFormAttributes({
        object: objectAttrs,
        tools: attachedTools,
      });
    } else {
      const config = getAttributesConfig(popupItem.type, kind);
      const existingAttributes =
        kind === "objectTool" || kind === "globalTool"
          ? supportToolAttributes?.[popupItem.id] ?? {}
          : objectAttributes?.[popupItem.id] ?? {};

      const defaultAttributes = config.reduce(
        (acc, attr) => ({ ...acc, [attr.key]: attr.defaultValue }),
        {} as AttributeMap
      );

      console.log("Setting formAttributes for tool", { existingAttributes, defaultAttributes });
      setFormAttributes({ object: { ...defaultAttributes, ...existingAttributes }, tools: [] });
    }
  }, [popupItem, objectAttributes, supportToolAttributes, objectTools, objectToolAttributes]);

  const handleAttributeChange = (
    key: string,
    value: AttributeValue | { x: string | number; y: string | number },
    section: string
  ) => {
    setFormAttributes((prev) => {
      console.log("handleAttributeChange", { key, value, section, prev });
      const objectSection = prev.object ?? {};
      const toolsSection = prev.tools ?? [];

      let normalizedValue: AttributeValue;
      if (typeof value === "object" && "x" in value && "y" in value) {
        const config = section === "object"
          ? getAttributesConfig(popupItem?.type || "", popupItem?.kind || "object")
          : getAttributesConfig(toolsSection[parseInt(section.split("-")[1])]?.type || "", "objectTool");
        const attr = config.find((a) => a.key === key);
        const defaultPos = (attr?.defaultValue as { x: number; y: number }) ?? { x: 0, y: 0 };
        normalizedValue = {
          x: typeof value.x === "string" ? (isNaN(Number(value.x)) ? defaultPos.x : Number(value.x)) : value.x,
          y: typeof value.y === "string" ? (isNaN(Number(value.y)) ? defaultPos.y : Number(value.y)) : value.y,
        };
      } else {
        normalizedValue = value as AttributeValue;
      }

      if (section === "object") {
        const newState = { ...prev, object: { ...objectSection, [key]: normalizedValue } };
        console.log("Updated formAttributes (object)", newState);
        return newState;
      } else {
        const toolIndex = parseInt(section.split("-")[1]);
        toolsSection[toolIndex] = {
          ...toolsSection[toolIndex] ?? {},
          attrs: { ...toolsSection[toolIndex]?.attrs ?? {}, [key]: normalizedValue },
        };
        const newState = { ...prev, tools: toolsSection };
        console.log("Updated formAttributes (tools)", newState);
        return newState;
      }
    });
  };

  const handlePopupSave = (attributes: { object: AttributeMap; tools: { id: string; attributes: AttributeMap }[] }) => {
    if (!popupItem) return;
    const kind = getToolKind(popupItem.type);
    console.log("handlePopupSave", { attributes, kind });

    if (kind === "object") {
      setObjectAttributes((prev) => ({
        ...prev,
        [popupItem.id]: attributes.object,
      }));
      onAttributesSaved?.(popupItem.id, popupItem.type, attributes.object, false);

      attributes.tools?.forEach((tool) => {
        if (tool.id) {
          console.log("Saving tool attributes", { toolId: tool.id, toolAttrs: tool.attributes });
          setSupportToolAttributes(tool.id, tool.attributes);
          onAttributesSaved?.(tool.id, formAttributes.tools.find(t => t.id === tool.id)?.type || "unknown", tool.attributes, true);
        }
      });
    } else {
      let normalizedAttributes: AttributeMap = { ...attributes.object };
      // Normalize attributes for globalTool or objectTool
      const config = getAttributesConfig(popupItem.type, kind);
      config.forEach((attr) => {
        const value = normalizedAttributes[attr.key];
        if (typeof value === "object" && value !== null && "x" in value && "y" in value) {
          if (attr.key === "initialPosition") {
            normalizedAttributes.position = {
              x: typeof value.x === "string" ? (isNaN(Number(value.x)) ? 0 : Number(value.x)) : value.x,
              y: typeof value.y === "string" ? (isNaN(Number(value.y)) ? 0 : Number(value.y)) : value.y,
            };
          } else if (attr.key === "initialVelocity") {
            normalizedAttributes.velocityX = typeof value.x === "string" ? (isNaN(Number(value.x)) ? 0 : Number(value.x)) : value.x;
            normalizedAttributes.velocityY = typeof value.y === "string" ? (isNaN(Number(value.y)) ? 0 : Number(value.y)) : value.y;
          } else if (attr.key === "initialAcceleration") {
            normalizedAttributes.accelerationX = typeof value.x === "string" ? (isNaN(Number(value.x)) ? 0 : Number(value.x)) : value.x;
            normalizedAttributes.accelerationY = typeof value.y === "string" ? (isNaN(Number(value.y)) ? 0 : Number(value.y)) : value.y;
          }
        }
      });

      setSupportToolAttributes(popupItem.id, normalizedAttributes);
      onAttributesSaved?.(popupItem.id, popupItem.type, normalizedAttributes, true);
    }

    onClose();
  };

  return {
    formAttributes,
    handleAttributeChange,
    handlePopupSave,
  };
};
