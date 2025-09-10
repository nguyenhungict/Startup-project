// src/Model/physic/render/VelocityVectorRenderer.ts
import Konva from "konva";
import {
  type ObjectRendererInterface,
  type RenderableObject,
  type RenderContext,
} from "./types";

export class VelocityVectorRenderer implements ObjectRendererInterface {
  render(obj: RenderableObject, layer: Konva.Layer, context: RenderContext): void {
    VelocityVectorRenderer.render(obj, layer, context);
  }

  static render(obj: RenderableObject, layer: Konva.Layer, context: RenderContext): void {
    const velocityX = obj.velocityX ?? 0;
    const velocityY = obj.velocityY ?? 0;
    const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

    if (velocityMagnitude > 0.1) {
      const scale = Math.min(150, velocityMagnitude * 75); // 1 m/s = 1.5 meters (75 pixels)
      const normalizedVelX = velocityX / velocityMagnitude;
      const normalizedVelY = velocityY / velocityMagnitude;

      // 👇 Đảo dấu Y khi vẽ
      const arrow = new Konva.Arrow({
        x: obj.x,
        y: obj.y,
        points: [0, 0, normalizedVelX * scale, -normalizedVelY * scale],
        pointerLength: 8,
        pointerWidth: 6,
        fill: "red",
        stroke: "red",
        strokeWidth: 2,
      });
      layer.add(arrow);

      const velText = new Konva.Text({
        x: obj.x + (normalizedVelX * scale) / 2,
        y: obj.y - (normalizedVelY * scale) / 2 - 15, // 👈 đảo dấu luôn cho text
        text: `v=${velocityMagnitude.toFixed(1)} m/s`,
        fontSize: 12,
        fill: "red",
        align: "center",
      });
      layer.add(velText);
    }
  }
}
