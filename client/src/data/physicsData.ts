// data/physicsData.ts
export interface PhysicsData {
  [topic: string]: {
    [subtopic: string]: {
      objects: string[];
      supportTools: string[];
    };
  };
}

export const physicsData: PhysicsData = {
  mechanics: {
    Kinematics: {
      objects: ["Moving Object"],
      supportTools: ["Gravity", "Surface"],
    },
    Dynamics: {
      objects: ["Box", "Ramp", "Force Vector", "Friction Surface", "Lever", "Fulcrum", "Weights", "Rotating Wheel"],
      supportTools: ["GravityForceVector", "FrictionForceVector", "NormalForceVector", "AppliedForceVector"],
    },
    Energy: {
      objects: ["Box", "Spring", "Sphere", "Cart", "Flat Surface", "Container", "Liquid", "Floating Object", "Elastic Rod", "Weight"],
      supportTools: ["GravityEnergyInfluence", "SpringEnergyInfluence", "FrictionEnergyInfluence", "BuoyantEnergyInfluence"],
    },
  },
  "oscillations-waves": {
    Oscillations: {
      objects: ["Pendulum", "Spring", "Mass on Spring"],
      supportTools: ["GravityOscillationInfluence", "SpringOscillationInfluence", "DampingInfluence"],
    },
    Waves: {
      objects: ["Wave Source", "Medium", "Barrier"],
      supportTools: ["WavePropagationInfluence"],
    },
  },
  sound: {
    "Sound Waves": {
      objects: ["Speaker", "Microphone", "Sound Source"],
      supportTools: ["SoundPressureInfluence"],
    },
  },
  optics: {
    "Light and Reflection": {
      objects: ["Light Source", "Mirror", "Lens"],
      supportTools: ["LightRayInfluence"],
    },
  },
  electricity: {
    "Electric Fields": {
      objects: ["Charge", "Capacitor", "Battery"],
      supportTools: ["ElectricFieldInfluence"],
    },
  },
  electromagnetism: {
    "Magnetic Fields": {
      objects: ["Magnet", "Current Wire", "Coil"],
      supportTools: ["MagneticFieldInfluence"],
    },
  },
  thermodynamics: {
    "Heat Transfer": {
      objects: ["Heat Source", "Insulator", "Conductor"],
      supportTools: ["HeatFlowInfluence"],
    },
  },
  "astronomy-earth": {
    "Planetary Motion": {
      objects: ["Planet", "Star", "Satellite"],
      supportTools: ["GravitationalOrbitInfluence"],
    },
  },
};

export default physicsData;