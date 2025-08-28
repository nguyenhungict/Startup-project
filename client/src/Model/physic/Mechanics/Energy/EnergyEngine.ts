// simulation/energy/energyEngine.ts

import type { PhysicsObjectConfig } from "../Dynamics/PhysicEngine";


export interface EnergyState {
  id: string;
  kineticEnergy: number; // J
  potentialEnergy: number; // J
  totalEnergy: number; // J
  label: string;
}

export class EnergyEngine {
  private states: Map<string, EnergyState> = new Map();

  /** Calculate energy for an object based on its dynamics state */
  calculateEnergy(id: string, config: PhysicsObjectConfig, dynamicsState: { velocity: number; y: number }) {
    const mass = config.attributes.mass ?? 1;
    const height = config.attributes.size ? config.attributes.size / 2 : 0; // Approximate height
    const g = 9.81; // Gravity (m/s^2)

    // Kinetic Energy: Ek = ½mv²
    const kineticEnergy = 0.5 * mass * dynamicsState.velocity * dynamicsState.velocity;

    // Potential Energy: Ep = mgh
    const potentialEnergy = mass * g * (dynamicsState.y - height);

    // Total Energy
    const totalEnergy = kineticEnergy + potentialEnergy;

    this.states.set(id, {
      id,
      kineticEnergy,
      potentialEnergy,
      totalEnergy,
      label: config.type,
    });
  }

  /** Get current energy state of all objects */
  getState(): EnergyState[] {
    return Array.from(this.states.values());
  }

  /** Reset the simulation */
  reset() {
    this.states.clear();
  }
}