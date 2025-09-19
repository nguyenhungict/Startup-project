import React, { useMemo } from "react";
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
    selectedGlobalTools,
    selectedObjectTools,
    showPopup,
    popupItem,
    isSimulationRunning,
    canvasResetTrigger,
    physicsData,
    objectAttributes,
    globalToolAttributes,
    objectToolAttributes,
    handleTopicSelect,
    handleSubtopicSelect,
    handleObjectSelect,
    handleGlobalToolSelect,
    handleObjectToolSelect,
    handlePopupClose,
    handlePopupSave,
    handleRunSimulation,
    handleStopSimulation,
    handleResetSimulation,
    getAttributesConfig,
    getCurrentSimulation,
    showCoordinates,
    toggleCoordinates,
    gravity,
    updateGravity,
    handleCanvasObjectClick,
    setPendingToolType,
  } = useSimulation();

  const memoizedSelectedObjects = useMemo(() => selectedObjects, [selectedObjects]);
  const memoizedObjectAttributes = useMemo(() => objectAttributes, [objectAttributes]);
  const memoizedGlobalToolAttributes = useMemo(() => globalToolAttributes, [globalToolAttributes]);
  const memoizedObjectToolAttributes = useMemo(() => objectToolAttributes, [objectToolAttributes]);

  const popupTools = useMemo(
    () =>
      popupItem?.kind === "object"
        ? selectedObjectTools
            .filter((t) => t.targetObjectId === popupItem.id)
            .map((t) => ({
              id: t.id,
              name: t.type,
              attributesConfig: getAttributesConfig(t.type, "objectTool"),
              attributes: memoizedObjectToolAttributes[t.id] ?? {},
            }))
        : [],
    [popupItem, selectedObjectTools, memoizedObjectToolAttributes]
  );

  console.log("PhysicPage passing to Canvas:", { memoizedSelectedObjects, memoizedObjectAttributes });

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
            {!selectedSubtopic ? (
              <Toolbox
                simulations={{
                  objects: [],
                  globalTools: [],
                  objectTools: [],
                  subtopics: getCurrentSimulation().subtopics,
                }}
                selectedSubtopic={selectedSubtopic}
                selectedObjects={memoizedSelectedObjects}
                selectedGlobalTools={selectedGlobalTools}
                selectedObjectTools={selectedObjectTools}
                onSubtopicSelect={handleSubtopicSelect}
                onObjectSelect={handleObjectSelect}
                onGlobalToolSelect={handleGlobalToolSelect}
                setPendingToolType={setPendingToolType}
                activeToolbox="subtopic"
              />
            ) : (
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
                  simulations={{
                    objects: getCurrentSimulation().objects,
                    globalTools: [],
                    objectTools: [],
                  }}
                  selectedSubtopic={selectedSubtopic}
                  selectedObjects={memoizedSelectedObjects}
                  selectedGlobalTools={selectedGlobalTools}
                  selectedObjectTools={selectedObjectTools}
                  onSubtopicSelect={handleSubtopicSelect}
                  onObjectSelect={handleObjectSelect}
                  onGlobalToolSelect={handleGlobalToolSelect}
                  setPendingToolType={setPendingToolType}
                  activeToolbox="object"
                />

                <h3 className="text-lg font-bold mb-2 mt-4">Global Tools</h3>
                <Toolbox
                  simulations={{
                    objects: [],
                    globalTools: getCurrentSimulation().globalTools,
                    objectTools: [],
                  }}
                  selectedSubtopic={selectedSubtopic}
                  selectedObjects={memoizedSelectedObjects}
                  selectedGlobalTools={selectedGlobalTools}
                  selectedObjectTools={selectedObjectTools}
                  onSubtopicSelect={handleSubtopicSelect}
                  onObjectSelect={handleObjectSelect}
                  onGlobalToolSelect={handleGlobalToolSelect}
                  setPendingToolType={setPendingToolType}
                  activeToolbox="globalTool"
                />

                <h3 className="text-lg font-bold mb-2 mt-4">Object Tools</h3>
                <Toolbox
                  simulations={{
                    objects: [],
                    globalTools: [],
                    objectTools: getCurrentSimulation().objectTools,
                  }}
                  selectedSubtopic={selectedSubtopic}
                  selectedObjects={memoizedSelectedObjects}
                  selectedGlobalTools={selectedGlobalTools}
                  selectedObjectTools={selectedObjectTools}
                  onSubtopicSelect={handleSubtopicSelect}
                  onObjectSelect={handleObjectSelect}
                  onGlobalToolSelect={handleGlobalToolSelect}
                  setPendingToolType={setPendingToolType}
                  activeToolbox="objectTool"
                />
              </>
            )}
          </div>
        )}

        <main className="flex-1 bg-gray-100 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: '400px', minWidth: '400px' }}>
            <Canvas
              isRunning={isSimulationRunning}
              resetTrigger={canvasResetTrigger}
              selectedObjects={memoizedSelectedObjects}
              objectAttributes={memoizedObjectAttributes}
              onObjectSelect={handleObjectSelect}
              showCoordinates={showCoordinates}
              onObjectToolDrop={(toolType, targetObjectId) =>
                handleObjectToolSelect(toolType, targetObjectId)
              }
              onObjectClick={handleCanvasObjectClick}
            />

            <SimulationControls
              isRunning={isSimulationRunning}
              onRun={handleRunSimulation}
              onStop={handleStopSimulation}
              onReset={handleResetSimulation}
              showCoordinates={showCoordinates}
              onToggleCoordinates={toggleCoordinates}
              isGravityEnabled={gravity.enabled}
              onToggleGravity={() =>
                updateGravity({ enabled: !gravity.enabled })
              }
            />

            <StatusBox
              selectedObjects={memoizedSelectedObjects}
              selectedSupportTools={[
                ...selectedGlobalTools,
                ...selectedObjectTools,
              ]}
              objectAttributes={memoizedObjectAttributes}
            />
          </div>
        </main>

        {showPopup && popupItem && (
          <AttributePopup
            objectName={popupItem.type}
            attributesConfig={getAttributesConfig(popupItem.type, popupItem.kind)}
            attributes={
              popupItem.kind === "object"
                ? memoizedObjectAttributes[popupItem.id] ?? {}
                : popupItem.kind === "globalTool"
                ? memoizedGlobalToolAttributes[popupItem.id] ?? {}
                : memoizedObjectToolAttributes[popupItem.id] ?? {}
            }
            tools={popupTools}
            onClose={handlePopupClose}
            onSave={(data) => handlePopupSave({ object: data.attributes, tools: data.tools })}
          />
        )}
      </div>
    </div>
  );
};

export default PhysicPage;