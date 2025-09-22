// src/components/physicPage/PhysicsCanvas.tsx
import React, { useEffect, useRef, useState } from "react";
import Konva from "konva";
import { GridRenderer } from "../../Model/physic/render/GridRenderer";
import { ObjectRenderer } from "../../Model/physic/render/ObjectRenderer";

interface CanvasProps {
  isRunning: boolean;
  resetTrigger: number;
  selectedObjects: { id: string; type: string }[];
  objectAttributes: Record<string, Record<string, any>>;
  onObjectSelect: (item: string, position?: { x: number; y: number }) => void;
  onObjectToolDrop: (tool: string, targetObjectId: string) => void;
  showCoordinates: boolean;
  onObjectClick?: (objectId: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  isRunning,
  resetTrigger,
  selectedObjects,
  objectAttributes,
  onObjectSelect,
  onObjectToolDrop,
  showCoordinates,
  onObjectClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const gridLayerRef = useRef<Konva.Layer | null>(null);
  const animationRef = useRef<number | null>(null);
  const SCALE_FACTOR = 50; // 1 meter = 50 pixels
  const GRID_OFFSET = 6 * SCALE_FACTOR; // Offset for 6 grid blocks
  const [error, setError] = useState<string | null>(null);

  // Log container size
  useEffect(() => {
    if (containerRef.current) {
      console.log("Container size:", {
       width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  }, []);

  // Initialize Konva stage and layers, and handle drag-and-drop
  useEffect(() => {
    if (containerRef.current && !stageRef.current) {
      try {
        //console.log("Initializing Konva stage:", {
        //   width: containerRef.current.offsetWidth,
        //   height: containerRef.current.offsetHeight,
        // });
        stageRef.current = new Konva.Stage({
          container: containerRef.current,
          width: containerRef.current.offsetWidth || 400,
          height: containerRef.current.offsetHeight || 400,
        });
        gridLayerRef.current = new Konva.Layer();
        layerRef.current = new Konva.Layer();
        stageRef.current.add(gridLayerRef.current, layerRef.current);

        // Initialize grid rendering
        if (gridLayerRef.current && stageRef.current) {
          GridRenderer.renderGrid({
            layer: gridLayerRef.current,
            stageWidth: stageRef.current.width(),
            stageHeight: stageRef.current.height(),
            scaleFactor: SCALE_FACTOR,
            gridOffset: GRID_OFFSET,
            showCoordinates,
          });
        }
      } catch (err) {
        console.error("Error initializing Konva stage:", err);
        setError("Failed to initialize canvas");
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (!stageRef.current) return;

      const objectType = e.dataTransfer?.getData("objectType");
      const toolType = e.dataTransfer?.getData("toolType");
      const pointer = stageRef.current.getPointerPosition();
      const shape = pointer ? stageRef.current.getIntersection(pointer) : null;
      const targetObjectId = shape?.getAttr("modelId");

      if (objectType && pointer) {
        const canvasX = (pointer.x - GRID_OFFSET) / SCALE_FACTOR;
        const canvasY = -(pointer.y - stageRef.current!.height() / 2) / SCALE_FACTOR;
        //console.log("Dropping object:", { objectType, canvasX, canvasY });
        onObjectSelect(objectType, { x: canvasX, y: canvasY });
      } else if (objectType) {
        onObjectSelect(objectType);
      } else if (toolType && targetObjectId) {
        onObjectToolDrop(toolType, targetObjectId);
      }
    };

    const handleDragOver = (e: DragEvent) => e.preventDefault();

    containerRef.current?.addEventListener("drop", handleDrop);
    containerRef.current?.addEventListener("dragover", handleDragOver);

    return () => {
      containerRef.current?.removeEventListener("drop", handleDrop);
      containerRef.current?.removeEventListener("dragover", handleDragOver);
    };
  }, [ showCoordinates]);

  useEffect(() => {
  return () => {
    if (stageRef.current) {
      stageRef.current.destroy();
      stageRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
}, []); // Run cleanup only when component unmounts

  // Draw grid and axes on gridLayerRef
  useEffect(() => {
    if (!gridLayerRef.current || !stageRef.current) return;
    try {
      GridRenderer.renderGrid({
        layer: gridLayerRef.current,
        stageWidth: stageRef.current.width(),
        stageHeight: stageRef.current.height(),
        scaleFactor: SCALE_FACTOR,
        gridOffset: GRID_OFFSET,
        showCoordinates,
      });
    } catch (err) {
      console.error("Error rendering grid:", err);
      setError("Failed to render grid");
    }
  }, [showCoordinates]);

  // Reset canvas (clear only object layer)
  useEffect(() => {
    if (resetTrigger > 0 && layerRef.current) {
      //console.log("Resetting canvas layer");
      try {
        layerRef.current.destroyChildren();
        layerRef.current.draw();
      } catch (err) {
        console.error("Error resetting canvas layer:", err);
        setError("Failed to reset canvas");
      }
    }
  }, [resetTrigger]);

  // Render objects on layerRef
  useEffect(() => {
    //console.log("Rendering useEffect triggered:", { selectedObjects, objectAttributes });
    if (!layerRef.current || !stageRef.current) {
      console.warn("Stage or layer not initialized:", { stage: !!stageRef.current, layer: !!layerRef.current });
      return;
    }

    const layer = layerRef.current;
    //console.log("Clearing layer children");
    try {
      layer.destroyChildren();

      selectedObjects.forEach((obj) => {
        const attrs = objectAttributes[obj.id];
        if (!attrs) {
          console.warn(`No attributes found for object ${obj.id}, skipping render`);
          return;
        }
        //console.log(`Rendering object ${obj.id}:`, { attrs });

        const position = attrs.position || { x: 0, y: 0 };
        const canvasX = position.x * SCALE_FACTOR + GRID_OFFSET;
        const canvasY = -position.y * SCALE_FACTOR + stageRef.current!.height() / 2;
        //console.log(`Canvas coordinates for ${obj.id}:`, { canvasX, canvasY, stageHeight: stageRef.current!.height() });

        try {
          const shape = ObjectRenderer.renderObject(obj.type, {
            ...attrs,
            id: obj.id,
            position: { x: canvasX, y: canvasY },
          });
          if (!shape) {
            console.error(`ObjectRenderer returned null for ${obj.id}, type: ${obj.type}`);
            return;
          }
          //console.log(`Shape created for ${obj.id}:`, shape.toJSON());
          shape.setAttr("modelId", obj.id);
          shape.on("click", () => {
            //console.log(`Object ${obj.id} clicked`);
            try {
              onObjectClick?.(obj.id);
            } catch (err) {
              console.error("Error handling object click:", err);
              setError("Failed to handle object click");
            }
          });
          layer.add(shape);
        } catch (error) {
          console.error(`Error rendering object ${obj.id}:`, error);
          setError(`Failed to render object ${obj.id}`);
        }
      });

      //console.log("Drawing layer");
      layer.draw();
    } catch (err) {
      console.error("Error drawing layer:", err);
      setError("Failed to draw canvas layer");
    }
  }, [selectedObjects, objectAttributes, onObjectClick]);

  

  // Focus on moving object
  useEffect(() => {
    if (!stageRef.current || !isRunning || selectedObjects.length === 0) return;
    const focusObject = selectedObjects[0];
    const attrs = objectAttributes[focusObject.id] || {};
    const position = attrs.position || { x: 0, y: 0 };
    const canvasX = position.x * SCALE_FACTOR + GRID_OFFSET;
    const canvasY = -position.y * SCALE_FACTOR + stageRef.current!.height() / 2;

    const updateFocus = () => {
      if (!stageRef.current || !isRunning) return;
      try {
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
      } catch (err) {
        console.error("Error in focus animation:", err);
        setError("Failed to update canvas focus");
      }
    };

    animationRef.current = requestAnimationFrame(updateFocus);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, selectedObjects, objectAttributes]);

  if (error) {
    return <div className="text-red-500 p-4">Canvas Error: {error}</div>;
  }

  return <div ref={containerRef} className="flex-1 h-[calc(60vh-3rem)] bg-white border" />;
};

export default Canvas;