// src/Model/physic/render/AccelerationVectorRenderer.ts
import Konva from "konva";
import type { ObjectRendererInterface, RenderableObject, RenderContext } from "./types";

export class AccelerationVectorRenderer implements ObjectRendererInterface {
  render(obj: RenderableObject, layer: Konva.Layer, context: RenderContext): void {
    AccelerationVectorRenderer.render(obj, layer, context);
  }

  static render(obj: RenderableObject, layer: Konva.Layer, context: RenderContext): void {
    const accelerationX = obj.accelerationX ?? 0;
    const accelerationY = obj.accelerationY ?? 0;
    const accMagnitude = Math.sqrt(accelerationX * accelerationX + accelerationY * accelerationY);

    if (accMagnitude > 0.1) {
      const scale = Math.min(100, accMagnitude * 10); // 1 m/s² = 0.2 meters (10 pixels)
      const normalizedAccX = accelerationX / accMagnitude;
      const normalizedAccY = accelerationY / accMagnitude;

      // 👇 Đảo dấu Y khi vẽ
      const arrow = new Konva.Arrow({
        x: obj.x,
        y: obj.y,
        points: [0, 0, normalizedAccX * scale, -normalizedAccY * scale],
        pointerLength: 8,
        pointerWidth: 6,
        fill: "green",
        stroke: "green",
        strokeWidth: 2,
      });
      layer.add(arrow);

      const accText = new Konva.Text({
        x: obj.x + (normalizedAccX * scale) / 2,
        y: obj.y - (normalizedAccY * scale) / 2 + 5, // 👈 đảo dấu Y cho text
        text: `a=${accMagnitude.toFixed(1)} m/s²`,
        fontSize: 12,
        fill: "green",
        align: "center",
      });
      layer.add(accText);
    }
  }
}
