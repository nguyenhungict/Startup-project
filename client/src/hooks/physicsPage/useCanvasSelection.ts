// src/hooks/physicsPage/useCanvasSelection.ts
import { useState } from "react";

export function useCanvasSelection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function selectObject(id: string) {
    setSelectedId(id);
  }

  function clearSelection() {
    setSelectedId(null);
  }

  return { selectedId, selectObject, clearSelection };
}