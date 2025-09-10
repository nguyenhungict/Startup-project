// src/components/physicPage/PhysicsCanvas.tsx
import React, { useEffect, useRef } from "react";
import Konva from "konva";
import { GridRenderer } from "../../Model/physic/render/GridRenderer";
import { ObjectRenderer } from "../../Model/physic/render/ObjectRenderer";

interface CanvasProps {
  isRunning: boolean;
  resetTrigger: number;
  selectedObjects: { id: string; type: string }[];
  objectAttributes: Record<string, Record<string, any>>;
  onObjectSelect: (item: string) => void;
  showCoordinates: boolean;
}

const Canvas: React.FC<CanvasProps> = ({
  isRunning,
  resetTrigger,
  selectedObjects,
  objectAttributes,
  onObjectSelect,
  showCoordinates,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const gridLayerRef = useRef<Konva.Layer | null>(null);
  const animationRef = useRef<number | null>(null);
  const SCALE_FACTOR = 50; // 1 meter = 50 pixels
  const GRID_OFFSET = 6 * SCALE_FACTOR; // Offset for 6 grid blocks

  // Initialize Konva stage and layers
  useEffect(() => {
    if (containerRef.current && !stageRef.current) {
      stageRef.current = new Konva.Stage({
        container: containerRef.current,
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
      gridLayerRef.current = new Konva.Layer();
      layerRef.current = new Konva.Layer();
      stageRef.current.add(gridLayerRef.current, layerRef.current);
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const item = e.dataTransfer?.getData("text/plain");
      if (item) onObjectSelect(item);
    };

    containerRef.current?.addEventListener("drop", handleDrop);
    containerRef.current?.addEventListener("dragover", (e) => e.preventDefault());

    return () => {
      if (stageRef.current) {
        stageRef.current.destroy();
        stageRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      containerRef.current?.removeEventListener("drop", handleDrop);
      containerRef.current?.removeEventListener("dragover", (e) => e.preventDefault());
    };
  }, []);

  // Draw grid and axes
  useEffect(() => {
    if (!gridLayerRef.current || !stageRef.current) return;
    GridRenderer.renderGrid({
      layer: gridLayerRef.current,
      stageWidth: stageRef.current!.width(), // Thêm ! để khẳng định không null
      stageHeight: stageRef.current!.height(), // Thêm ! để khẳng định không null
      scaleFactor: SCALE_FACTOR,
      gridOffset: GRID_OFFSET,
      showCoordinates,
    });
  }, [showCoordinates, resetTrigger]);

  // Reset canvas
  useEffect(() => {
    if (resetTrigger > 0 && layerRef.current && gridLayerRef.current) {
      layerRef.current.destroyChildren();
      layerRef.current.draw();
      gridLayerRef.current.draw();
    }
  }, [resetTrigger]);

  // Render objects
  useEffect(() => {
    if (!layerRef.current || !stageRef.current) return;
    const layer = layerRef.current;
    layer.destroyChildren();

    const objects = selectedObjects.map((obj) => ({
      id: obj.id,
      type: obj.type,
      ...objectAttributes[obj.id],
      x: (objectAttributes[obj.id]?.position?.x ?? 0) * SCALE_FACTOR + GRID_OFFSET,
      y: -(objectAttributes[obj.id]?.position?.y ?? 0) * SCALE_FACTOR + stageRef.current!.height() / 2, // Thêm ! để khẳng định không null
    }));

    objects.forEach((obj) => {
      ObjectRenderer.render(obj, layer, { scaleFactor: SCALE_FACTOR });
    });

    layer.draw();
  }, [selectedObjects, objectAttributes]);

  // Focus on moving object
  useEffect(() => {
    if (!stageRef.current || !isRunning || selectedObjects.length === 0) return;
    const focusObject = selectedObjects[0];
    const attrs = objectAttributes[focusObject.id] || {};
    const canvasX = (attrs.position?.x ?? 0) * SCALE_FACTOR + GRID_OFFSET;
    const canvasY = (attrs.position?.y ?? 0) * SCALE_FACTOR + stageRef.current!.height() / 2; // Thêm ! để khẳng định không null

    const updateFocus = () => {
      if (!stageRef.current || !isRunning) return;
      const stage = stageRef.current;
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      const targetX = canvasX - stageWidth / 2;
      const targetY = canvasY - stageHeight / 2;
      const x = -Math.max(0, Math.min(targetX, stageWidth - stageWidth));
      const y = -Math.max(0, Math.min(targetY, stageHeight - stageHeight));
      stage.position({ x, y });
      stage.batchDraw();
      animationRef.current = requestAnimationFrame(updateFocus);
    };

    animationRef.current = requestAnimationFrame(updateFocus);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, selectedObjects, objectAttributes]);

  return <div ref={containerRef} className="flex-1 h-[calc(60vh-3rem)] bg-white border" />;
};

export default Canvas;