
import React, { useState } from "react";
import Sidebar from "../../components/ui/sideBar";
import Toolbox from "../../components/physicPage/physicToolbox";
import StatusBox from "../../components/physicPage/statusBox";
import Canvas from "../../components/physicPage/physicCanvas";
import AttributePopup from "../../components/physicPage/attributePopup";
import SimulationControls from "../../components/physicPage/simulationControl";

interface Attribute {
  name: string;
  key: string;
  type: "number" | "color";
  defaultValue: number | string;
}

export default function PhysicsPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setSelectedObject(null);
    setShowPopup(false);
    console.log(`Selected topic: ${topicId}`);
  };

  const handleObjectSelect = (object: string) => {
    setSelectedObject(object);
    setShowPopup(true);
    console.log(`Selected object: ${object}`);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handlePopupSave = (attributes: Record<string, number | string>) => {
    console.log(`Saved attributes for ${selectedObject}:`, attributes);
    setShowPopup(false);
    // Update selectedObject with a stringified version of attributes
    const attributesString = Object.entries(attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    setSelectedObject(`${selectedObject} (${attributesString})`);
    handleAttributeChange(attributes);
  };

  const [canvasResetTrigger, setCanvasResetTrigger] = useState(0);

  const handleAttributeChange = (attributes: Record<string, number | string>) => {
    console.log("Attribute change triggered:", attributes);
  };

  const handleRunSimulation = () => {
    setIsSimulationRunning(true);
    console.log("Running simulation");
  };

  const handleStopSimulation = () => {
    setIsSimulationRunning(false);
    console.log("Stopping simulation");
  };

  const handleResetSimulation = () => {
    setIsSimulationRunning(false);
    setCanvasResetTrigger((prev) => prev + 1); // Trigger reset in canvas
    console.log("Resetting simulation");
  };

  const getSimulationObjects = () => {
    switch (selectedTopic) {
      case "mechanics":
        return {
          objects: ["Sphere", "Box", "Car", "Ramp", "Pulley", "Spring", "Force Vector", "Ruler", "Stopwatch", "Force Gauge", "Horizontal Plane", "Inclined Plane"],
          simulations: ["Motion", "Newton's Laws", "Energy", "Momentum", "Torque"],
        };
      case "oscillations-waves":
        return {
          objects: ["Spring-Mass", "Pendulum", "String", "Wave Medium", "Frequency Slider", "Twisted Pendulum", "Wave Tube"],
          simulations: ["Harmonic Oscillation", "Wave Interference", "Standing Waves"],
        };
      case "sound":
        return {
          objects: ["Speaker", "Microphone", "Barrier", "Waveform Visualizer", "Environment (Air)", "Environment (Water)", "Environment (Steel)"],
          simulations: ["Sound Propagation", "Frequency vs. Pitch", "Echo"],
        };
      case "optics":
        return {
          objects: ["Light Source", "Plane Mirror", "Concave Mirror", "Convex Mirror", "Converging Lens", "Diverging Lens", "Screen", "Angle Measurer"],
          simulations: ["Reflection", "Refraction", "Lens Imaging", "Dispersion"],
        };
      case "electricity":
        return {
          objects: ["Battery", "Resistor", "LED", "Switch", "Wires", "Voltmeter", "Ammeter", "Capacitor"],
          simulations: ["Coulomb's Law", "Electric Field", "Ohm's Law", "Circuits"],
        };
      case "electromagnetism":
        return {
          objects: ["Magnet", "Wire", "Coil", "Compass", "AC/DC Source", "Iron Nail"],
          simulations: ["Magnetic Field", "Electromagnetic Induction", "AC Current"],
        };
      case "thermodynamics":
        return {
          objects: ["Gas Container", "Thermometer", "Heater", "Particle System", "Pressure Gauge", "Cooler"],
          simulations: ["Gas Laws", "Heat Transfer", "Phase Changes"],
        };
      case "astronomy-earth":
        return {
          objects: ["Sun", "Earth", "Moon", "Planet", "Orbit Path", "Gravity Vector", "Time Clock"],
          simulations: ["Planetary Orbits", "Moon Phases", "Solar System"],
        };
      default:
        return { objects: [], simulations: [] };
    }
  };

  // Define attributes for each object
  const getAttributesConfig = (object: string | null): Attribute[] => {
    const defaultConfig: Attribute[] = [
      { name: "Mass", key: "mass", type: "number", defaultValue: 1 },
      { name: "Initial Velocity", key: "initialVelocity", type: "number", defaultValue: 0 },
      { name: "Force", key: "force", type: "number", defaultValue: 0 },
      { name: "Friction", key: "friction", type: "number", defaultValue: 0.1 },
      { name: "Size", key: "size", type: "number", defaultValue: 50 },
      { name: "Color", key: "color", type: "color", defaultValue: "#000000" },
    ];

    switch (object) {
      case "Sphere":
      case "Box":
      case "Car":
        return defaultConfig;
      case "Ramp":
      case "Inclined Plane":
        return [
          { name: "Angle", key: "angle", type: "number", defaultValue: 30 },
          { name: "Friction", key: "friction", type: "number", defaultValue: 0.1 },
          { name: "Length", key: "length", type: "number", defaultValue: 100 },
        ];
      case "Spring":
      case "Spring-Mass":
        return [
          { name: "Stiffness", key: "stiffness", type: "number", defaultValue: 100 },
          { name: "Mass", key: "mass", type: "number", defaultValue: 1 },
          { name: "Damping", key: "damping", type: "number", defaultValue: 0.1 },
          { name: "Color", key: "color", type: "color", defaultValue: "#000000" },
        ];
      case "Pendulum":
      case "Twisted Pendulum":
        return [
          { name: "Length", key: "length", type: "number", defaultValue: 100 },
          { name: "Mass", key: "mass", type: "number", defaultValue: 1 },
          { name: "Angle", key: "angle", type: "number", defaultValue: 0 },
          { name: "Color", key: "color", type: "color", defaultValue: "#000000" },
        ];
      case "Light Source":
      case "Speaker":
        return [
          { name: "Intensity", key: "intensity", type: "number", defaultValue: 1 },
          { name: "Color", key: "color", type: "color", defaultValue: "#ffffff" },
        ];
      default:
        return [];
    }
  };

  const renderSimulationContent = () => {
    return (
      <div>
        {selectedTopic ? (
          <>
            <p>Simulations: {getSimulationObjects().simulations.join(", ")}</p>
            {[...Array(20)].map((_, i) => (
              <p key={i} className="text-gray-600 mt-2">
                {selectedTopic} simulation content placeholder {i + 1}.
              </p>
            ))}
          </>
        ) : (
          <>
            <p>Select a topic to load simulation content.</p>
            {[...Array(20)].map((_, i) => (
              <p key={i} className="text-gray-600 mt-2">
                Default content placeholder {i + 1}.
              </p>
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <Sidebar onTopicSelect={handleTopicSelect} />
      <div className="flex-1 flex min-w-0 overflow-hidden">
        {selectedTopic && (
          <Toolbox
            simulationObjects={getSimulationObjects().objects}
            selectedTopic={selectedTopic}
            onObjectSelect={handleObjectSelect}
          />
        )}
        <main className="flex-1 bg-gray-100 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <Canvas
              selectedObject={selectedObject}
              onDrop={handleObjectSelect}
              onAttributeChange={handleAttributeChange}
              isRunning={isSimulationRunning}
              onSimulationStateChange={setIsSimulationRunning}
              resetTrigger={canvasResetTrigger}
            />
            <SimulationControls
              isRunning={isSimulationRunning}
              onRun={handleRunSimulation}
              onStop={handleStopSimulation}
              onReset={handleResetSimulation}
            />
            <StatusBox selectedObject={selectedObject} />
          </div>
        </main>
      </div>
      {showPopup && selectedObject && (
        <AttributePopup
          objectName={selectedObject}
          attributesConfig={getAttributesConfig(selectedObject)}
          onClose={handlePopupClose}
          onSave={handlePopupSave}
        />
      )}
    </div>
  );
}
