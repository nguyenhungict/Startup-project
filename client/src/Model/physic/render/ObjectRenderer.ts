// src/Model/physic/render/ObjectRenderer.ts
import Konva from "konva";
import type { ObjectRendererInterface, RenderableObject, RenderContext } from "./types";
import { PointMassRenderer } from "./shapes/PointMassRenderer";
import { MovingObjectRenderer } from "./shapes/MovingObjectRender";
import { VelocityVectorRenderer } from "./VelocityVectorRenderer";
import { AccelerationVectorRenderer } from "./AccelerationVectorRenderer";

export class ObjectRenderer {
  private static renderers: Record<string, ObjectRendererInterface> = {
    "point mass": new PointMassRenderer(),
    "moving object": new MovingObjectRenderer(),
  };

  /**
   * Render a single object on the given layer
   */
  static render(
    obj: RenderableObject,
    layer: Konva.Layer,
    context: RenderContext
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
  static renderObject(type: string, attributes: Record<string, any>): Konva.Shape {
    const renderer = this.renderers[type.toLowerCase()];
    
    if (!renderer) {
      // Fallback to a simple circle if no specific renderer exists
      return new Konva.Circle({
        x: attributes.position?.x || attributes.initialPosition?.x || 0,
        y: attributes.position?.y || attributes.initialPosition?.y || 0,
        radius: attributes.size || 30,
        fill: attributes.color || "blue",
        stroke: "black",
        strokeWidth: 1,
        draggable: true,
      });
    }

    // Create a temporary layer to get the shape from the renderer
    const tempLayer = new Konva.Layer();
    const context: RenderContext = {
      scaleFactor: 50,
    };

    // Convert attributes to RenderableObject format
    const renderableObj: RenderableObject = {
      id: attributes.id || "temp",
      type: type,
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

    // Use the renderer to create the shape
    renderer.render(renderableObj, tempLayer, context);
    
    // Get the first shape from the temporary layer
    const shapes = tempLayer.getChildren();
    if (shapes.length > 0) {
      const shape = shapes[0] as Konva.Shape;
      shape.draggable(true);
      return shape;
    }

    // Fallback if renderer didn't create a shape
    return new Konva.Circle({
      x: renderableObj.x,
      y: renderableObj.y,
      radius: renderableObj.size,
      fill: renderableObj.color,
      stroke: "black",
      strokeWidth: 1,
      draggable: true,
    });
  }

  /**
   * Allow dynamically registering new renderers at runtime
   */
  static registerRenderer(type: string, renderer: ObjectRendererInterface) {
    this.renderers[type.toLowerCase()] = renderer;
  }
}