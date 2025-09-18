// src/hooks/physicsPage/useCanvasSelection.ts
import { useState } from "react";

export function useCanvasSelection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingToolType, setPendingToolType] = useState<string | null>(null); // ⬅️ add

  function selectObject(id: string) {
    setSelectedId(id);
  }

  function clearSelection() {
    setSelectedId(null);
  }

  return { 
    selectedId, selectObject, clearSelection,
    pendingToolType, setPendingToolType         // ⬅️ return these
  };
}
