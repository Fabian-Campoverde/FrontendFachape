import { useEffect, useRef, useState } from "react";
import { Modal, Box } from "@mui/material";
import { Stage, Layer, Line, Circle, Image as KonvaImage } from "react-konva";
import { FaTimes, FaUndo, FaDownload } from "react-icons/fa";

interface Props {
  imageUrl: string;
  open: boolean;
  onClose: () => void;
}

const PolygonCropperMobile = ({ imageUrl, open, onClose }: Props) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const stageRef = useRef<any>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const viewportWidth = window.innerWidth * 0.95;
  const viewportHeight = window.innerHeight * 0.7;

  // Cargar imagen
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => setImage(img);
  }, [imageUrl]);

  // Calcular escala inicial al cargar imagen
  useEffect(() => {
    if (!image) return;

    const scaleW = viewportWidth / image.width;
    const scaleH = viewportHeight / image.height;
    const newScale = Math.min(scaleW, scaleH);

    const centeredX = (viewportWidth - image.width * newScale) / 2;
    const centeredY = (viewportHeight - image.height * newScale) / 2;

    setScale(newScale);
    setPosition({ x: centeredX, y: centeredY });
  }, [image]);

  const handleStagePointerDown = () => {
    if (isComplete || !stageRef.current) return;

    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();

    const point = {
      x: (pointer.x - position.x) / scale,
      y: (pointer.y - position.y) / scale,
    };

    setPoints((prev) => [...prev, point]);
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    const scaleBy = 1.05;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
  };

  const handleDragEnd = (e: any) => {
    const newPos = e.target.position();
    setPosition(newPos);
  };

  const completePolygon = () => {
    if (points.length >= 3) setIsComplete(true);
  };

  const resetPolygon = () => {
    setPoints([]);
    setIsComplete(false);
  };

  const cropImage = () => {
    if (!image || points.length < 3) return;

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const scaledPoints = points.map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
    scaledPoints.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
    ctx.restore();

    const link = document.createElement("a");
    link.download = "recorte-manual.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className="relative flex items-center justify-center h-screen"
        sx={{
          outline: "none",
          bgcolor: "rgba(0,0,0,0.85)",
          flexDirection: "column",
          gap: 2,
          p: 2,
        }}
      >
        {/* Botón cerrar */}
        <button
          title="Cerrar"
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-700 hover:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-xl"
          style={{ zIndex: 10 }}
        >
          <FaTimes />
        </button>

        {/* Botones */}
        <div className="flex flex-row flex-wrap gap-2 mb-2">
          <button
            onClick={completePolygon}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Cerrar Polígono
          </button>

          <button
            onClick={resetPolygon}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center justify-center"
          >
            <FaUndo className="w-5 h-5 md:mr-2" />
            <span className="hidden md:inline">Reset</span>
          </button>

          <button
            onClick={cropImage}
            disabled={!isComplete}
            className={`${
              isComplete
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            } text-white px-4 py-2 rounded flex items-center justify-center`}
          >
            <FaDownload className="w-5 h-5 md:mr-2" />
            <span className="hidden md:inline">Descargar</span>
          </button>
        </div>

        {image && (
          <Stage
            width={viewportWidth}
            height={viewportHeight}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            draggable
            ref={stageRef}
            onWheel={handleWheel}
            onMouseDown={handleStagePointerDown}
            onTouchStart={handleStagePointerDown}
            onDragEnd={handleDragEnd}
          >
            <Layer>
              <KonvaImage
                image={image}
                width={image.width}
                height={image.height}
              />
              {points.length >= 2 && (
                <Line
                  points={points.flatMap((p) => [p.x, p.y])}
                  closed={isComplete}
                  stroke="red"
                  strokeWidth={2}
                  fill={isComplete ? "rgba(255,0,0,0.2)" : undefined}
                />
              )}
              {points.map((point, i) => (
                <Circle
                  key={i}
                  x={point.x}
                  y={point.y}
                  radius={3}
                  fill="blue"
                  draggable={isComplete}
                  onDragMove={(e) =>
                    setPoints((prev) =>
                      prev.map((p, idx) =>
                        idx === i
                          ? { x: e.target.x(), y: e.target.y() }
                          : p
                      )
                    )
                  }
                />
              ))}
            </Layer>
          </Stage>
        )}
      </Box>
    </Modal>
  );
};

export default PolygonCropperMobile;
