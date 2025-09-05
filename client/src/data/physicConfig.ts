

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

export const objectAttributeConfigs: Record<string, Attribute[]> = {
  "Moving Object": [
    { name: "Mass", key: "mass", type: "number", defaultValue: 1, min: 0, max: 10000, step: 0.1 },
    { name: "Size", key: "size", type: "number", defaultValue: 30, min: 0, max: 100, step: 0.1 },
    { name: "Color", key: "color", type: "color", defaultValue: "blue" },
    { name: "Static", key: "isStatic", type: "boolean", defaultValue: false },
    { name: "Initial Position", key: "initialPosition", type: "position", defaultValue: { x: 0, y: 0 }, min: -1000, max: 1000, step: 1 },
    { name: "Initial Velocity", key: "initialVelocity", type: "position", defaultValue: { x: 0, y: 0 }, min: -1000, max: 1000, step: 1 },
    { name: "Initial Acceleration", key: "initialAcceleration", type: "position", defaultValue: { x: 0, y: 0 }, min: -1000, max: 1000, step: 1 }
  ],
  
  // ... other objects
};

export const supportToolAttributeConfigs: Record<string, Attribute[]> = {
  GravityForceVector: [
    { name: "Enabled", key: "enabled", type: "boolean", defaultValue: true },
    { name: "Magnitude", key: "magnitude", type: "number", defaultValue: 9.81, min: 0, max: 1000, step: 0.1 },
    { name: "Direction", key: "direction", type: "number", defaultValue: 270, min: 0, max: 360, step: 1 }, // Direction in degrees
    { name: "Coefficient", key: "coefficient", type: "number", defaultValue: 1, min: 0, max: 1000, step: 0.1 },
  ],
  LightRayInfluence: [
    { name: "Enabled", key: "enabled", type: "boolean", defaultValue: true },
    { name: "Wavelength", key: "wavelength", type: "number", defaultValue: 550, min: 400, max: 700, step: 1 },
    { name: "Intensity", key: "intensity", type: "number", defaultValue: 1, min: 0, max: 10, step: 0.1 },
  ],
  Gravity: [
    { name: "Magnitude", key: "magnitude", type: "number", defaultValue: 9.81, min: 0, max: 1000, step: 0.1 },
    { name: "Direction", key: "direction", type: "number", defaultValue: 90, min: 0, max: 360, step: 1 },
  ],
  Surface: [
    { name: "Position", key: "position", type: "position", defaultValue: { x: 0, y: 400 } },
    { name: "Width", key: "width", type: "number", defaultValue: 800, min: 0, step: 1 },
    { name: "Angle", key: "angle", type: "number", defaultValue: 0, min: -90, max: 90, step: 1 },
    { name: "Color", key: "color", type: "color", defaultValue: "black" },
  ],

  // ... other support tools
};

export const getAttributesConfig = (
  item: string | null,
  isSupportTool: boolean
): Attribute[] => {
  if (!item) return [];
  return isSupportTool ? supportToolAttributeConfigs[item] || [] : objectAttributeConfigs[item] || [];
};