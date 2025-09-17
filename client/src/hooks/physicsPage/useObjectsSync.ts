// src/hooks/physicsPage/useObjectsSync.ts
import { useEffect, useRef } from "react";
import type { SupportTool } from "./useSimulation";

export const useObjectsSync = (
  manager: any,
  selectedObjects: { id: string; type: string }[],
  selectedGlobalTools: { id: string; type: string }[],
  selectedObjectTools: SupportTool[],
  objectAttributes: Record<string, any>,
  globalToolAttributes: Record<string, any>,
  objectToolAttributes: Record<string, any>,
  isSimulationRunning: boolean,
  setObjectAttributes: React.Dispatch<React.SetStateAction<Record<string, any>>>
) => {
  const prevAttributesRef = useRef<Record<string, any>>({});

  // React → Engine sync
  useEffect(() => {
    if (isSimulationRunning) return;
    selectedObjects.forEach(obj => {
      if (obj.id in objectAttributes) {
        manager.updateItem(obj.id, obj.type, objectAttributes[obj.id] || {}, false);
      }
    });
    selectedGlobalTools.forEach(tool => {
      manager.updateItem(tool.id, tool.type, globalToolAttributes[tool.id] || {}, true);
    });
    selectedObjectTools.forEach(tool => {
      manager.updateItem(tool.id, tool.type, { ...objectToolAttributes[tool.id] || {}, targetObjectId: tool.targetObjectId }, true);
    });
  }, [
    selectedObjects, selectedGlobalTools, selectedObjectTools,
    objectAttributes, globalToolAttributes, objectToolAttributes,
    isSimulationRunning, manager,
  ]);

  // Engine → React sync (conditional)
  useEffect(() => {
    const state = manager.getState();
    setObjectAttributes((prev) => {
      const newAttributes = state.reduce((acc: Record<string, any>, obj: any) => {
        const newObjAttrs = {
          position: obj.position ? { x: obj.position.x, y: obj.position.y } : { x: 0, y: 0 },
          velocityX: obj.velocity?.x ?? 0,
          velocityY: obj.velocity?.y ?? 0,
          accelerationX: obj.acceleration?.x ?? 0,
          accelerationY: obj.acceleration?.y ?? 0,
          mass: obj.mass ?? 1,
          size: obj.size ?? 30,
          color: obj.color ?? "blue",
        };
        // Only update if changed
        if (JSON.stringify(newObjAttrs) !== JSON.stringify(prev[obj.id])) {
          acc[obj.id] = newObjAttrs;
        }
        return acc;
      }, {});
      const updated = { ...prev, ...newAttributes };
      prevAttributesRef.current = updated;
      return updated;
    });
  }, [selectedObjects, manager, setObjectAttributes]);

  // Simulation-time sync
  useEffect(() => {
    if (!isSimulationRunning) return;
    const interval = setInterval(() => {
      const state = manager.getState();
      setObjectAttributes((prev) => ({
        ...prev,
        ...state.reduce((acc: Record<string, any>, obj: any) => ({
          ...acc,
          [obj.id]: {
            position: { x: obj.position.x, y: obj.position.y },
            velocityX: obj.velocity?.x ?? 0,
            velocityY: obj.velocity?.y ?? 0,
            accelerationX: obj.acceleration?.x ?? 0,
            accelerationY: obj.acceleration?.y ?? 0,
            mass: obj.mass ?? 1,
            size: obj.size ?? 30,
            color: obj.color ?? "blue",
          },
        }), {}),
      }));
    }, 16);
    return () => clearInterval(interval);
  }, [isSimulationRunning, manager, setObjectAttributes]);
};