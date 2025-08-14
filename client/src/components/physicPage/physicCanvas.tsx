import React, { useRef, useEffect } from "react";
import Konva from "konva";

interface CanvasProps {
  selectedObject: string | null;
  onDrop: (object: string) => void;
  onAttributeChange: (attributes: { size: number; color: string }) => void;
}

const Canvas: React.FC<CanvasProps> = ({ selectedObject, onDrop, onAttributeChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const shapeRef = useRef<Konva.Rect | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;

      const stage = new Konva.Stage({
        container: containerRef.current,
        width: width,
        height: height,
      });
      stageRef.current = stage;

      const layer = new Konva.Layer();
      stage.add(layer);

      // Initial text instruction
      const text = new Konva.Text({
        text: "Drop objects here",
        fontSize: 20,
        fill: "gray",
        align: "center",
        x: width / 2,
        y: height / 2,
        width: width,
      });
      layer.add(text);

      return () => {
        stage.destroy();
      };
    }
  }, []);

  useEffect(() => {
    if (stageRef.current && selectedObject) {
      const layer = stageRef.current.getLayers()[0];
      if (shapeRef.current) {
        shapeRef.current.destroy();
      }

      const width = stageRef.current.width();
      const height = stageRef.current.height();

      // Create a rectangle as a placeholder shape
      const shape = new Konva.Rect({
        x: width / 2 - 25,
        y: height / 2 - 25,
        width: 50,
        height: 50,
        fill: "#000000",
        draggable: true,
        dragBoundFunc: (pos) => {
          const newX = Math.max(0, Math.min(pos.x, width - shape.width()));
          const newY = Math.max(0, Math.min(pos.y, height - shape.height()));
          return {
            x: newX,
            y: newY,
          };
        },
      });
      shapeRef.current = shape;
      layer.add(shape);

      // Update attributes if available
      if (selectedObject.includes("(")) {
        const match = selectedObject.match(/Size: (\d+), Color: (#[0-9A-Fa-f]{6})/);
        if (match) {
          const size = Number(match[1]);
          const color = match[2];
          shape.width(size * 5);
          shape.height(size * 5);
          shape.fill(color);
        }
      }

      layer.draw();
    }
  }, [selectedObject]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const object = event.dataTransfer.getData("text/plain");
    onDrop(object);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 border border-gray-300 bg-white rounded-md"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    />
  );
};

export default Canvas;