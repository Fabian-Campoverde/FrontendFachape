
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Circle, Image as KonvaImage } from "react-konva";
import { Modal, Box, Button, Stack } from "@mui/material";
import { FaTimes } from "react-icons/fa";

interface Props {
  imageUrl: string;
  open: boolean;
  onClose: () => void;
}

const PolygonCropperPrigin = ({ imageUrl, open, onClose }: Props) => {
  const [image, setImage] = useState<HTMLImageElement | undefined>();
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isSmall, setIsSmall] = useState(false);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      const small = img.width < 350 || img.height < 350;
      setIsSmall(small);
    };
  }, [imageUrl]);

  const handleStagePointerDown = (e: any) => {
  if (isComplete) return;
  const stage = stageRef.current;
  const point = stage.getPointerPosition();
  if (point) {
    setPoints((prev) => [...prev, point]);
  }
};

  const completePolygon = () => {
    if (points.length >= 3) setIsComplete(true);
  };

  const resetPolygon = () => {
    setPoints([]);
    setIsComplete(false);
  };

  const handleDragMove = (index: number, pos: { x: number; y: number }) => {
    const updated = [...points];
    updated[index] = pos;
    setPoints(updated);
  };
  

  const cropImage = () => {
    if (!image || points.length < 3 || !stageRef.current) return;

    const stage = stageRef.current;
    const stageWidth = stage.width();
    const stageHeight = stage.height();

    const scaleX = image.naturalWidth / stageWidth;
    const scaleY = image.naturalHeight / stageHeight;

    // Escalar los puntos al tamaño real de la imagen
    const scaledPoints = points.map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));

    // Crear un canvas del tamaño real de la imagen
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(0,0,0,0.85)",
          p: 2,
        }}
      >
        {/* Botón cerrar */}
        <button
          type="button"
          title="Cerrar recorte"
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-700 hover:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-xl"
          style={{ zIndex: 10 }}
        >
          <FaTimes className="text-lg" />
        </button>

        {isSmall ? (
          // Modal compacto para imágenes pequeñas
          <Box
            sx={{
              width: "min(90vw, 600px)",
              height: "min(90vh, 600px)",
              minWidth: "300px",
              minHeight: "300px",
              borderRadius: "8px",
              
              backgroundColor: "transparent", // Sin fondo blanco
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1} mb={1}>
              <Button
                variant="contained"
                color="success"
                onClick={completePolygon}
              >
                Cerrar Polígono
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={resetPolygon}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={cropImage}
                disabled={!isComplete}
              >
                Descargar
              </Button>
              
            </Stack>
            <Stage
              width={550}
              height={550}
              onMouseDown={handleStagePointerDown}
onTouchStart={handleStagePointerDown}
              ref={stageRef}
            >
              <Layer>
                {image && <KonvaImage image={image} width={550} height={550} />}
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
                      handleDragMove(i, { x: e.target.x(), y: e.target.y() })
                    }
                  />
                ))}
              </Layer>
            </Stage>
          </Box>
        ) : (
          // Modal amplio para imágenes grandes
          <Box
            sx={{
              backgroundColor: "transparent",
              borderRadius: 2,
              padding: 2,
              maxHeight: "90vh",
              maxWidth: "90vw",
              overflow: "auto",
            }}
          >
            <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
              <Button
                variant="contained"
                color="success"
                onClick={completePolygon}
              >
                Cerrar Polígono
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={resetPolygon}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={cropImage}
                disabled={!isComplete}
              >
                Descargar
              </Button>
              
            </Stack>

            {image && (
              <Stage
                width={image.width}
                height={image.height}
                onMouseDown={handleStagePointerDown}
onTouchStart={handleStagePointerDown}
                ref={stageRef}
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
                        handleDragMove(i, { x: e.target.x(), y: e.target.y() })
                      }
                    />
                  ))}
                </Layer>
              </Stage>
            )}
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default PolygonCropperPrigin;
