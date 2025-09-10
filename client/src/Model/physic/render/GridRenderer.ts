// src/Model/physic/render/GridRenderer.ts
import Konva from "konva";

interface GridRenderContext {
  layer: Konva.Layer;
  stageWidth: number;
  stageHeight: number;
  scaleFactor: number;
  gridOffset: number;
  showCoordinates: boolean;
}

export class GridRenderer {
  static renderGrid(context: GridRenderContext): void {
    const { layer, stageWidth, stageHeight, scaleFactor, gridOffset, showCoordinates } = context;
    layer.destroyChildren();

    if (!showCoordinates) return;

    const centerY = stageHeight / 2;
    const gridSize = scaleFactor;

    // Vertical grid lines
    for (let x = 0; x <= stageWidth; x += gridSize) {
      const line = new Konva.Line({
        points: [x, 0, x, stageHeight],
        stroke: "#ccc",
        strokeWidth: 1,
      });
      layer.add(line);
    }

    // Horizontal grid lines
    for (let y = centerY; y <= stageHeight; y += gridSize) {
      const line = new Konva.Line({
        points: [0, y, stageWidth, y],
        stroke: "#ccc",
        strokeWidth: 1,
      });
      layer.add(line);
    }
    for (let y = centerY; y >= 0; y -= gridSize) {
      const line = new Konva.Line({
        points: [0, y, stageWidth, y],
        stroke: "#ccc",
        strokeWidth: 1,
      });
      layer.add(line);
    }

    // Axes
    const xAxis = new Konva.Line({
      points: [0, centerY, stageWidth, centerY],
      stroke: "#000",
      strokeWidth: 2,
    });
    const yAxis = new Konva.Line({
      points: [gridOffset, 0, gridOffset, stageHeight],
      stroke: "#000",
      strokeWidth: 2,
    });
    layer.add(xAxis, yAxis);

    // X labels
    for (let x = gridOffset; x >= 0; x -= gridSize) {
      const physicsX = (x - gridOffset) / scaleFactor;
      const label = new Konva.Text({
        x: x + 2,
        y: centerY + 2,
        text: physicsX.toFixed(0),
        fontSize: 12,
        fill: "#000",
      });
      layer.add(label);
    }
    for (let x = gridOffset; x <= stageWidth; x += gridSize) {
      const physicsX = (x - gridOffset) / scaleFactor;
      const label = new Konva.Text({
        x: x + 2,
        y: centerY + 2,
        text: physicsX.toFixed(0),
        fontSize: 12,
        fill: "#000",
      });
      layer.add(label);
    }

    // Y labels
    for (let y = centerY; y <= stageHeight; y += gridSize * 2) {
      const physicsY = (centerY - y) / scaleFactor;
      const label = new Konva.Text({
        x: gridOffset + 2,
        y: y + 2,
        text: physicsY.toFixed(0),
        fontSize: 12,
        fill: "#000",
      });
      layer.add(label);
    }
    for (let y = centerY; y >= 0; y -= gridSize * 2) {
      const physicsY = (centerY - y) / scaleFactor;
      const label = new Konva.Text({
        x: gridOffset + 2,
        y: y + 2,
        text: physicsY.toFixed(0),
        fontSize: 12,
        fill: "#000",
      });
      layer.add(label);
    }

    layer.draw();
  }
}