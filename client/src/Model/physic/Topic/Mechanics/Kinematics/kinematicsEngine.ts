// src/Model/physic/Mechanics/Kinematics/kinematicsEngine.ts
import { Vector2 } from "../../../common/Vector2";

export interface PhysicsObjectConfig {
  type: string;
  attributes: {
    initialPositionX?: number;
    initialPositionY?: number;
    initialVelocityX?: number;
    initialVelocityY?: number;
    mass?: number;
    size?: number;
    color?: string;
    positionX?: number;
    positionY?: number;
    width?: number;
    angle?: number;
    [key: string]: any;
  };
}

export interface ForceConfig {
  id: string;
  type: string;
  enabled: boolean;
  attributes: {
    magnitude: number;
    direction: number;
    coefficient?: number;
    vector?: { x: number; y: number };
  };
  targetObjectId?: string;
}

export interface PhysicsObject {
  id: string;
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  mass: number;
  forces: ForceConfig[];
  update(dt: number): void;
  applyForce(force: Vector2): void;
  getState(): any;
}

export class PointMassKinematic implements PhysicsObject {
  id: string;
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  mass: number;
  size?: number;
  color?: string;
  forces: ForceConfig[];

  constructor(id: string, config: PhysicsObjectConfig) {
    this.id = id;
    this.position = new Vector2(
      config.attributes.initialPositionX ?? 0,
      config.attributes.initialPositionY ?? 0
    );
    this.velocity = new Vector2(
      config.attributes.initialVelocityX ?? 0,
      config.attributes.initialVelocityY ?? 0
    );
    this.acceleration = new Vector2(0, 0);
    this.mass = config.attributes.mass ?? 1;
    this.size = config.attributes.size;
    this.color = config.attributes.color;
    this.forces = [];
    //console.log("PointMassKinematic created:", { id, position: this.position, velocity: this.velocity, mass: this.mass });
  }

  update(dt: number): void {
    this.velocity = this.velocity.add(this.acceleration.scale(dt));
    this.position = this.position.add(this.velocity.scale(dt));
    this.acceleration = new Vector2(0, 0);
    //console.log("PointMassKinematic update:", {
    //   id: this.id,
    //   position: this.position,
    //   velocity: this.velocity,
    //   dt,
    // });
  }

  applyForce(force: Vector2): void {
    if (this.mass !== Infinity && this.mass > 0) {
      const acceleration = force.scale(1 / this.mass);
      this.acceleration = this.acceleration.add(acceleration);
      //console.log("PointMassKinematic force applied:", {
      //   id: this.id,
      //   force,
      //   acceleration,
      //   totalAcceleration: this.acceleration,
      // });
    }
  }

  getState(): {
    id: string;
    type: string;
    x: number;
    y: number;
    angle: number;
    label: string;
    size?: number;
    color?: string;
    velocityX?: number;
    velocityY?: number;
    forces: ForceConfig[];
  } {
    return {
      id: this.id,
      type: "point mass",
      x: this.position.x,
      y: this.position.y,
      angle: 0,
      label: "Point Mass",
      size: this.size,
      color: this.color,
      velocityX: this.velocity.x,
      velocityY: this.velocity.y,
      forces: this.forces,
    };
  }
}

export class Surface implements PhysicsObject {
  id: string;
  position: Vector2;
  endPosition: Vector2;
  velocity: Vector2 = new Vector2(0, 0);
  acceleration: Vector2 = new Vector2(0, 0);
  mass: number = Infinity;
  width: number;
  angle: number;
  color?: string;
  forces: ForceConfig[] = [];

  constructor(id: string, config: PhysicsObjectConfig) {
    this.id = id;
    this.position = new Vector2(
      config.attributes.positionX ?? 0,
      config.attributes.positionY ?? 400
    );
    this.angle = (config.attributes.angle ?? 0) * Math.PI / 180;
    this.width = config.attributes.width ?? 800;
    this.endPosition = this.position.add(
      new Vector2(Math.cos(this.angle), Math.sin(this.angle)).scale(this.width)
    );
    this.color = config.attributes.color;
  }

