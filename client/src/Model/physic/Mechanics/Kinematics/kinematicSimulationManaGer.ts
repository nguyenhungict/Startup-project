// src/Model/physic/Mechanics/Kinematics/kinematicSimulationManaGer.ts
import { getAttributesConfig } from "../../../../data/physicConfig";
import { KinematicsEngine } from "./kinematicsEngine";

import type { PhysicsObjectConfig, ForceConfig } from "./kinematicsEngine";

export class KinematicSimulationManager {
  private engine: KinematicsEngine;
  private topic: string | null;
  private subtopic: string | null;

  constructor() {
    this.engine = new KinematicsEngine();
    this.topic = null;
    this.subtopic = null;
  }

  setTopic(topic: string | null): void {
    this.topic = topic;
    console.log('KinematicSimulationManager: Topic set to', topic);
  }

  setSubtopic(subtopic: string | null): void {
    this.subtopic = subtopic;
    console.log('KinematicSimulationManager: Subtopic set to', subtopic);
  }

  /**
   * Add an object from just its type - handles all the complex setup
   */
  addObjectFromType(objectType: string) {
    const id = `obj_${Date.now()}`;
    const config = getAttributesConfig(objectType, false);
    const defaultAttributes = this.buildDefaultAttributes(config);
    
    // Convert complex attributes and create associated forces
    const { processedAttributes, forces } = this.processObjectAttributes(defaultAttributes, id);
    
    const objectConfig: PhysicsObjectConfig = {
      type: objectType.toLowerCase(),
      attributes: processedAttributes,
    };
    
    this.engine.addObject(id, objectType, objectConfig);
    
    // Add any forces that were created from attributes
    forces.forEach(({ id: forceId, config: forceConfig }) => {
      this.engine.addForce(forceId, forceConfig);
    });
    
    console.log('KinematicSimulationManager: Added object from type', { 
      id, objectType, objectConfig, forces 
    });
  }

  /**
   * Update an existing item (object or support tool) with new attributes
   */
  updateItem(
    id: string, 
    type: string, 
    attributes: Record<string, any>, 
    isSupportTool: boolean
  ) {
    if (!isSupportTool) {
      this.updateObject(id, type, attributes);
    } else {
      this.updateSupportTool(id, type, attributes);
    }
  }

  /**
   * Update a physics object
   */
  private updateObject(id: string, type: string, attributes: Record<string, any>) {
    // Process attributes and extract any forces
    const { processedAttributes, forces } = this.processObjectAttributes(attributes, id);
    
    const config: PhysicsObjectConfig = {
      type: type.toLowerCase(),
      attributes: processedAttributes,
    };
    
    // Remove and re-add the object
    this.engine.removeObject(id);
    this.engine.addObject(id, type, config);
    
    // Add any forces
    forces.forEach(({ id: forceId, config: forceConfig }) => {
      this.engine.addForce(forceId, forceConfig);
    });
    
    console.log('KinematicSimulationManager: Updated object', { id, type, config, forces });
  }

  /**
   * Update a support tool (surface or force)
   */
  private updateSupportTool(id: string, type: string, attributes: Record<string, any>) {
    if (type.toLowerCase() === 'surface') {
      this.updateSurface(id, type, attributes);
    } else {
      this.updateForce(id, type, attributes);
    }
  }

  /**
   * Update a surface
   */
  private updateSurface(id: string, type: string, attributes: Record<string, any>) {
    let processedAttributes = { ...attributes };
    
    // Handle position object
    if (processedAttributes.position && typeof processedAttributes.position === 'object') {
      const pos = processedAttributes.position as { x: number; y: number };
      processedAttributes.positionX = pos.x;
      processedAttributes.positionY = pos.y;
      delete processedAttributes.position;
    }
    
    const config: PhysicsObjectConfig = {
      type: 'surface',
      attributes: processedAttributes,
    };
    
    this.engine.removeObject(id);
    this.engine.addObject(id, type, config);
    
    console.log('KinematicSimulationManager: Updated surface', { id, type, config });
  }

  /**
   * Update a force (support tool)
   */
  private updateForce(id: string, type: string, attributes: Record<string, any>) {
    let processedAttributes = { ...attributes };
    
    // Handle vector mapping if present
    let magnitude = Number(attributes.magnitude) || 0;
    let direction = Number(attributes.direction) || 0;
    let coefficient = 'coefficient' in attributes ? Number(attributes.coefficient) : undefined;
    
    if (processedAttributes.vector && typeof processedAttributes.vector === 'object') {
      const vec = processedAttributes.vector as { x: number; y: number };
      magnitude = Math.sqrt(vec.x ** 2 + vec.y ** 2) || 0;
      direction = Math.atan2(vec.y, vec.x) * 180 / Math.PI;
    }
    
    // Type-specific defaults
    let forceAttributes: ForceConfig['attributes'] = { magnitude, direction };
    
    switch (type.toLowerCase()) {
      case 'friction':
        forceAttributes = {
          magnitude,
          direction,
          coefficient: coefficient ?? 0.1,
        };
        break;
      case 'gravity':
        forceAttributes = {
          magnitude: magnitude || 9.81,
          direction: direction || 90,
        };
        break;
      case 'applied force':
        forceAttributes = {
          magnitude: magnitude || 1,
          direction: direction || 0,
        };
        break;
      default:
        forceAttributes = {
          magnitude,
          direction,
          ...(coefficient !== undefined && { coefficient }),
        };
        break;
    }

    const forceConfig: ForceConfig = {
      type: type.toLowerCase(),
      enabled: true,
      attributes: forceAttributes,
    };
    
    this.engine.addForce(id, forceConfig);
    
    console.log('KinematicSimulationManager: Updated force', { id, type, forceConfig });
  }

