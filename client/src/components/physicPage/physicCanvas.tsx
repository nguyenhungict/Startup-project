// src/components/physicPage/PhysicsCanvas.tsx
import React, { useEffect, useRef, useState } from "react";
import Konva from "konva";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"; // Ensure icons are imported if used elsewhere

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
  const [objects, setObjects] = useState<
    {
      id: string;
      type?: string;
      x: number;
      y: number;
      angle: number;
      label: string;
      size?: number;
      color?: string;
      length?: number;
      velocityX?: number;
      velocityY?: number;
      startX?: number;
      startY?: number;
      endX?: number;
      endY?: number;
    }[]
  >([]);
  const animationRef = useRef<number | null>(null);

  // Define scale factor (pixels per physics unit, e.g., meters)
  const SCALE_FACTOR = 50; // Adjust this based on your physics units (e.g., 50 pixels = 1 meter)
  const GRID_OFFSET = 6 * SCALE_FACTOR; // Offset for 6 grid blocks (300px)

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

  // Draw coordinate system (grid and axes) with origin offset by 6 grid blocks, ensuring negative lines
  useEffect(() => {
    if (!gridLayerRef.current || !stageRef.current) return;

    const gridLayer = gridLayerRef.current;
    gridLayer.destroyChildren();

    if (showCoordinates) {
      const width = stageRef.current.width();
      const height = stageRef.current.height();
      const centerY = height / 2;
      const gridSize = SCALE_FACTOR; // Grid spacing in pixels (1 meter)

      // Draw vertical grid lines (from left edge to right, including left of offset)
      for (let x = 0; x <= width; x += gridSize) {
        const line = new Konva.Line({
          points: [x, 0, x, height],
          stroke: "#ccc",
          strokeWidth: 1,
        });
        gridLayer.add(line);
      }

      // Draw horizontal grid lines (centered vertically)
      for (let y = centerY; y <= height; y += gridSize) {
        const line = new Konva.Line({
          points: [0, y, width, y],
          stroke: "#ccc",
          strokeWidth: 1,
        });
        gridLayer.add(line);
      }
      for (let y = centerY; y >= 0; y -= gridSize) {
        const line = new Konva.Line({
          points: [0, y, width, y],
          stroke: "#ccc",
          strokeWidth: 1,
        });
        gridLayer.add(line);
      }

      // Draw axes (origin at offset, X axis extended to left)
      const xAxis = new Konva.Line({
        points: [0, centerY, width, centerY],
        stroke: "#000",
        strokeWidth: 2,
      });
      const yAxis = new Konva.Line({
        points: [GRID_OFFSET, 0, GRID_OFFSET, height],
        stroke: "#000",
        strokeWidth: 2,
      });
      gridLayer.add(xAxis, yAxis);

      // Add labels for axes (showing physics units, aligned with grid)
      // X labels (to the left and right of origin, ensuring negative coverage)
      for (let x = GRID_OFFSET; x >= 0; x -= gridSize) {
        const physicsX = (x - GRID_OFFSET) / SCALE_FACTOR; // Convert to physics units from offset
        const label = new Konva.Text({
          x: x + 2,
          y: centerY + 2,
          text: physicsX.toFixed(0),
          fontSize: 12,
          fill: "#000",
        });
        gridLayer.add(label);
      }
      for (let x = GRID_OFFSET; x <= width; x += gridSize) {
        const physicsX = (x - GRID_OFFSET) / SCALE_FACTOR; // Convert to physics units from offset
        const label = new Konva.Text({
          x: x + 2,
          y: centerY + 2,
          text: physicsX.toFixed(0),
          fontSize: 12,
          fill: "#000",
        });
        gridLayer.add(label);
      }

      // Y labels (below center)
      for (let y = centerY; y <= height; y += gridSize * 2) {
        const physicsY = (centerY - y) / SCALE_FACTOR; // Convert to physics units (y-down)
        const label = new Konva.Text({
          x: GRID_OFFSET + 2,
          y: y + 2,
          text: physicsY.toFixed(0),
          fontSize: 12,
          fill: "#000",
        });
        gridLayer.add(label);
      }
      // Above center
      for (let y = centerY; y >= 0; y -= gridSize * 2) {
        const physicsY = (centerY - y) / SCALE_FACTOR; // Convert to physics units (y-down)
        const label = new Konva.Text({
          x: GRID_OFFSET + 2,
          y: y + 2,
          text: physicsY.toFixed(0),
          fontSize: 12,
          fill: "#000",
        });
        gridLayer.add(label);
      }
    }

    gridLayer.draw();
  }, [showCoordinates, resetTrigger]);

  useEffect(() => {
    if (resetTrigger > 0 && layerRef.current) {
      setObjects([]);
      layerRef.current.destroyChildren();
      layerRef.current.draw();
      if (gridLayerRef.current) {
        gridLayerRef.current.draw();
      }
    }
  }, [resetTrigger]);

  // Map selectedObjects to canvas objects with scaled coordinate transformation
  useEffect(() => {
    if (!stageRef.current || !layerRef.current) return;

    const width = stageRef.current.width();
    const height = stageRef.current.height();
    const centerY = height / 2;

    const updatedObjects = selectedObjects.map((obj) => {
      const attrs = objectAttributes[obj.id] || {};
      const physicsX = attrs.position?.x ?? 0;
      const physicsY = attrs.position?.y ?? 0;
      return {
        id: obj.id,
        type: obj.type,
        x: physicsX * SCALE_FACTOR + GRID_OFFSET, // Start from offset
        y: physicsY * SCALE_FACTOR + centerY, // Vertically centered
        angle: attrs.angle ?? 0,
        label: obj.type,
        size: attrs.size ?? 20,
        color: attrs.color ?? "blue",
        length: attrs.length ? attrs.length * SCALE_FACTOR : undefined,
        velocityX: attrs.velocityX ?? 0,
        velocityY: attrs.velocityY ?? 0,
        startX: attrs.startX ? attrs.startX * SCALE_FACTOR + GRID_OFFSET : undefined,
        startY: attrs.startY ? attrs.startY * SCALE_FACTOR + centerY : undefined,
        endX: attrs.endX ? attrs.endX * SCALE_FACTOR + GRID_OFFSET : undefined,
        endY: attrs.endY ? attrs.endY * SCALE_FACTOR + centerY : undefined,
      };
    });
    setObjects(updatedObjects);
  }, [selectedObjects, objectAttributes]);

  // Focus on selected object when moving
  useEffect(() => {
    if (!stageRef.current || !isRunning || selectedObjects.length === 0) return;

    const focusObject = selectedObjects[0]; // Assume single selection for simplicity
    const attrs = objectAttributes[focusObject.id] || {};
    const physicsX = attrs.position?.x ?? 0;
    const physicsY = attrs.position?.y ?? 0;
    const canvasX = physicsX * SCALE_FACTOR + GRID_OFFSET;
    const canvasY = physicsY * SCALE_FACTOR + (stageRef.current.height() / 2);

    const updateFocus = () => {
      if (stageRef.current && isRunning) {
        const stage = stageRef.current;
        const stageWidth = stage.width();
        const stageHeight = stage.height();

        // Calculate target position to center the object
        const targetX = canvasX - stageWidth / 2;
        const targetY = canvasY - stageHeight / 2;

        // Apply panning with boundaries
        const x = -Math.max(0, Math.min(targetX, stageWidth - stageWidth)); // Adjusted to use stageWidth
        const y = -Math.max(0, Math.min(targetY, stageHeight - stageHeight)); // Adjusted to use stageHeight
        stage.position({ x, y });
        stage.batchDraw();

        animationRef.current = requestAnimationFrame(updateFocus);
      }
    };

    animationRef.current = requestAnimationFrame(updateFocus);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, selectedObjects, objectAttributes]);

  useEffect(() => {
    if (!layerRef.current) return;
    const layer = layerRef.current;
    layer.destroyChildren();

    objects.forEach((obj) => {
      let shape: Konva.Shape;
      const size = obj.size ?? 20;
      const color = obj.color ?? "blue";

      if (obj.type === "surface" && obj.startX !== undefined && obj.startY !== undefined && 
          obj.endX !== undefined && obj.endY !== undefined) {
        shape = new Konva.Line({
          points: [obj.startX, obj.startY, obj.endX, obj.endY],
          stroke: color,
          strokeWidth: 5,
          lineCap: "round",
        });
        layer.add(shape);
        return;
      }

      const objectType = obj.label?.toLowerCase() || obj.type?.toLowerCase() || "point mass";
      
      switch (objectType) {
        case "point mass":
        case "moving object":
          shape = new Konva.Circle({
            x: obj.x,
            y: obj.y,
            radius: size / 2,
            fill: color,
            stroke: "black",
            strokeWidth: 1,
            rotation: obj.angle,
          });
          break;
        case "box":
          shape = new Konva.Rect({
            x: obj.x,
            y: obj.y,
            width: size,
            height: size,
            fill: color,
            stroke: "black",
            strokeWidth: 1,
            rotation: obj.angle,
            offset: { x: size / 2, y: size / 2 },
          });
          break;
        case "car":
          shape = new Konva.Rect({
            x: obj.x,
            y: obj.y,
            width: size,
            height: size / 2,
            fill: color,
            stroke: "black",
            strokeWidth: 1,
            rotation: obj.angle,
            offset: { x: size / 2, y: size / 4 },
          });
          break;
        case "ramp":
          shape = new Konva.Rect({
            x: obj.x,
            y: obj.y,
            width: size,
            height: 20,
            fill: color,
            stroke: "black",
            strokeWidth: 1,
            rotation: obj.angle,
            offset: { x: size / 2, y: 10 },
          });
          break;
        case "circle path":
          shape = new Konva.Circle({
            x: obj.x,
            y: obj.y,
            radius: size / 2,
            fill: color,
            stroke: "black",
            strokeWidth: 1,
            rotation: obj.angle,
          });
          const path = new Konva.Circle({
            x: obj.x - (obj.length ?? 100) * Math.cos((obj.angle * Math.PI) / 180),
            y: obj.y - (obj.length ?? 100) * Math.sin((obj.angle * Math.PI) / 180),
            radius: obj.length ?? 100,
            stroke: "black",
            strokeWidth: 1,
            dash: [5, 5],
          });
          layer.add(path);
          break;
        default:
          shape = new Konva.Circle({
            x: obj.x,
            y: obj.y,
            radius: size / 2,
            fill: color,
            stroke: "black",
            strokeWidth: 1,
            rotation: obj.angle,
          });
      }
      layer.add(shape);

      const velocityX = obj.velocityX ?? 0;
      const velocityY = obj.velocityY ?? 0;
      const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      
      if (velocityMagnitude > 0.1) {
        const scale = Math.min(50, 10 + velocityMagnitude * 5);
        const normalizedVelX = velocityX / velocityMagnitude;
        const normalizedVelY = velocityY / velocityMagnitude;
        
        const arrow = new Konva.Arrow({
          x: obj.x,
          y: obj.y,
          points: [0, 0, normalizedVelX * scale, normalizedVelY * scale],
          pointerLength: 8,
          pointerWidth: 6,
          fill: "red",
          stroke: "red",
          strokeWidth: 2,
        });
        layer.add(arrow);
        
        const velText = new Konva.Text({
          x: obj.x + normalizedVelX * scale + 5,
          y: obj.y + normalizedVelY * scale - 5,
          text: `v=${velocityMagnitude.toFixed(1)}`,
          fontSize: 12,
          fill: "red",
        });
        layer.add(velText);
      }
    });

    layer.draw();
  }, [objects]);

  return <div ref={containerRef} className="flex-1 h-[calc(60vh-3rem)] bg-white border" />;
};

export default Canvas;