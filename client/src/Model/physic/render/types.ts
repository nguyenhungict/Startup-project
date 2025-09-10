// src/Model/physic/render/types.ts
import Konva from "konva";

export interface RenderableObject {
  id: string;
  type: string;
  x: number;
  y: number;
  angle?: number;
  size?: number;
  color?: string;
  length?: number;
  velocityX?: number;
  velocityY?: number;
  accelerationX?: number;
  accelerationY?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
}

export interface RenderContext {
  scaleFactor: number;
}

export interface ObjectRendererInterface {
  render(obj: RenderableObject, layer: Konva.Layer, context: RenderContext): void;
}