  update(dt: number): void {
    // Static surface, no update needed
  }

  applyForce(force: Vector2): void {
    // Static surface, no force application
  }

  getState(): {
    id: string;
    type: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    color?: string;
    forces: ForceConfig[];
  } {
    return {
      id: this.id,
      type: "surface",
      startX: this.position.x,
      startY: this.position.y,
      endX: this.endPosition.x,
      endY: this.endPosition.y,
      color: this.color,
      forces: this.forces,
    };
  }
}

export class KinematicsEngine {
  private objects: Map<string, PhysicsObject>;
  private globalForces: Map<string, ForceConfig>;
  private isRunning: boolean;
  private lastTime: number | null;

  constructor() {
    this.objects = new Map();
    this.globalForces = new Map();
    this.isRunning = false;
    this.lastTime = null;
  }

  addObject(id: string, type: string, config: PhysicsObjectConfig) {
    //console.log("KinematicsEngine: Adding object", { id, type, config });
    const lowerType = type.toLowerCase();
    if (lowerType === "moving object") {
      this.objects.set(id, new PointMassKinematic(id, config));
    } else if (lowerType === "surface") {
      this.objects.set(id, new Surface(id, config));
    }
  }

  updateObject(id: string, config: PhysicsObjectConfig) {
    //console.log("KinematicsEngine: Updating object", { id, config });
    const obj = this.objects.get(id);
    if (obj instanceof PointMassKinematic) {
      obj.position = new Vector2(
        config.attributes.initialPositionX ?? obj.position.x,
        config.attributes.initialPositionY ?? obj.position.y
      );
      obj.velocity = new Vector2(
        config.attributes.initialVelocityX ?? obj.velocity.x,
        config.attributes.initialVelocityY ?? obj.velocity.y
      );
      obj.mass = config.attributes.mass ?? obj.mass;
      obj.size = config.attributes.size ?? obj.size;
      obj.color = config.attributes.color ?? obj.color;
    } else if (obj instanceof Surface) {
      obj.position = new Vector2(
        config.attributes.positionX ?? obj.position.x,
        config.attributes.positionY ?? obj.position.y
      );
      obj.angle = (config.attributes.angle ?? obj.angle * 180 / Math.PI) * Math.PI / 180;
      obj.width = config.attributes.width ?? obj.width;
      obj.endPosition = obj.position.add(
        new Vector2(Math.cos(obj.angle), Math.sin(obj.angle)).scale(obj.width)
      );
      obj.color = config.attributes.color ?? obj.color;
    }
  }

  removeObject(id: string) {
    //console.log("KinematicsEngine: Removing object", { id });
    this.objects.delete(id);
  }

  addForce(id: string, config: ForceConfig) {
    //console.log("KinematicsEngine: Adding force", { id, config });
    if (config.targetObjectId) {
      const obj = this.objects.get(config.targetObjectId);
      if (obj) {
        obj.forces.push({ ...config, id });
      }
    } else {
      this.globalForces.set(id, config);
    }
  }

  removeForce(id: string) {
    //console.log("KinematicsEngine: Removing force", { id });
    this.objects.forEach((obj) => {
      obj.forces = obj.forces.filter((f) => f.id !== id);
    });
    this.globalForces.delete(id);
  }

  removeForcesForObject(id: string) {
    //console.log("KinematicsEngine: Removing forces for object", { id });
    const obj = this.objects.get(id);
    if (obj) {
      obj.forces = [];
    }
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.update();
  }

  stop() {
    this.isRunning = false;
    this.lastTime = null;
  }

  reset() {
    //console.log("KinematicsEngine: Resetting");
    this.objects.clear();
    this.globalForces.clear();
    this.isRunning = false;
    this.lastTime = null;
  }

