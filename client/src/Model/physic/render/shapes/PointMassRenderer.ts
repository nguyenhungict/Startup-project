// src/Model/physic/render/shapes/PointMassRenderer.ts
import Konva from "konva";
import { type ObjectRendererInterface, type RenderableObject, type RenderContext } from "../types";

export class PointMassRenderer implements ObjectRendererInterface {
  render(obj: RenderableObject, layer: Konva.Layer, context: RenderContext): void {
    const size = obj.size ?? 20;
    const color = obj.color ?? "blue";
    const shape = new Konva.Circle({
      x: obj.x,
      y: obj.y,
      radius: size / 2,
      fill: color,
      stroke: "black",
      strokeWidth: 1,
      rotation: obj.angle ?? 0,
    });
    layer.add(shape);
  }
}