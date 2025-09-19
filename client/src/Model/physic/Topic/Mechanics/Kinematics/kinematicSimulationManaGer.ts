// src/Model/physic/Topic/Mechanics/Kinematics/kinematicSimulationManaGer.ts
import { getAttributesConfig } from "../../../../../data/physicConfig";
import { KinematicsEngine, type PhysicsObjectConfig, type ForceConfig } from "./kinematicsEngine";

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
    const { processedAttributes, forces } = this.processObjectAttributes(attributes, id);
    const objectConfig: PhysicsObjectConfig = {
      type: objectType.toLowerCase(),
      attributes: processedAttributes,
    };

    this.engine.addObject(id, objectType, objectConfig);
    forces.forEach(({ id: forceId, config: forceConfig }) => {
      this.engine.addForce(forceId, forceConfig);
    });

    console.log("KinematicSimulationManager: Added object", {
      id,
      objectType,
      objectConfig,
      forces,
    });
  }

updateItem(id: string, type: string, attributes: Record<string, any>, isSupportTool: boolean) {
    if (!isSupportTool) {
      this.updateObject(id, type, attributes);
    } else {
      this.updateSupportTool(id, type, attributes);
    }
  }

  private updateObject(id: string, type: string, attributes: Record<string, any>) {
    const { processedAttributes, forces } = this.processObjectAttributes(attributes, id);
    const config: PhysicsObjectConfig = {
      type: type.toLowerCase(),
      attributes: processedAttributes,
    };

    if (this.hasObject(id)) {
      this.engine.updateObject(id, config); // Assume in-place update
    } else {
      this.engine.addObject(id, type, config);
    }

    forces.forEach(({ id: forceId, config: forceConfig }) => {
      this.engine.addForce(forceId, forceConfig);
    });

    console.log("KinematicSimulationManager: Updated object", { id, type, config, forces });
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

    const forceConfig: ForceConfig = {
      id,
      type: type.toLowerCase(),
      enabled: attributes.enabled ?? true,
      attributes: forceAttributes,
      targetObjectId,
    };

    this.engine.addForce(id, forceConfig);

    console.log("KinematicSimulationManager: Updated force", { id, type, forceConfig });
  }

  private processObjectAttributes(
    attributes: Record<string, any>,
    objectId: string
  ): { processedAttributes: Record<string, any>; forces: { id: string; config: ForceConfig }[] } {
    let processedAttributes = { ...attributes };
    const forces: { id: string; config: ForceConfig }[] = [];

    if (processedAttributes.initialPosition && typeof processedAttributes.initialPosition === "object") {
      const pos = processedAttributes.initialPosition as { x: number; y: number };
      processedAttributes.initialPositionX = pos.x;
      processedAttributes.initialPositionY = pos.y;
      delete processedAttributes.initialPosition;
    } else if (!processedAttributes.initialPositionX && !processedAttributes.initialPositionY) {
      // Ensure a default position
      processedAttributes.initialPositionX = 200;
      processedAttributes.initialPositionY = 200;
    }

    // ... rest of processObjectAttributes unchanged ...

    return { processedAttributes, forces };
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

  addForce(id: string, config: ForceConfig) {
    console.log("KinematicSimulationManager: Adding force directly", { id, config });
    this.engine.addForce(id, config);
  }

  removeItem(id: string) {
    console.log("KinematicSimulationManager: Removing item", { id });
    this.engine.removeObject(id);
    this.engine.removeForce(id);
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
      forces: this.engine.getForces(),
    };
    console.log("KinematicSimulationManager: getSimulationData", data);
    return data;
  }

  getState() {
    const state = this.engine.getObjects(); // Only return objects, not forces/tools
    console.log("KinematicSimulationManager: getState", { state });
    return state;
  }

  hasObject(id: string) {
    return this.engine.getObjects().some(obj => obj.id === id);
  }
}