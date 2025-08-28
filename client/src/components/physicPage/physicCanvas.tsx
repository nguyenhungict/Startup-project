
// src/components/physicPage/PhysicsCanvas.tsx
import React, { useEffect, useRef, useState } from "react";
import Konva from "konva";
import type { PhysicsPageLogic } from "../../hooks/physicsPage/type";

interface CanvasProps {
  isRunning: boolean;
  resetTrigger: number;
  selectedObjects: { id: string; type: string }[];
  objectAttributes: Record<string, Record<string, any>>;
  onObjectSelect: (item: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  isRunning,
  resetTrigger,
  selectedObjects,
  objectAttributes,
  onObjectSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
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

  useEffect(() => {
    if (containerRef.current && !stageRef.current) {
      stageRef.current = new Konva.Stage({
        container: containerRef.current,
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
      layerRef.current = new Konva.Layer();
      stageRef.current.add(layerRef.current);
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

  useEffect(() => {
    if (resetTrigger > 0 && layerRef.current) {
      setObjects([]);
      layerRef.current.destroyChildren();
      layerRef.current.draw();
    }
  }, [resetTrigger]);

  useEffect(() => {
    if (!layerRef.current) return;
    // Map selectedObjects and objectAttributes to canvas objects
    const updatedObjects = selectedObjects.map((obj) => {
      const attrs = objectAttributes[obj.id] || {};
      return {
        id: obj.id,
        type: obj.type,
        x: attrs.position?.x ?? 0,
        y: attrs.position?.y ?? 0,
        angle: attrs.angle ?? 0,
        label: obj.type,
        size: attrs.size ?? 20,
        color: attrs.color ?? "blue",
        length: attrs.length,
        velocityX: attrs.velocityX ?? 0,
        velocityY: attrs.velocityY ?? 0,
        startX: attrs.startX,
        startY: attrs.startY,
        endX: attrs.endX,
        endY: attrs.endY,
      };
    });
    setObjects(updatedObjects);
  }, [selectedObjects, objectAttributes]);

  useEffect(() => {
    if (!layerRef.current) return;

    const update = () => {
      if (!isRunning) return;
      // In a real scenario, KinematicSimulationManager would update positions
      // For now, rely on objectAttributes updates via useEffect above
      if (isRunning) {
        animationRef.current = requestAnimationFrame(update);
      }
    };

    if (isRunning) {
      animationRef.current = requestAnimationFrame(update);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isRunning]);

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
