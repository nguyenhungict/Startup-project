// src/data/physicConfig.ts
export type ToolKind = "object" | "globalTool" | "objectTool";

export interface Attribute {
  name: string;
  key: string;
  type: "number" | "color" | "boolean" | "string" | "select" | "position";
  defaultValue: number | string | boolean | { x: number; y: number };
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface PhysicsToolConfig {
  id: string;
  name: string;
  kind: ToolKind;
  attributes: Attribute[];
}

export const objectAttributeConfigs: Record<string, Attribute[]> = {
  "Moving Object": [
    { name: "Initial Position", key: "initialPosition", type: "position", defaultValue: { x: 0, y: 0 }, min: -1000, max: 1000, step: 1 },
    { name: "Initial Velocity", key: "initialVelocity", type: "position", defaultValue: { x: 0, y: 0 }, min: -1000, max: 1000, step: 1 },
    { name: "Initial Acceleration", key: "initialAcceleration", type: "position", defaultValue: { x: 0, y: 0 }, min: -1000, max: 1000, step: 1 },
  ],
  // ... other objects
};

export const globalToolAttributeConfigs: Record<string, Attribute[]> = {
  Gravity: [
    { name: "Magnitude", key: "magnitude", type: "number", defaultValue: 9.81, min: 0, max: 1000, step: 0.1 },
    { name: "Direction", key: "direction", type: "number", defaultValue: 90, min: 0, max: 360, step: 1 },
  ],
  // ... other global tools
};

export const objectToolAttributeConfigs: Record<string, Attribute[]> = {
  VelocityVector: [
    { name: "Vector", key: "vector", type: "position", defaultValue: { x: 0, y: 0 }, min: -1000, max: 1000, step: 1 },
  ],
  AppliedForceVector: [
    { name: "Enabled", key: "enabled", type: "boolean", defaultValue: true },
    { name: "Magnitude", key: "magnitude", type: "number", defaultValue: 10, min: 0, max: 1000, step: 0.1 },
    { name: "Direction", key: "direction", type: "number", defaultValue: 0, min: 0, max: 360, step: 1 },
  ],
  FrictionForceVector: [
    { name: "Enabled", key: "enabled", type: "boolean", defaultValue: true },
    { name: "Coefficient", key: "coefficient", type: "number", defaultValue: 0.1, min: 0, max: 1, step: 0.01 },
  ],
  // ... other object tools
};

export const getAttributesConfig = (
  item: string | null,
  kind: ToolKind
): Attribute[] => {
  if (!item) return [];
  if (kind === "object") return objectAttributeConfigs[item] || [];
  if (kind === "globalTool") return globalToolAttributeConfigs[item] || [];
  if (kind === "objectTool") return objectToolAttributeConfigs[item] || [];
  return [];
};

export const getToolKind = (type: string): ToolKind => {
  if (objectAttributeConfigs[type]) return "object";
  if (globalToolAttributeConfigs[type]) return "globalTool";
  if (objectToolAttributeConfigs[type]) return "objectTool";

  console.warn(`⚠️ Unknown tool type: ${type}, defaulting to "object"`);
  return "object";
};