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

    // Draw circle representing the object
    const shape = new Konva.Circle({
      x: obj.x,
      y: obj.y,
      radius: size / 2,
      fill: color,
      stroke: "black",
      strokeWidth: 1,
    });
    shape.setAttr("modelId", obj.id); // Add modelId for drop logic
    layer.add(shape);

    // Draw object label (optional, simplified)
    try {
      const label = new Konva.Text({
        x: obj.x + size / 2 + 5,
        y: obj.y - size / 2,
        text: obj.id.substring(0, 8), // Shortened ID for clarity
        fontSize: 12,
        fill: "black",
      });
      layer.add(label);
    } catch (err) {
      console.error("Error rendering label for object:", obj.id, err);
    }
  }
}