// src/Model/physic/render/shapes/MovingObjectRenderer.ts
import Konva from "konva";
import type { ObjectRendererInterface, RenderableObject, RenderContext } from "../types";


export class MovingObjectRenderer implements ObjectRendererInterface {
  render(
    obj: RenderableObject,
    layer: Konva.Layer,
    context: RenderContext
  ): void {
    const size = obj.size ?? 20;
    const color = obj.color ?? "blue";

    // Vẽ hình tròn đại diện object
    const shape = new Konva.Circle({
      x: obj.x,
      y: obj.y,
      radius: size / 2,
      fill: color,
      stroke: "black",
      strokeWidth: 1,
    });
    layer.add(shape);

    // Vẽ nhãn tên object
    const label = new Konva.Text({
      x: obj.x + size / 2 + 5,
      y: obj.y - size / 2,
      fontSize: 12,
      fill: "black",
    });
    layer.add(label);
  }
}
