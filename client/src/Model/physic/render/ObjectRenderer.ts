// src/Model/physic/render/ObjectRenderer.ts
import Konva from "konva";
import type { ObjectRendererInterface, RenderableObject, RenderContext } from "./types";
import { PointMassRenderer } from "./shapes/PointMassRenderer";
import { VelocityVectorRenderer } from "./VelocityVectorRenderer";
import { AccelerationVectorRenderer } from "./AccelerationVectorRenderer";
import { MovingObjectRenderer } from "./shapes/MovingObjectRender";


export class ObjectRenderer {
  private static renderers: Record<string, ObjectRendererInterface> = {
    "point mass": new PointMassRenderer(),
    "moving object": new MovingObjectRenderer(),
  };

  static render(obj: RenderableObject, layer: Konva.Layer, context: RenderContext) {
    const renderer = this.renderers[obj.type.toLowerCase()];
    if (renderer) {
      renderer.render(obj, layer, context);
      // Render velocity and acceleration vectors if applicable
      if (obj.velocityX || obj.velocityY) {
        VelocityVectorRenderer.render(obj, layer, context);
      }
      if (obj.accelerationX || obj.accelerationY) {
        AccelerationVectorRenderer.render(obj, layer, context);
      }
    }
  }

  static registerRenderer(type: string, renderer: ObjectRendererInterface) {
    this.renderers[type.toLowerCase()] = renderer;
  }
}