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
  const animationRef = useRef<number | null>(null);

  // React → Engine sync
  useEffect(() => {
    if (isSimulationRunning) return;
    selectedObjects.forEach(obj => {
      if (obj.id in objectAttributes && manager.hasObject(obj.id)) {
        const attrs = {
          ...objectAttributes[obj.id],
          position: objectAttributes[obj.id].position || { x: 4, y: 0 },
        };
        manager.updateItem(obj.id, obj.type, attrs, false);
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

  // Engine → React sync (non-simulation)
  useEffect(() => {
    if (isSimulationRunning) return;
    const updateAttributes = () => {
      const state = manager.getState();
      setObjectAttributes((prev) => {
        const newAttributes = state.reduce((acc: Record<string, any>, obj: any) => {
          const position = obj.position && !isNaN(obj.position.x) && !isNaN(obj.position.y)
            ? { x: obj.position.x, y: obj.position.y }
            : { x: 4, y: 0 };
          acc[obj.id] = {
            position,
            velocityX: obj.velocity?.x ?? 0,
            velocityY: obj.velocity?.y ?? 0,
            accelerationX: obj.acceleration?.x ?? 0,
            accelerationY: obj.acceleration?.y ?? 0,
            mass: obj.mass ?? 1,
            size: obj.size ?? 30,
            color: obj.color ?? "blue",
          };
          return acc;
        }, {});
        const updated = { ...prev, ...newAttributes };
        prevAttributesRef.current = updated;
        console.log("useObjectsSync: Updated objectAttributes", updated);
        return updated;
      });
    };

    updateAttributes();
  }, [selectedObjects, manager, setObjectAttributes, isSimulationRunning]);

  // Simulation-time sync
  useEffect(() => {
    if (!isSimulationRunning) return;

    const updateAttributes = () => {
      const state = manager.getState();
      setObjectAttributes((prev) => {
        const newAttributes = state.reduce((acc: Record<string, any>, obj: any) => {
          const position = obj.position && !isNaN(obj.position.x) && !isNaN(obj.position.y)
            ? { x: obj.position.x, y: obj.position.y }
            : { x: 4, y: 0 };
          acc[obj.id] = {
            position,
            velocityX: obj.velocity?.x ?? 0,
            velocityY: obj.velocity?.y ?? 0,
            accelerationX: obj.acceleration?.x ?? 0,
            accelerationY: obj.acceleration?.y ?? 0,
            mass: obj.mass ?? 1,
            size: obj.size ?? 30,
            color: obj.color ?? "blue",
          };
          return acc;
        }, {});
        const updated = { ...prev, ...newAttributes };
        console.log("useObjectsSync: Simulation update", updated);
        return updated;
      });
      animationRef.current = requestAnimationFrame(updateAttributes);
    };

    animationRef.current = requestAnimationFrame(updateAttributes);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSimulationRunning, manager, setObjectAttributes]);
};