// src/Model/physic/render/ObjectRenderer.ts
import Konva from "konva";
import type { ObjectRendererInterface, RenderableObject, RenderContext } from "./types";

import { MovingObjectRenderer } from "./shapes/MovingObjectRender";
import { VelocityVectorRenderer } from "./VelocityVectorRenderer";
import { AccelerationVectorRenderer } from "./AccelerationVectorRenderer";

export class ObjectRenderer {
  private static renderers: Record<string, ObjectRendererInterface> = {
    "moving object": new MovingObjectRenderer(),
  };

  /**
   * Render a single object on the given layer
   */
  static render(
    obj: RenderableObject,
    layer: Konva.Layer,
    context: RenderContext,
    
  ) {
    const renderer = this.renderers[obj.type.toLowerCase()];
    if (!renderer) return;

    // Draw the object
    renderer.render(obj, layer, context);

    // Optionally draw velocity / acceleration vectors
    if (obj.velocityX || obj.velocityY) {
      VelocityVectorRenderer.render(obj, layer, context);
    }
    if (obj.accelerationX || obj.accelerationY) {
      AccelerationVectorRenderer.render(obj, layer, context);
    }
  }

  /**
   * Create a Konva shape for a single object (used by Canvas component)
   */
  static renderObject(type: string, attributes: Record<string, any>): Konva.Group {
  const renderer = this.renderers[type.toLowerCase()];
  const group = new Konva.Group({
    id: attributes.id || "temp",
  });
  group.setAttr("modelId", attributes.id);

  const context: RenderContext = { scaleFactor: 50 };

  // Convert attributes to RenderableObject (use physical coordinates)
  const renderableObj: RenderableObject = {
    id: attributes.id || "temp",
    type,
    x: attributes.position?.x || attributes.initialPosition?.x || 0,
    y: attributes.position?.y || attributes.initialPosition?.y || 0,
    velocityX: attributes.velocityX || attributes.initialVelocity?.x || 0,
    velocityY: attributes.velocityY || attributes.initialVelocity?.y || 0,
    accelerationX: attributes.accelerationX || attributes.initialAcceleration?.x || 0,
    accelerationY: attributes.accelerationY || attributes.initialAcceleration?.y || 0,
    size: attributes.size || 30,
    color: attributes.color || "blue",
    angle: attributes.angle || 0,
  };

  if (!renderer) {
    // Fallback: render a circle
    const circle = new Konva.Circle({
      x: renderableObj.x * context.scaleFactor, // Scale to canvas coordinates
      y: renderableObj.y * context.scaleFactor,
      radius: renderableObj.size,
      fill: renderableObj.color,
      stroke: "black",
      strokeWidth: 1,
    });
    circle.setAttr("modelId", renderableObj.id);
    group.add(circle);
    return group;
  }

  // Create a temporary layer to render shapes and vectors
  const tempLayer = new Konva.Layer();
  renderer.render(renderableObj, tempLayer, context);

  // Clone main shapes to group
  tempLayer.getChildren().forEach((s) => {
    s.setAttr("modelId", renderableObj.id);
    group.add(s.clone());
  });

  // Render and clone velocity vectors
  if (renderableObj.velocityX || renderableObj.velocityY) {
    const vectorLayer = new Konva.Layer(); // Separate layer for vectors to avoid ID conflicts
    VelocityVectorRenderer.render(renderableObj, vectorLayer, context);
    vectorLayer.getChildren().forEach((s, index) => {
      s.setAttr("modelId", renderableObj.id);
      s.id(`velocity_${renderableObj.id}_${index}`); // Ensure unique IDs
      group.add(s.clone());
    });
  }

  // Render and clone acceleration vectors
  if (renderableObj.accelerationX || renderableObj.accelerationY) {
    const vectorLayer = new Konva.Layer();
    AccelerationVectorRenderer.render(renderableObj, vectorLayer, context);
    vectorLayer.getChildren().forEach((s, index) => {
      s.setAttr("modelId", renderableObj.id);
      s.id(`acceleration_${renderableObj.id}_${index}`); // Ensure unique IDs
      group.add(s.clone());
    });
  }

  return group;
}


  /**
   * Allow dynamically registering new renderers at runtime
   */
  static registerRenderer(type: string, renderer: ObjectRendererInterface) {
    this.renderers[type.toLowerCase()] = renderer;
  }
}