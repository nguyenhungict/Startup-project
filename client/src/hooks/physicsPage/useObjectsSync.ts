// src/hooks/physicsPage/useObjectsSync.ts - FIXED VERSION
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
    if (isSimulationRunning) {
      console.log("🚫 Simulation running - skipping React → Engine sync");
      return;
    }

    console.log("🔄 React → Engine sync (simulation stopped)");
    
    selectedObjects.forEach(obj => {
      if (obj.id in objectAttributes && manager.hasObject(obj.id)) {
        let baseAttrs = objectAttributes[obj.id] || {};

        // Ensure runtime fields exist in React state and get the merged result
        baseAttrs = seedMissingRuntimeFields(obj.id, baseAttrs);

        // Build attrs to send — include all form attributes plus runtime fields
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
      newObj.mass = obj.mass ?? prevObj.mass ?? 1;
      newObj.size = obj.size ?? prevObj.size ?? 30;
      newObj.color = obj.color ?? prevObj.color ?? "blue";

      merged[obj.id] = newObj;
    });

    return merged;
  };

  // ================================
  // Engine → React sync (when NOT running) - FIXED: Added missing return!
  // ================================
  useEffect(() => {
    if (isSimulationRunning) {
      console.log("🚫 Simulation running - skipping Engine → React sync (static)");
      return; // ← THIS WAS MISSING!
    }

    console.log("🔄 Engine → React sync (simulation stopped)");

    const updateAttributes = () => {
      const state = manager.getState();
      setObjectAttributes(prev => {
        // if engine returned empty state, preserve prev entirely
        if (!Array.isArray(state) || state.length === 0) {
          prevAttributesRef.current = prev;
          return prev;
        }

        const merged = mergeEngineState(prev, state);
        prevAttributesRef.current = merged;
        console.log("useObjectsSync: Updated objectAttributes (stopped)", merged);
        return merged;
      });
    };

    updateAttributes();
  }, [selectedObjects, manager, setObjectAttributes, isSimulationRunning]);

  // ================================
  // Engine → React sync (when RUNNING) - Animation loop
  // ================================
  // Fix for useObjectsSync - Animation Loop Effect
useEffect(() => {
  if (!isSimulationRunning) {
    console.log("🚫 Simulation stopped - skipping animation loop");
    return;
  }

  console.log("🎬 Starting Engine → React sync animation loop");

  const updateAttributes = () => {
    const state = manager.getState();
    
    setObjectAttributes(prev => {
      // Force new object creation for React to detect changes
      const merged: Record<string, any> = {};
      
      // Copy all previous attributes first
      Object.keys(prev).forEach(id => {
        merged[id] = { ...prev[id] }; // Shallow clone each object
      });

      // Update with engine state
      state.forEach((obj: any) => {
        if (merged[obj.id]) {
          // Create a completely new object to trigger re-render
          merged[obj.id] = {
            ...merged[obj.id], // Keep form fields
            position: obj.position ? { x: obj.position.x, y: obj.position.y } : merged[obj.id].position,
            velocityX: obj.velocity?.x ?? merged[obj.id].velocityX,
            velocityY: obj.velocity?.y ?? merged[obj.id].velocityY,
            accelerationX: obj.acceleration?.x ?? merged[obj.id].accelerationX,
            accelerationY: obj.acceleration?.y ?? merged[obj.id].accelerationY,
            // Force timestamp to ensure React sees this as a new object
            _timestamp: performance.now()
          };
        }
      });

      console.log("Animation update:", {
        stateCount: state.length,
        mergedKeys: Object.keys(merged),
        firstObj: merged[Object.keys(merged)[0]]
      });
      
      return merged;
    });
    
    animationRef.current = requestAnimationFrame(updateAttributes);
  };

  animationRef.current = requestAnimationFrame(updateAttributes);
  
  return () => {
    console.log("🛑 Stopping Engine → React sync animation loop");
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };
}, [isSimulationRunning, manager, setObjectAttributes]);
};