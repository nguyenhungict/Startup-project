// src/Model/physic/Topic/Mechanics/Kinematics/kinematicSimulationManaGer.ts
import { getAttributesConfig } from "../../../../../data/physicConfig";
import { KinematicsEngine, type PhysicsObjectConfig, } from "./kinematicsEngine";

export class KinematicSimulationManager {
  private engine: KinematicsEngine;

  constructor() {
    this.engine = new KinematicsEngine();

  }

  addObjectFromType(objectType: string, id: string = `obj_${Date.now()}`, initialAttributes: Record<string, any> = {}) {
    const config = getAttributesConfig(objectType, "object");
    const defaultAttributes = this.buildDefaultAttributes(config);
    // Merge provided initialAttributes with defaults, ensuring position is valid
    const attributes = {
      ...defaultAttributes,
      ...initialAttributes,
      initialPosition: initialAttributes.position || defaultAttributes.initialPosition || { x: 200, y: 200 }, // Default to canvas center-ish
    };
    const { processedAttributes } = this.processObjectAttributes(attributes, id);
    const objectConfig: PhysicsObjectConfig = {
      type: objectType.toLowerCase(),
      attributes: processedAttributes,
    };

    this.engine.addObject(id, objectType, objectConfig);

    console.log("KinematicSimulationManager: Added object", {
      id,
      objectType,
      objectConfig,
  
    });
  }

updateItem(id: string, type: string, attributes: Record<string, any>, isSupportTool: boolean) {
    if (!isSupportTool) {
      this.updateObject(id, type, attributes);
    } else {
      console.log("KinematicSimulationManager.updateItem", id, attributes);
      this.updateSupportTool(id, type, attributes);
    }
  }

private updateObject(id: string, type: string, attributes: Record<string, any>) {
  console.log("KinematicSimulationManager: Updating object", { id, type, attributes });

  const { processedAttributes} = this.processObjectAttributes(attributes, id);

  const config: PhysicsObjectConfig = {
    type: type.toLowerCase(),
    attributes: processedAttributes,
  };
console.log("hasObject?", id, this.engine.getObjects());

  if (this.hasObject(id)) {
    this.engine.updateObject(id, config);
  } else {
    console.warn("Object not found in engine, forcing add:", id);
    this.engine.addObject(id, type, config);
  }

  console.log("KinematicSimulationManager: Updated object", { id, type, config, });
}

  private updateSupportTool(id: string, type: string, attributes: Record<string, any>) {
    if (type.toLowerCase() === "surface") {
      this.updateSurface(id, type, attributes);
    } else {
      this.updateForce(id, type, attributes);
    }
  }



  private updateSurface(id: string, type: string, attributes: Record<string, any>) {
    let processedAttributes = { ...attributes };
    if (processedAttributes.position && typeof processedAttributes.position === "object") {
      const pos = processedAttributes.position as { x: number; y: number };
      processedAttributes.positionX = pos.x;
      processedAttributes.positionY = pos.y;
      delete processedAttributes.position;
    }
    const config: PhysicsObjectConfig = {
      type: "surface",
      attributes: processedAttributes,
    };

    if (this.hasObject(id)) {
      this.engine.updateObject(id, config); // Update in-place
    } else {
      this.engine.addObject(id, type, config);
    }

    console.log("KinematicSimulationManager: Updated surface", { id, type, config });
  }

  private updateForce(id: string, type: string, attributes: Record<string, any>) {
    let processedAttributes = { ...attributes };
    let magnitude = Number(attributes.magnitude) || 0;
    let direction = Number(attributes.direction) || 0;
    let coefficient = "coefficient" in attributes ? Number(attributes.coefficient) : undefined;
    let targetObjectId = attributes.targetObjectId;

    if (processedAttributes.vector && typeof processedAttributes.vector === "object") {
      const vec = processedAttributes.vector as { x: number; y: number };
      magnitude = Math.sqrt(vec.x ** 2 + vec.y ** 2) || 0;
      direction = (Math.atan2(vec.y, vec.x) * 180) / Math.PI;
    }

    let forceAttributes: { magnitude: number; direction: number; coefficient?: number; vector?: { x: number; y: number } };
    switch (type.toLowerCase()) {
      case "gravity":
      case "gravityforcevector":
        forceAttributes = { magnitude, direction };
        break;
      case "velocity vector":
      case "acceleration vector":
      case "applied force":
      case "appliedforcevector":
        forceAttributes = { magnitude, direction, vector: attributes.vector };
        break;
      case "friction":
      case "frictionforcevector":
        forceAttributes = {
          magnitude: 0,
          direction: 0,
          coefficient: coefficient ?? 0.1,
        };
        break;
      default:
        forceAttributes = { magnitude, direction, coefficient, vector: attributes.vector };
        break;
    }



    console.log("KinematicSimulationManager: Updated force", { id, type, });
  }

