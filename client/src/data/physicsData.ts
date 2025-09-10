// src/data/physicsData.ts
export interface PhysicsData {
  [topic: string]: {
    [subtopic: string]: {
      objects: string[];
      globalTools: string[];
      objectTools: string[];
    };
  };
}

export const physicsData: PhysicsData = {
  mechanics: {
    Kinematics: {
      objects: ["Moving Object"],
      globalTools: ["Gravity"],
      objectTools: ["VelocityVector", "AccelerationVector"],
    },
    Dynamics: {
      objects: ["Box", "Ramp", "Lever", "Fulcrum", "Weights", "Rotating Wheel"],
      globalTools: ["Gravity"],
      objectTools: ["AppliedForceVector", "FrictionForceVector", "NormalForceVector"],
    },
    Energy: {
      objects: ["Box", "Spring", "Sphere", "Cart", "Flat Surface", "Container", "Liquid", "Floating Object", "Elastic Rod", "Weight"],
      globalTools: ["GravityEnergyInfluence"],
      objectTools: ["SpringEnergyInfluence", "FrictionEnergyInfluence", "BuoyantEnergyInfluence"],
    },
  },
  "oscillations-waves": {
    Oscillations: {
      objects: ["Pendulum", "Spring", "Mass on Spring"],
      globalTools: ["GravityOscillationInfluence"],
      objectTools: ["SpringOscillationInfluence", "DampingInfluence"],
    },
    Waves: {
      objects: ["Wave Source", "Medium", "Barrier"],
      globalTools: [],
      objectTools: ["WavePropagationInfluence"],
    },
  },
  sound: {
    "Sound Waves": {
      objects: ["Speaker", "Microphone", "Sound Source"],
      globalTools: [],
      objectTools: ["SoundPressureInfluence"],
    },
  },
  optics: {
    "Light and Reflection": {
      objects: ["Light Source", "Mirror", "Lens"],
      globalTools: [],
      objectTools: ["LightRayInfluence"],
    },
  },
  electricity: {
    "Electric Fields": {
      objects: ["Charge", "Capacitor", "Battery"],
      globalTools: [],
      objectTools: ["ElectricFieldInfluence"],
    },
  },
  electromagnetism: {
    "Magnetic Fields": {
      objects: ["Magnet", "Current Wire", "Coil"],
      globalTools: [],
      objectTools: ["MagneticFieldInfluence"],
    },
  },
  thermodynamics: {
    "Heat Transfer": {
      objects: ["Heat Source", "Insulator", "Conductor"],
      globalTools: [],
      objectTools: ["HeatFlowInfluence"],
    },
  },
  "astronomy-earth": {
    "Planetary Motion": {
      objects: ["Planet", "Star", "Satellite"],
      globalTools: ["GravitationalOrbitInfluence"],
      objectTools: [],
    },
  },
};

export default physicsData;