// src/hooks/physicsPage/useCanvasObject.ts
import { KinematicSimulationManager } from "../../Model/physic/Topic/Mechanics/Kinematics/kinematicSimulationManaGer";

export function useCanvasObjects(manager: KinematicSimulationManager) {
  function createObject(type: string, defaultPosition: { x: number; y: number } = { x: 200, y: 200 }) {
    const id = `obj_${Date.now()}`;
    console.log("Creating object:", { id, type, defaultPosition });
    manager.addObjectFromType(type, id, { position: defaultPosition });
    return id;
  }

  function updateObject(id: string, type: string, attributes: Record<string, any>, isSupportTool = false) {
    manager.updateItem(id, type, attributes, isSupportTool);
  }

  return { createObject, updateObject };
}