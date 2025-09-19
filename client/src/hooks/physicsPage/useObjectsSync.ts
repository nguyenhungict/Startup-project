// src/hooks/physicsPage/useObjectsSync.ts
import { useEffect, useRef } from "react";
import type { supportTool } from "./useSimulation";

export const useObjectsSync = (
  manager: any,
  selectedObjects: { id: string; type: string }[],
  selectedGlobalTools: { id: string; type: string }[],
  selectedObjectTools: supportTool[],
  objectAttributes: Record<string, any>,
  globalToolAttributes: Record<string, any>,
  objectToolAttributes: Record<string, any>,
  isSimulationRunning: boolean,
  setObjectAttributes: React.Dispatch<React.SetStateAction<Record<string, any>>>
) => {
  const prevAttributesRef = useRef<Record<string, any>>({});
  const animationRef = useRef<number | null>(null);

  // Helper: ensure runtime fields exist (seed from initial fields) and persist them to React state.
  const seedMissingRuntimeFields = (id: string, baseAttrs: Record<string, any>) => {
    const updates: Record<string, any> = {};
    let needUpdate = false;

    // seed position from initialPosition if missing
    if (!baseAttrs.position && baseAttrs.initialPosition) {
      updates.position = { ...baseAttrs.initialPosition };
      needUpdate = true;
    }

    // seed runtime velocity from initialVelocity if missing
    if ((baseAttrs.velocityX === undefined || baseAttrs.velocityY === undefined) && baseAttrs.initialVelocity) {
      updates.velocityX = baseAttrs.initialVelocity.x ?? 0;
      updates.velocityY = baseAttrs.initialVelocity.y ?? 0;
      needUpdate = true;
    }

    // seed runtime acceleration from initialAcceleration if missing
    if ((baseAttrs.accelerationX === undefined || baseAttrs.accelerationY === undefined) && baseAttrs.initialAcceleration) {
      updates.accelerationX = baseAttrs.initialAcceleration.x ?? 0;
      updates.accelerationY = baseAttrs.initialAcceleration.y ?? 0;
      needUpdate = true;
    }

    // seed other simple fields (mass, size, color) if missing and provided as defaults
    if (baseAttrs.mass !== undefined && prevAttributesRef.current[id]?.mass === undefined) {
      // don't force overwrite if prev already had a mass
      updates.mass = baseAttrs.mass;
      needUpdate = true;
    }

    if (needUpdate) {
      setObjectAttributes(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          ...baseAttrs, // keep any recent changes
          ...updates,
        },
      }));
      // return combined attrs for immediate use too
      return { ...baseAttrs, ...updates };
    }

    return baseAttrs;
  };

  // ================================
  // React → Engine sync (when NOT running)
  // - seed missing runtime fields from initial* and persist them
  // - send full attribute object to manager.updateItem
  // ================================
  useEffect(() => {
    if (isSimulationRunning) return;

    selectedObjects.forEach(obj => {
      if (obj.id in objectAttributes && manager.hasObject(obj.id)) {
        let baseAttrs = objectAttributes[obj.id] || {};

        // Ensure runtime fields exist in React state and get the merged result
        baseAttrs = seedMissingRuntimeFields(obj.id, baseAttrs);

        // Build attrs to send — include all form attributes plus runtime fields
        // (do NOT inject arbitrary defaults like {x:4,y:0} here)
        const attrsToSend = { ...baseAttrs };

        console.log("Syncing objectAttributes to SimulationManager:", attrsToSend);
        manager.updateItem(obj.id, obj.type, attrsToSend, false);
      }
    });

    selectedGlobalTools.forEach(tool => {
      manager.updateItem(tool.id, tool.type, globalToolAttributes[tool.id] || {}, true);
    });

    selectedObjectTools.forEach(tool => {
      manager.updateItem(
        tool.id,
        tool.type,
        { ...(objectToolAttributes[tool.id] || {}), targetObjectId: tool.targetObjectId },
        true
      );
    });
  }, [
    selectedObjects, selectedGlobalTools, selectedObjectTools,
    objectAttributes, globalToolAttributes, objectToolAttributes,
    isSimulationRunning, manager, setObjectAttributes,
  ]);

  // ================================
  // Merge helper: merge engine state into prev state while preserving form attributes
  // - keeps prev keys (like initialVelocity/initialAcceleration etc.)
  // - prefer engine runtime values only when valid and non-zero (to avoid spurious 0,0 overwrites)
  // ================================
  const mergeEngineState = (
    prev: Record<string, any>,
    state: any[]
  ): Record<string, any> => {
    const merged: Record<string, any> = { ...prev };

    // state is an array of engine objects
    state.forEach(obj => {
      const prevObj = prev[obj.id] || {};

      const simHasPos = obj.position && !isNaN(obj.position.x) && !isNaN(obj.position.y);
      const isZeroPos = simHasPos && obj.position.x === 0 && obj.position.y === 0;

      // build the new runtime snapshot but start from prevObj so we preserve form fields
      const newObj = {
        ...prevObj, // preserve everything user has in prev (initial*, custom fields)
      };

      // update runtime position only when engine gives a valid non-zero value;
      // otherwise fallback to prevObj.position or prevObj.initialPosition
      if (simHasPos && !isZeroPos) {
        newObj.position = { x: obj.position.x, y: obj.position.y };
      } else if (prevObj.position) {
        // keep existing runtime position
        newObj.position = { ...prevObj.position };
      } else if (prevObj.initialPosition) {
        // initialize from initialPosition if engine hasn't provided a runtime one
        newObj.position = { ...prevObj.initialPosition };
      }

      // velocity/accel: prefer engine values when present, otherwise keep prev values
      if (obj.velocity && !isNaN(obj.velocity.x) && !isNaN(obj.velocity.y)) {
        newObj.velocityX = obj.velocity.x;
        newObj.velocityY = obj.velocity.y;
      } else {
        if (prevObj.velocityX !== undefined) newObj.velocityX = prevObj.velocityX;
        if (prevObj.velocityY !== undefined) newObj.velocityY = prevObj.velocityY;
      }

      if (obj.acceleration && !isNaN(obj.acceleration.x) && !isNaN(obj.acceleration.y)) {
        newObj.accelerationX = obj.acceleration.x;
        newObj.accelerationY = obj.acceleration.y;
      } else {
        if (prevObj.accelerationX !== undefined) newObj.accelerationX = prevObj.accelerationX;
        if (prevObj.accelerationY !== undefined) newObj.accelerationY = prevObj.accelerationY;
      }

      // other runtime fields from engine
      newObj.mass = obj.mass ?? prevObj.mass ?? prevObj.mass ?? 1;
      newObj.size = obj.size ?? prevObj.size ?? prevObj.size ?? 30;
      newObj.color = obj.color ?? prevObj.color ?? prevObj.color ?? "blue";

      merged[obj.id] = newObj;
    });

    return merged;
  };

  // ================================
  // Engine → React sync (when NOT running)
  // ================================
  useEffect(() => {
    if (isSimulationRunning) return;

    const updateAttributes = () => {
      const state = manager.getState();
      setObjectAttributes(prev => {
        // if engine returned empty state, preserve prev entirely
        if (!Array.isArray(state) || state.length === 0) {
          // no change, but keep prev stored copy
          prevAttributesRef.current = prev;
          return prev;
        }

        const merged = mergeEngineState(prev, state);
        prevAttributesRef.current = merged;
        console.log("useObjectsSync: Updated objectAttributes", merged);
        return merged;
      });
    };

    updateAttributes();
  }, [selectedObjects, manager, setObjectAttributes, isSimulationRunning]);

  // ================================
  // Engine → React sync (when RUNNING)
  // ================================
  useEffect(() => {
    if (!isSimulationRunning) return;

    const updateAttributes = () => {
      const state = manager.getState();
      setObjectAttributes(prev => {
        const merged = mergeEngineState(prev, state);
        console.log("useObjectsSync: Simulation update", merged);
        return merged;
      });
      animationRef.current = requestAnimationFrame(updateAttributes);
    };

    animationRef.current = requestAnimationFrame(updateAttributes);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSimulationRunning, manager, setObjectAttributes]);
};