  private processObjectAttributes(
  attributes: Record<string, any>,
  _objectId: string
): { processedAttributes: Record<string, any>; } {
  let processedAttributes = { ...attributes };

  // Handle initialPosition object
  if (processedAttributes.initialPosition && typeof processedAttributes.initialPosition === "object") {
    const pos = processedAttributes.initialPosition as { x: number; y: number };
    processedAttributes.initialPositionX = pos.x;
    processedAttributes.initialPositionY = pos.y;

    // Only set runtime positionX/Y if they are undefined (initial setup)
    processedAttributes.positionX = processedAttributes.positionX ?? pos.x;
    processedAttributes.positionY = processedAttributes.positionY ?? pos.y;

    delete processedAttributes.initialPosition;
  } else {
    // Set default initial position if not provided
    processedAttributes.initialPositionX = processedAttributes.initialPositionX ?? 200;
    processedAttributes.initialPositionY = processedAttributes.initialPositionY ?? 200;

    // Set runtime positionX/Y to initialPositionX/Y if not provided
    processedAttributes.positionX = processedAttributes.positionX ?? processedAttributes.initialPositionX;
    processedAttributes.positionY = processedAttributes.positionY ?? processedAttributes.initialPositionY;
  }

  return { processedAttributes };
}

  private buildDefaultAttributes(config: any[]): Record<string, any> {
    return config.reduce((acc, attr) => {
      acc[attr.key] = attr.defaultValue ?? (attr.key === "initialPosition" ? { x: 200, y: 200 } : undefined);
      return acc;
    }, {} as Record<string, any>);
  }

  run() {
    console.log("KinematicSimulationManager: Running simulation");
    this.engine.start();
  }

  addObject(id: string, type: string, config: PhysicsObjectConfig) {
    console.log("KinematicSimulationManager: Adding object directly", { id, type, config });
    this.engine.addObject(id, type, config);
  }

  removeObject(id: string) {
    console.log("KinematicSimulationManager: Removing object", { id });
    this.engine.removeObject(id);
  }


  removeItem(id: string) {
    console.log("KinematicSimulationManager: Removing item", { id });
    this.engine.removeObject(id);
  }

  stop() {
    console.log("KinematicSimulationManager: Stopping simulation");
    this.engine.stop();
  }

  reset() {
    console.log("KinematicSimulationManager: Resetting");
    this.engine.reset();
  }

  getSimulationData() {
    const data = {
      settings: {},
      objects: this.engine.getObjects(),
    };
    console.log("KinematicSimulationManager: getSimulationData", data);
    return data;
  }

  getState() {
    const objects = this.engine.getObjects();
    const state = objects.map((obj) => {
      const config = obj.config ?? {}; // Use config instead of attributes
      return {
        id: obj.id,
        type: obj.type ?? "unknown",
        positionX: config.x ?? config.position?.x ?? config.initialPositionX ?? 200,
        positionY: config.y ?? config.position?.y ?? config.initialPositionY ?? 200,
        velocityX: config.velocityX ?? config.velocity?.x ?? 0,
        velocityY: config.velocityY ?? config.velocity?.y ?? 0,
        accelerationX: config.acceleration?.x ?? 0,
        accelerationY: config.acceleration?.y ?? 0,
        mass: config.mass ?? 1,
        color: config.color ?? "blue",
        size: config.size ?? 30,
      };
    });
    console.log("KinematicSimulationManager: getState", { state, rawObjects: objects });
    return state;
  }

  hasObject(id: string) {
    return this.engine.getObjects().some(obj => obj.id === id);
  }
}