  /**
   * Process object attributes, mapping complex ones and extracting forces
   */
  private processObjectAttributes(
    attributes: Record<string, any>, 
    objectId: string
  ): { processedAttributes: Record<string, any>; forces: { id: string; config: ForceConfig }[] } {
    let processedAttributes = { ...attributes };
    const forces: { id: string; config: ForceConfig }[] = [];

    // Handle initial position
    if (processedAttributes.initialPosition && typeof processedAttributes.initialPosition === 'object') {
      const pos = processedAttributes.initialPosition as { x: number; y: number };
      processedAttributes.initialPositionX = pos.x;
      processedAttributes.initialPositionY = pos.y;
      delete processedAttributes.initialPosition;
    }
    
    // Handle initial velocity
    if (processedAttributes.initialVelocity && typeof processedAttributes.initialVelocity === 'object') {
      const vel = processedAttributes.initialVelocity as { x: number; y: number };
      processedAttributes.initialVelocityX = vel.x;
      processedAttributes.initialVelocityY = vel.y;
      delete processedAttributes.initialVelocity;
    }
    
    // Handle initial acceleration -> convert to per-object applied force
    if (processedAttributes.initialAcceleration && typeof processedAttributes.initialAcceleration === 'object') {
      const acc = processedAttributes.initialAcceleration as { x: number; y: number };
      const mass = Number(processedAttributes.mass) || 1;
      const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2) * mass;
      const direction = Math.atan2(acc.y, acc.x) * 180 / Math.PI;
      
      forces.push({
        id: `accel_force_${objectId}`,
        config: {
          type: "applied force",
          enabled: true,
          attributes: { magnitude, direction },
          targetObjectId: objectId  // Target specific object
        }
      });
      
      delete processedAttributes.initialAcceleration;
    }
    
    return { processedAttributes, forces };
  }

  /**
   * Build default attributes from config
   */
  private buildDefaultAttributes(config: any[]): Record<string, any> {
    return config.reduce((acc, attr) => {
      acc[attr.key] = attr.defaultValue;
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Run the simulation - handles auto-adding required forces
   */
  run() {
    // Auto-add gravity for kinematics if not present
    if (this.subtopic === "Kinematics") {
      this.ensureGravityExists();
    }
    
    console.log('KinematicSimulationManager: Running simulation');
    this.engine.start();
  }

  /**
   * Ensure gravity exists for kinematics simulations
   */
  private ensureGravityExists() {
    const simulationData = this.getSimulationData();
    const hasGravity = Object.values(simulationData.forces).some(
      (f: ForceConfig) => f.type.toLowerCase() === "gravity"
    );
    
    if (!hasGravity) {
      const gravityId = `gravity_${Date.now()}`;
      const forceConfig: ForceConfig = {
        type: "gravity",
        enabled: true,
        attributes: { magnitude: 9.81, direction: 90 },
      };
      this.engine.addForce(gravityId, forceConfig);
      console.log('KinematicSimulationManager: Auto-added gravity', { gravityId, forceConfig });
    }
  }

  // Simple delegations to engine
  addObject(id: string, type: string, config: PhysicsObjectConfig) {
    console.log('KinematicSimulationManager: Adding object directly', { id, type, config });
    this.engine.addObject(id, type, config);
  }

  removeObject(id: string) {
    console.log('KinematicSimulationManager: Removing object', { id });
    this.engine.removeObject(id);
  }

  addForce(id: string, config: ForceConfig) {
    console.log('KinematicSimulationManager: Adding force directly', { id, config });
    this.engine.addForce(id, config);
  }

  stop() {
    console.log('KinematicSimulationManager: Stopping simulation');
    this.engine.stop();
  }

  reset() {
    console.log('KinematicSimulationManager: Resetting');
    this.engine.reset();
  }

  getSimulationData() {
    const data = {
      topic: this.topic,
      subtopic: this.subtopic,
      settings: {},
      objects: this.engine.getObjects(),
      forces: this.engine.getForces(),
    };
    console.log('KinematicSimulationManager: getSimulationData', data);
    return data;
  }

  getState() {
    const state = this.engine.getState();
    console.log('KinematicSimulationManager: getState', { state });
    return state;
  }
}