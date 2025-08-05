import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Rect, Text, Image as KonvaImage } from 'react-konva';
import { useDrawTool } from '../../hooks/useDrawTool';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  scale: number; // píxeles por metro
}

const ImageMeasurementModal: React.FC<Props> = ({ isOpen, onClose, imageUrl, scale }) => {
  const stageRef = useRef<any>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const { tool, setTool, points, startDrawing, draw, endDrawing, result, reset } = useDrawTool(scale);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      setDimensions({ width: img.width, height: img.height });
    };
  }, [imageUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full relative p-4">
        <button onClick={onClose} className="absolute top-2 right-2 text-red-600 font-bold text-lg">×</button>

        <div className="mb-4 flex flex-wrap gap-2">
          <button onClick={() => setTool('line')} className={`px-3 py-1 rounded ${tool === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Línea</button>
          <button onClick={() => setTool('rectangle')} className={`px-3 py-1 rounded ${tool === 'rectangle' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Rectángulo</button>
          <button onClick={() => setTool('polygon')} className={`px-3 py-1 rounded ${tool === 'polygon' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Polígono</button>
          <button onClick={reset} className="px-3 py-1 rounded bg-yellow-400 text-black">Limpiar</button>
          <button
            onClick={() => {
              const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
              const link = document.createElement('a');
              link.download = 'medicion.png';
              link.href = uri;
              link.click();
            }}
            className="px-3 py-1 rounded bg-green-600 text-white"
          >
            Descargar imagen
          </button>
        </div>

        <Stage
          width={dimensions.width}
          height={dimensions.height}
          ref={stageRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          className="border border-gray-300"
        >
          <Layer>
            {image && <KonvaImage image={image} />}
            {tool === 'line' && points.length === 2 && (
              <Line points={[points[0].x, points[0].y, points[1].x, points[1].y]} stroke="red" strokeWidth={2} />
            )}
            {tool === 'rectangle' && points.length === 2 && (
              <Rect
                x={Math.min(points[0].x, points[1].x)}
                y={Math.min(points[0].y, points[1].y)}
                width={Math.abs(points[1].x - points[0].x)}
                height={Math.abs(points[1].y - points[0].y)}
                stroke="blue"
                strokeWidth={2}
              />
            )}
            {tool === 'polygon' && points.length > 1 && (
              <Line
                points={points.flatMap(p => [p.x, p.y])}
                closed={points.length > 2}
                stroke="green"
                strokeWidth={2}
              />
            )}
            {result && (
              <Text text={result} x={10} y={10} fontSize={16} fill="black" />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default ImageMeasurementModal;
