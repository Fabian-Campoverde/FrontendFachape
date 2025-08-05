import { useState } from 'react';

export type ToolType = 'line' | 'rectangle' | 'polygon';

export interface Point {
  x: number;
  y: number;
}

export function useDrawTool(scale = 1) {
  const [tool, setTool] = useState<ToolType>('line');
  const [points, setPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<string>('');

  const startDrawing = (e: any) => {
    const rect = e.target.getStage().getPointerPosition();
    if (!rect) return;

    if (tool === 'polygon') {
      setPoints((prev) => [...prev, rect]);
    } else {
      setPoints([rect]);
      setIsDrawing(true);
    }
  };

  const draw = (e: any) => {
    if (!isDrawing || tool === 'polygon') return;
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    setPoints((prev) => [prev[0], pos]);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (tool === 'line') {
      const [a, b] = points;
      const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
      setResult(`${(dist * scale).toFixed(2)} m`);
    } else if (tool === 'rectangle') {
      const [a, b] = points;
      const w = Math.abs(b.x - a.x);
      const h = Math.abs(b.y - a.y);
      setResult(`Área: ${(w * h * scale * scale).toFixed(2)} m²`);
    } else if (tool === 'polygon') {
      if (points.length > 2) {
        const area = calculatePolygonArea(points) * scale * scale;
        setResult(`Área: ${area.toFixed(2)} m²`);
      }
    }
  };

  const reset = () => {
    setPoints([]);
    setResult('');
    setIsDrawing(false);
  };

  return {
    tool,
    setTool,
    points,
    setPoints,
    startDrawing,
    draw,
    endDrawing,
    result,
    reset,
  };
}

function calculatePolygonArea(points: Point[]): number {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
}
