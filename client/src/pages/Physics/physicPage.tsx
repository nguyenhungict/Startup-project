import React, { useState } from "react";
import Sidebar from "../../components/ui/sideBar";
import Toolbox from "../../components/physicPage/physicToolbox";
import StatusBox from "../../components/physicPage/statusBox";
import Canvas from "../../components/physicPage/physicCanvas";
import AttributePopup from "../../components/physicPage/attributePopup";

export default function PhysicsPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setSelectedObject(null); // Reset selected object when topic changes
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

  const handlePopupSave = (attributes: { size: number; color: string }) => {
    console.log(`Saved attributes for ${selectedObject}:`, attributes);
    setShowPopup(false);
    // Update selectedObject state with attributes if needed
    setSelectedObject(`${selectedObject} (Size: ${attributes.size}, Color: ${attributes.color})`);
    handleAttributeChange(attributes); // Notify canvas of attribute changes
  };

  const handleAttributeChange = (attributes: { size: number; color: string }) => {
    // This callback will be passed to Canvas to update the shape
    console.log("Attribute change triggered:", attributes);
  };

  const getSimulationObjects = () => {
    switch (selectedTopic) {
      case "mechanics":
        return {
          objects: ["Ball", "Ramp", "Car", "Pulley", "Spring", "Force Vector", "Ruler", "Stopwatch"],
          simulations: ["Motion", "Newton's Laws", "Energy", "Momentum", "Torque"],
        };
      case "oscillations-waves":
        return {
          objects: ["Spring-Mass", "Pendulum", "String", "Wave Medium", "Frequency Slider"],
          simulations: ["Harmonic Oscillation", "Wave Interference", "Standing Waves"],
        };
      case "sound":
        return {
          objects: ["Speaker", "Microphone", "Barrier", "Waveform Visualizer"],
          simulations: ["Sound Propagation", "Frequency vs. Pitch", "Echo"],
        };
      case "optics":
        return {
          objects: ["Light Source", "Mirror", "Lens", "Screen", "Angle Measurer"],
          simulations: ["Reflection", "Refraction", "Lens Imaging", "Dispersion"],
        };
      case "electricity":
        return {
          objects: ["Battery", "Resistor", "LED", "Switch", "Wires", "Voltmeter", "Ammeter"],
          simulations: ["Coulomb's Law", "Electric Field", "Ohm's Law", "Circuits"],
        };
      case "electromagnetism":
        return {
          objects: ["Magnet", "Wire", "Coil", "Compass", "AC/DC Source"],
          simulations: ["Magnetic Field", "Electromagnetic Induction", "AC Current"],
        };
      case "thermodynamics":
        return {
          objects: ["Gas Container", "Thermometer", "Heater", "Particle System"],
          simulations: ["Gas Laws", "Heat Transfer", "Phase Changes"],
        };
      case "astronomy-earth":
        return {
          objects: ["Sun", "Earth", "Moon", "Planets", "Orbit Paths", "Gravity Vector"],
          simulations: ["Planetary Orbits", "Moon Phases", "Solar System"],
        };
      default:
        return { objects: [], simulations: [] };
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
    <div className="flex h-[calc(100vh-4rem)]">
      <Sidebar onTopicSelect={handleTopicSelect} />
      <div className="flex-1 flex">
        {selectedTopic && (
          <div className="w-64 flex-shrink-0">
            <Toolbox
              simulationObjects={getSimulationObjects().objects}
              selectedTopic={selectedTopic}
              onObjectSelect={handleObjectSelect}
            />
          </div>
        )}
        <main className="flex-1 bg-gray-100 flex flex-col">
          <div className="flex-1 flex flex-col">
            <Canvas
              selectedObject={selectedObject}
              onDrop={handleObjectSelect}
              onAttributeChange={handleAttributeChange}
            />
            <StatusBox selectedObject={selectedObject} />
          </div>
        </main>
      </div>
      {showPopup && selectedObject && (
        <AttributePopup
          objectName={selectedObject}
          onClose={handlePopupClose}
          onSave={handlePopupSave}
        />
      )}
    </div>
  );
}