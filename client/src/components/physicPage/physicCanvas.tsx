import React, { useRef, useEffect, useState } from "react";
import Konva from "konva";
import * as Matter from "matter-js";

interface CanvasProps {
  selectedObject: string | null;
  onDrop: (object: string) => void;
  onAttributeChange: (attributes: { mass: number; initialVelocity: number; force: number; friction: number; size: number; color: string }) => void;
  isRunning: boolean;
  onSimulationStateChange: (isRunning: boolean) => void;
  resetTrigger: number;
}

const Canvas: React.FC<CanvasProps> = ({ 
  selectedObject, 
  onDrop, 
  onAttributeChange, 
  isRunning, 
  onSimulationStateChange, 
  resetTrigger 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const bodies = useRef<Map<string, { body: Matter.Body; shape: Konva.Shape }>>(new Map());
  const [localIsRunning, setLocalIsRunning] = useState(false);

  // Sync with parent component's isRunning state
  useEffect(() => {
    setLocalIsRunning(isRunning);
  }, [isRunning]);

  // Handle reset trigger from parent
  useEffect(() => {
    if (resetTrigger > 0) {
      handleReset();
    }
  }, [resetTrigger]);

  // Handle simulation control from parent
  useEffect(() => {
    if (!engineRef.current || !runnerRef.current) return;

    if (isRunning && !localIsRunning) {
      Matter.Runner.run(runnerRef.current, engineRef.current);
      setLocalIsRunning(true);
    } else if (!isRunning && localIsRunning) {
      Matter.Runner.stop(runnerRef.current);
      setLocalIsRunning(false);
    }
  }, [isRunning, localIsRunning]);

  const initializeCanvas = () => {
    if (containerRef.current && !stageRef.current) {
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;

      const stage = new Konva.Stage({
        container: containerRef.current,
        width: width,
        height: height,
      });
      stageRef.current = stage;

      const layer = new Konva.Layer();
      layerRef.current = layer;
      stage.add(layer);

      const engine = Matter.Engine.create();
      engine.gravity.y = 1;
      engineRef.current = engine;
      const runner = Matter.Runner.create();
      runnerRef.current = runner;

      Matter.Events.on(engine, "afterUpdate", () => {
        bodies.current.forEach(({ body, shape }) => {
          shape.position({
            x: body.position.x,
            y: body.position.y,
          });
          shape.rotation(body.angle * (180 / Math.PI));
        });
        layer.batchDraw();
      });

      Matter.Events.on(engine, "collisionStart", (event) => {
        const pairs = event.pairs;
        pairs.forEach(pair => {
          console.log("Collision between", pair.bodyA.label, "and", pair.bodyB.label);
        });
      });
    }
  };

  const handleResize = () => {
    if (containerRef.current && stageRef.current) {
      // Small delay to ensure DOM has updated after layout changes
      setTimeout(() => {
        const width = containerRef.current!.offsetWidth;
        const height = containerRef.current!.offsetHeight;
        
        stageRef.current!.size({
          width: width,
          height: height,
        });
        stageRef.current!.draw();
      }, 50);
    }
  };

  useEffect(() => {
    // Initialize canvas
    initializeCanvas();

    // Add resize listener
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen for window resize as backup
    window.addEventListener('resize', handleResize);

    return () => {
      if (runnerRef.current && engineRef.current) {
        Matter.Runner.stop(runnerRef.current);
        Matter.Engine.clear(engineRef.current);
      }
      if (stageRef.current) {
        stageRef.current.destroy();
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (selectedObject && layerRef.current && engineRef.current && !bodies.current.has(selectedObject)) {
      const layer = layerRef.current;
      const world = engineRef.current.world;

      const baseObject = selectedObject.split(" (")[0];
      const attributesMatch = selectedObject.match(/Mass: (\d+), Velocity: (\d+), Force: (\d+), Friction: (\d+\.?\d*), Size: (\d+), Color: (#[0-9A-Fa-f]{6})/);
      const attributes = attributesMatch ? {
        mass: Number(attributesMatch[1]),
        initialVelocity: Number(attributesMatch[2]),
        force: Number(attributesMatch[3]),
        friction: Number(attributesMatch[4]),
        size: Number(attributesMatch[5]),
        color: attributesMatch[6],
      } : { mass: 1, initialVelocity: 0, force: 0, friction: 0.1, size: 50, color: "#000000" };

      let body: Matter.Body;
      let shape: Konva.Shape;
      const id = `${selectedObject}-${Date.now()}`;
      const x = stageRef.current!.width() / 2;
      const y = stageRef.current!.height() / 2;

      switch (baseObject.toLowerCase()) {
        case "sphere":
        case "ball":
          body = Matter.Bodies.circle(x, y, attributes.size / 2, {
            mass: attributes.mass,
            friction: attributes.friction,
            restitution: 0.5,
            label: baseObject,
          });
          shape = new Konva.Circle({
            x,
            y,
            radius: attributes.size / 2,
            fill: attributes.color,
            draggable: true,
          });
          break;
        case "box":
          body = Matter.Bodies.rectangle(x, y, attributes.size, attributes.size, {
            mass: attributes.mass,
            friction: attributes.friction,
            restitution: 0.5,
            label: baseObject,
          });
          shape = new Konva.Rect({
            x,
            y,
            width: attributes.size,
            height: attributes.size,
            fill: attributes.color,
            draggable: true,
          });
          break;
        case "ramp":
        case "inclined plane":
          body = Matter.Bodies.rectangle(x, y, attributes.size * 2, attributes.size / 2, {
            isStatic: true,
            angle: Math.PI / 6,
            friction: attributes.friction,
            label: baseObject,
          });
          shape = new Konva.Rect({
            x,
            y,
            width: attributes.size * 2,
            height: attributes.size / 2,
            fill: attributes.color,
            rotation: 30,
            draggable: false,
          });
          break;
        case "spring":
          const anchor = Matter.Bodies.circle(x - 50, y, 10, { isStatic: true, label: "anchor" });
          body = Matter.Bodies.circle(x + 50, y, attributes.size / 2, {
            mass: attributes.mass,
            friction: attributes.friction,
            restitution: 0.5,
            label: baseObject,
          });
          const constraint = Matter.Constraint.create({
            bodyA: anchor,
            bodyB: body,
            length: 50,
            stiffness: 0.1,
          });
          Matter.World.add(world, [anchor, body, constraint]);
          shape = new Konva.Circle({
            x: x + 50,
            y,
            radius: attributes.size / 2,
            fill: attributes.color,
            draggable: true,
          });
          const springLine = new Konva.Line({
            points: [x - 50, y, x + 50, y],
            stroke: attributes.color,
            strokeWidth: 2,
          });
          layer.add(springLine);
          break;
        default:
          body = Matter.Bodies.rectangle(x, y, attributes.size, attributes.size, {
            mass: attributes.mass,
            friction: attributes.friction,
            restitution: 0.5,
            label: baseObject,
          });
          shape = new Konva.Rect({
            x,
            y,
            width: attributes.size,
            height: attributes.size,
            fill: attributes.color,
            draggable: true,
          });
      }

      Matter.Body.setVelocity(body, { x: attributes.initialVelocity, y: 0 });
      if (attributes.force > 0) {
        Matter.Body.applyForce(body, body.position, { x: attributes.force, y: 0 });
      }

      Matter.World.add(world, body);
      layer.add(shape);
      bodies.current.set(id, { body, shape });

      layer.draw();
    }
  }, [selectedObject]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const object = event.dataTransfer.getData("text/plain");
    onDrop(object);
  };

  const handleReset = () => {
    if (!engineRef.current || !layerRef.current) return;
    
    // Stop the simulation
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
    }
    
    // Clear all bodies from physics world
    Matter.World.clear(engineRef.current.world, false);
    
    // Clear all shapes from Konva layer
    layerRef.current.destroyChildren();
    layerRef.current.draw();
    
    // Clear the bodies map
    bodies.current.clear();
    
    // Reset running state
    setLocalIsRunning(false);
    onSimulationStateChange(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 h-[calc(60vh-3rem)] border border-gray-300 bg-white rounded-md"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    />
  );
};

export default Canvas;