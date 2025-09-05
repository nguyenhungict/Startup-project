// src/pages/Physics/physicPage.tsx
import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

import { useSimulation } from "../../hooks/physicsPage/useSimulation";
import PhysicsSidebar from "../../components/physicPage/physicsSideBar";
import SimulationControls from "../../components/physicPage/simulationControl";
import StatusBox from "../../components/physicPage/statusBox";
import AttributePopup from "../../components/physicPage/attributePopup";
import Canvas from "../../components/physicPage/physicCanvas";
import Toolbox from "../../components/physicPage/physicToolbox";

const PhysicPage: React.FC = () => {
  const {
    selectedTopic,
    selectedSubtopic,
    selectedObjects,
    selectedSupportTools,
    showPopup,
    popupItem,
    isSimulationRunning,
    canvasResetTrigger,
    physicsData,
    objectAttributes,
    supportToolAttributes,
    handleTopicSelect,
    handleSubtopicSelect,
    handleObjectSelect,
    handleSupportToolSelect,
    handlePopupClose,
    handlePopupSave,
    handleRunSimulation,
    handleStopSimulation,
    handleResetSimulation,
    getAttributesConfig,
    getCurrentSimulation,
    showCoordinates,
    toggleCoordinates,
  } = useSimulation();

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <PhysicsSidebar
        physicsData={physicsData}
        selectedTopic={selectedTopic}
        onTopicSelect={handleTopicSelect}
      />
      <div className="flex-1 flex min-w-0 overflow-hidden">
        {selectedTopic && (
          <div className="p-4 bg-white border-r w-72 flex-shrink-0 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {selectedTopic && !selectedSubtopic ? (
              <Toolbox
                simulations={{ objects: [], supportTools: [], subtopics: getCurrentSimulation().subtopics }}
                selectedSubtopic={selectedSubtopic}
                selectedObjects={selectedObjects}
                selectedSupportTools={selectedSupportTools}
                onSubtopicSelect={handleSubtopicSelect}
                onObjectSelect={handleObjectSelect}
                onSupportToolSelect={handleSupportToolSelect}
                isSupportToolToolbox={false}
              />
            ) : selectedTopic && selectedSubtopic ? (
              <>
                <div className="mb-4">
                  <button
                    onClick={() => handleSubtopicSelect(null)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to subtopics
                  </button>
                </div>
                <h3 className="text-lg font-bold mb-2">Objects</h3>
                <Toolbox
                  simulations={{ objects: getCurrentSimulation().objects, supportTools: [] }}
                  selectedSubtopic={selectedSubtopic}
                  selectedObjects={selectedObjects}
                  selectedSupportTools={selectedSupportTools}
                  onSubtopicSelect={handleSubtopicSelect}
                  onObjectSelect={handleObjectSelect}
                  onSupportToolSelect={handleSupportToolSelect}
                  isSupportToolToolbox={false}
                />
                <h3 className="text-lg font-bold mb-2 mt-4">Support Tools</h3>
                <Toolbox
                  simulations={{ objects: [], supportTools: getCurrentSimulation().supportTools }}
                  selectedSubtopic={selectedSubtopic}
                  selectedObjects={selectedObjects}
                  selectedSupportTools={selectedSupportTools}
                  onSubtopicSelect={handleSubtopicSelect}
                  onObjectSelect={handleObjectSelect}
                  onSupportToolSelect={handleSupportToolSelect}
                  isSupportToolToolbox={true}
                />
              </>
            ) : (
              <p className="text-center">No simulations available for this topic.</p>
            )}
          </div>
        )}
        <main className="flex-1 bg-gray-100 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <Canvas
              isRunning={isSimulationRunning}
              resetTrigger={canvasResetTrigger}
              selectedObjects={selectedObjects}
              objectAttributes={objectAttributes}
              onObjectSelect={handleObjectSelect}
              showCoordinates={showCoordinates}
            />
            <SimulationControls
              isRunning={isSimulationRunning}
              onRun={handleRunSimulation}
              onStop={handleStopSimulation}
              onReset={handleResetSimulation}
              showCoordinates={showCoordinates}
              onToggleCoordinates={toggleCoordinates}
            />
            <StatusBox
              selectedObjects={selectedObjects}
              selectedSupportTools={selectedSupportTools}
              objectAttributes={objectAttributes}
            />
          </div>
        </main>
      </div>
      {showPopup && popupItem && (
        <AttributePopup
          objectName={popupItem.type}
          attributesConfig={getAttributesConfig(popupItem.type, popupItem.isSupportTool)}
          attributes={
            popupItem.isSupportTool
              ? supportToolAttributes[popupItem.id] || {}
              : objectAttributes[popupItem.id] || {}
          }
          onClose={handlePopupClose}
          onSave={handlePopupSave}
        />
      )}
    </div>
  );
};

export default PhysicPage;