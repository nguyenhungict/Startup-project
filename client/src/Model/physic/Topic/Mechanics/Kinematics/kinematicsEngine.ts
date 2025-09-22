// src/Model/physic/Mechanics/Kinematics/kinematicsEngine.ts
import { Vector2 } from "../../../common/Vector2";

export interface PhysicsObjectConfig {
  type: string;
  attributes: {
    initialPositionX?: number;
    initialPositionY?: number;
    initialVelocityX?: number;
    initialVelocityY?: number;
    accelerationX?: number;
    accelerationY?: number;
    mass?: number;
    size?: number;
    color?: string;
    positionX?: number;
    positionY?: number;
    [key: string]: any;
  };
}

export interface PhysicsObject {
  id: string;
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  mass: number;
  update(dt: number): void;
  getState(): any;
}

export class MovingObjectKinematic implements PhysicsObject {
  id: string;
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  mass: number;
  size?: number;
  color?: string;

  constructor(id: string, config: PhysicsObjectConfig) {
    this.id = id;
    this.position = new Vector2(
      config.attributes.initialPositionX ?? 200,
      config.attributes.initialPositionY ?? 200
    );
    this.velocity = new Vector2(
      config.attributes.initialVelocityX ?? 0,
      config.attributes.initialVelocityY ?? 0
    );
    this.acceleration = new Vector2(
      config.attributes.accelerationX ?? 0,
      config.attributes.accelerationY ?? 0
    );
    this.mass = config.attributes.mass ?? 1;
    this.size = config.attributes.size ?? 30;
    this.color = config.attributes.color ?? "blue";
    console.log("MovingObjectKinematic created:", {
      id,
      position: this.position,
      velocity: this.velocity,
      acceleration: this.acceleration,
      mass: this.mass,
    });
  }

  update(dt: number): void {
    console.log("MovingObjectKinematic: Before update", {
      id: this.id,
      position: { x: this.position.x, y: this.position.y },
      velocity: { x: this.velocity.x, y: this.velocity.y },
      acceleration: { x: this.acceleration.x, y: this.acceleration.y },
      dt,
    });
    // Kinematic equations: v = v₀ + at, s = s₀ + v₀t + ½at²
    this.velocity = this.velocity.add(this.acceleration.scale(dt));
    this.position = this.position.add(this.velocity.scale(dt)).add(this.acceleration.scale(0.5 * dt * dt));
    console.log("MovingObjectKinematic: After update", {
      id: this.id,
      position: { x: this.position.x, y: this.position.y },
      velocity: { x: this.velocity.x, y: this.velocity.y },
    });
  }

  getState() {
    return {
      id: this.id,
      type: "Moving Object",
      position: { x: this.position.x, y: this.position.y },
      velocity: { x: this.velocity.x, y: this.velocity.y },
      acceleration: { x: this.acceleration.x, y: this.acceleration.y },
      x: this.position.x,
      y: this.position.y,
      velocityX: this.velocity.x,
      velocityY: this.velocity.y,
      accelerationX: this.acceleration.x,
      accelerationY: this.acceleration.y,
      mass: this.mass,
      size: this.size,
      color: this.color,
      label: "Moving Object",
    };
  }
}

export class KinematicsEngine {
  private objects: Map<string, PhysicsObject>;
  private isRunning: boolean;
  private lastTime: number | null;

  constructor() {
    this.objects = new Map();
    this.isRunning = false;
    this.lastTime = null;
  }

  addObject(id: string, type: string, config: PhysicsObjectConfig) {
    console.log("KinematicsEngine: Adding object", { id, type, config });
    const lowerType = type.toLowerCase();
    if (lowerType === "moving object") {
      this.objects.set(id, new MovingObjectKinematic(id, config));
    }
  }

  updateObject(id: string, config: PhysicsObjectConfig) {
    console.log("KinematicsEngine: Updating object", { id, config });
    const obj = this.objects.get(id);
    if (obj instanceof MovingObjectKinematic) {
      obj.position = new Vector2(
        config.attributes.positionX ?? config.attributes.initialPositionX ?? obj.position.x,
        config.attributes.positionY ?? config.attributes.initialPositionY ?? obj.position.y
      );
      obj.velocity = new Vector2(
        config.attributes.initialVelocityX ?? obj.velocity.x,
        config.attributes.initialVelocityY ?? obj.velocity.y
      );
      obj.acceleration = new Vector2(
        config.attributes.accelerationX ?? obj.acceleration.x,
        config.attributes.accelerationY ?? obj.acceleration.y
      );
      obj.mass = config.attributes.mass ?? obj.mass;
      obj.size = config.attributes.size ?? obj.size;
      obj.color = config.attributes.color ?? obj.color;
    }
  }

  removeObject(id: string) {
    console.log("KinematicsEngine: Removing object", { id });
    this.objects.delete(id);
  }

  start() {
    console.log("KinematicsEngine: Starting simulation", { objectCount: this.objects.size });
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame(() => this.update());
    } else {
      console.log("KinematicsEngine: Already running");
    }
  }

  stop() {
    console.log("KinematicsEngine: Stopping simulation");
    this.isRunning = false;
    this.lastTime = null;
  }

  reset() {
    console.log("KinematicsEngine: Resetting");
    this.objects.clear();
    this.isRunning = false;
    this.lastTime = null;
  }

  update() {
    if (!this.isRunning) {
      console.log("KinematicsEngine: Not running, exiting update");
      return;
    }
    const currentTime = performance.now();
    const dt = Math.min((currentTime - (this.lastTime ?? currentTime)) / 1000, 0.016); // Cap at ~60 FPS
    console.log("KinematicsEngine: Update called", { dt, objectsCount: this.objects.size });
    if (dt <= 0) {
      console.log("KinematicsEngine: Skipping update, dt =", dt);
      if (this.isRunning) {
        requestAnimationFrame(() => this.update());
      }
      return;
    }
    try {
      this.objects.forEach((obj) => {
        obj.update(dt);
      });
      this.lastTime = currentTime;
    } catch (error) {
      console.error("KinematicsEngine: Error in update", error);
    }
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
    console.log("KinematicsEngine: getObjects", { objects });
    return objects;
  }

  getState() {
    const state = Array.from(this.objects.values()).map((obj) => obj.getState());
    console.log("KinematicsEngine: getState", { state });
    return state;
  }

  hasObject(id: string) {
    return this.objects.has(id);
  }
}