  private resolveCollisions() {
    const surfaces = Array.from(this.objects.values()).filter((obj) => obj instanceof Surface);
    const dynamicObjs = Array.from(this.objects.values()).filter((obj) => obj.mass !== Infinity);

    for (const dyn of dynamicObjs) {
      for (const surf of surfaces as Surface[]) {
        const lineStart = surf.position;
        const lineEnd = surf.endPosition;
        const lineVec = lineEnd.subtract(lineStart);
        const lineLength = lineVec.length();

        if (lineLength === 0) continue;

        const normal = new Vector2(-lineVec.y, lineVec.x).normalize();
        const pointVec = dyn.position.subtract(lineStart);
        const projScalar = pointVec.dot(lineVec.normalize());

        if (projScalar < 0 || projScalar > lineLength) continue;

        const signedDistance = pointVec.dot(normal);
        if (signedDistance > 0 && signedDistance < 5) {
          dyn.position = dyn.position.subtract(normal.scale(signedDistance));
          const velPerp = dyn.velocity.dot(normal);
          if (velPerp > 0) {
            dyn.velocity = dyn.velocity.subtract(normal.scale(velPerp));
          }
        }
      }
    }
  }

  update() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const dt = Math.min((currentTime - (this.lastTime ?? currentTime)) / 1000, 0.016);
    this.lastTime = currentTime;

    if (dt <= 0) {
      if (this.isRunning) {
        requestAnimationFrame(() => this.update());
      }
      return;
    }

    this.objects.forEach((obj) => {
      if (obj.mass === Infinity) return;

      this.globalForces.forEach((force) => {
        if (force.enabled) {
          const { magnitude, direction } = force.attributes;
          const rad = direction * Math.PI / 180;
          const dirVec = new Vector2(Math.cos(rad), Math.sin(rad));
          let forceVec = dirVec.scale(magnitude * obj.mass);
          obj.applyForce(forceVec);
        }
      });

      obj.forces.forEach((force) => {
        if (force.enabled) {
          let forceVec: Vector2;
          if (force.attributes.vector) {
            const { x, y } = force.attributes.vector;
            forceVec = new Vector2(x, y);
          } else {
            const { magnitude, direction, coefficient } = force.attributes;
            const rad = direction * Math.PI / 180;
            const dirVec = new Vector2(Math.cos(rad), Math.sin(rad));
            switch (force.type.toLowerCase()) {
              case "velocity vector":
                obj.velocity = obj.velocity.add(dirVec.scale(magnitude));
                return;
              case "acceleration vector":
                forceVec = dirVec.scale(magnitude * obj.mass);
                break;
              case "friction":
                if (obj.velocity.magnitude() > 0) {
                  const frictionDir = obj.velocity.normalize().scale(-1);
                  const normalForce = obj.mass * 9.81;
                  forceVec = frictionDir.scale((coefficient ?? 0.1) * normalForce);
                } else {
                  forceVec = new Vector2(0, 0);
                }
                break;
              default:
                forceVec = dirVec.scale(magnitude);
                break;
            }
          }
          obj.applyForce(forceVec);
        }
      });

      obj.update(dt);
    });

    this.resolveCollisions();

    if (this.isRunning) {
      requestAnimationFrame(() => this.update());
    }
  }

  getObjects() {
    const objects = Array.from(this.objects.entries()).map(([id, obj]) => ({
      id,
      type: obj.constructor.name,
      config: obj.getState(),
    }));
    //console.log("KinematicsEngine: getObjects called", { objects });
    return objects;
  }

  getForces() {
    const forces = Object.fromEntries(this.globalForces);
    //console.log("KinematicsEngine: getForces called", { forces });
    return forces;
  }

  getState() {
    const state = Array.from(this.objects.values()).map((obj) => obj.getState());
    //console.log("KinematicsEngine: getState called", { state, objectsCount: this.objects.size });
    return state;
  }

  hasObject(id: string) {
    return this.objects.has(id);
  }
}