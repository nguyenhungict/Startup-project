// PhysicEngine.ts
import * as Matter from "matter-js";

export interface PhysicsObjectConfig {
  type: string;
  attributes: {
    mass?: number;
    size?: number;
    friction?: number;
    color?: string;
    angle?: number;
    length?: number;
    stiffness?: number;
    damping?: number;
    restitution?: number;
    isStatic?: boolean;
    position?: { x: number; y: number };
  };
}

export interface ForceConfig {
  type: string;
  enabled: boolean;
  attributes: {
    magnitude?: number;
    direction?: number;
    coefficient?: number;
  };
}

export class PhysicsEngine {
  private engine: Matter.Engine;
  private runner: Matter.Runner;
  private world: Matter.World;
  private bodies: Map<string, Matter.Body> = new Map();
  private extras: Map<string, { size: number; color: string; length?: number }> = new Map();
  private forces: Map<string, ForceConfig> = new Map();
  private constraints: Map<string, Matter.Constraint> = new Map();

  constructor() {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.runner = Matter.Runner.create();
    this.engine.gravity.y = 0;
  }

  run() {
    Matter.Runner.run(this.runner, this.engine);
  }

  stop() {
    Matter.Runner.stop(this.runner);
  }

  reset() {
    Matter.Runner.stop(this.runner);
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
    this.bodies.clear();
    this.extras.clear();
    this.forces.clear();
    this.constraints.clear();
    this.engine.gravity.y = 0;
  }

  addObject(id: string, config: PhysicsObjectConfig) {
    if (!id || this.bodies.has(id)) {
      throw new Error(`Invalid or duplicate object ID: ${id}`);
    }
    if (!config.type) {
      throw new Error("Object type is required");
    }

    let body: Matter.Body;
    const { type, attributes } = config;
    const size = attributes.size && attributes.size > 0 ? attributes.size : 50;
    const mass = attributes.mass && attributes.mass > 0 ? attributes.mass : 1;
    const friction = attributes.friction && attributes.friction >= 0 ? attributes.friction : 0.1;
    const color = attributes.color ?? "blue";
    const restitution = attributes.restitution ?? 0.5;
    const isStatic = attributes.isStatic ?? false;
    const x = attributes.position?.x ?? 400;
    const y = attributes.position?.y ?? 200;

    switch (type.toLowerCase()) {
      case "sphere":
      case "block":
        body = Matter.Bodies.circle(x, y, size / 2, {
          mass,
          friction,
          restitution,
          isStatic,
          label: type,
        });
        break;
      case "box":
        body = Matter.Bodies.rectangle(x, y, size, size, {
          mass,
          friction,
          restitution,
          isStatic,
          label: type,
        });
        break;
      case "ramp":
        body = Matter.Bodies.rectangle(x, y, 200, 20, {
          isStatic: true,
          angle: ((attributes.angle ?? 30) * Math.PI) / 180,
          friction,
          label: type,
        });
        break;
      case "wall":
        body = Matter.Bodies.rectangle(x, y, size, 20, {
          isStatic: true,
          friction,
          label: type,
        });
        break;
      case "spring":
      case "rope":
        const length = attributes.length && attributes.length > 0 ? attributes.length : 100;
        const anchor = Matter.Bodies.circle(x, y - length, 5, {
          isStatic: true,
          label: `${type}-anchor`,
        });
        body = Matter.Bodies.circle(x, y, size / 2, {
          mass,
          friction,
          restitution,
          label: type,
        });
        const constraint = Matter.Constraint.create({
          bodyA: anchor,
          bodyB: body,
          length,
          stiffness: attributes.stiffness ?? (type === "spring" ? 0.5 : 1),
          damping: attributes.damping ?? 0,
        });
        Matter.World.add(this.world, [anchor, constraint]);
        this.constraints.set(id, constraint);
        this.bodies.set(`${id}-anchor`, anchor);
        break;
      default:
        throw new Error(`Unsupported object type: ${type}`);
    }

    Matter.World.add(this.world, body);
    this.bodies.set(id, body);
    this.extras.set(id, { size, color, length: attributes.length });
  }

  addForce(id: string, config: ForceConfig) {
    if (!id || !config.type) {
      throw new Error(`Invalid force ID or type: ${id}`);
    }
    this.forces.set(id, config);

    if (config.type === "Gravity" && config.enabled) {
      this.engine.gravity.y = config.attributes.magnitude ?? 9.81;
    } else if (config.type === "Gravity" && !config.enabled) {
      this.engine.gravity.y = 0;
    }
  }

  applyForces() {
    this.bodies.forEach((body, id) => {
      this.forces.forEach((force) => {
        if (!force.enabled) return;

        const magnitude = force.attributes.magnitude ?? 0;
        const direction = ((force.attributes.direction ?? 0) * Math.PI) / 180;
        const coefficient = force.attributes.coefficient ?? 1;

        switch (force.type) {
          case "External":
          case "Applied Force":
            Matter.Body.applyForce(body, body.position, {
              x: magnitude * Math.cos(direction) * coefficient,
              y: magnitude * Math.sin(direction) * coefficient,
            });
            break;
          case "AirResistance":
            const velocity = body.velocity;
            const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
            const dragMagnitude = -(magnitude * speed * speed * coefficient);
            const angle = Math.atan2(velocity.y, velocity.x);
            Matter.Body.applyForce(body, body.position, {
              x: dragMagnitude * Math.cos(angle),
              y: dragMagnitude * Math.sin(angle),
            });
            break;
          case "Friction":
            if (body.isStatic) return;
            const frictionForce = -(magnitude * coefficient);
            Matter.Body.applyForce(body, body.position, {
              x: frictionForce * Math.cos(direction),
              y: frictionForce * Math.sin(direction),
            });
            break;
          case "Normal Force":
            Matter.Body.applyForce(body, body.position, {
              x: magnitude * Math.cos(direction) * coefficient,
              y: magnitude * Math.sin(direction) * coefficient,
            });
            break;
          case "Buoyant Force":
            Matter.Body.applyForce(body, body.position, {
              x: magnitude * Math.cos(direction) * coefficient,
              y: magnitude * Math.sin(direction) * coefficient,
            });
            break;
          case "Spring Force":
            // Note: Spring force is typically handled via constraints in Matter.js
            // This is a simplified approximation
            Matter.Body.applyForce(body, body.position, {
              x: magnitude * Math.cos(direction) * coefficient,
              y: magnitude * Math.sin(direction) * coefficient,
            });
            break;
          case "Gravity":
            // Handled in addForce for global gravity
            break;
          default:
            console.warn(`Unsupported force type: ${force.type}`);
        }
      });
    });
  }

  getState() {
    const state: { id: string; x: number; y: number; angle: number; label: string; size?: number; color?: string; length?: number }[] = [];
    this.bodies.forEach((body, id) => {
      const extra = this.extras.get(id) || { size: 50, color: "blue" };
      state.push({
        id,
        x: body.position.x,
        y: body.position.y,
        angle: body.angle,
        label: body.label,
        size: extra.size,
        color: extra.color,
        length: extra.length,
      });
    });
    return state;
  }

  getForces(): ForceConfig[] {
    return Array.from(this.forces.values());
  }
}