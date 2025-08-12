import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  FaDrawPolygon,
  FaRulerHorizontal,
  FaVectorSquare,
  FaDownload,
} from "react-icons/fa";
import { Stage, Layer, Image as KonvaImage, Line, Rect } from "react-konva";
import { Text as KonvaText } from "react-konva";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  scale: number;
}

type Tool = "line" | "rect" | "polygon";
type Shape = { type: Tool; points: { x: number; y: number }[] };

const MeasurementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  imageUrl,
  scale,
}) => {
  const stageRef = useRef<any>(null);
  const [tool, setTool] = useState<Tool>("line");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [current, setCurrent] = useState<{ x: number; y: number }[]>([]);
  const [zoom, setZoom] = useState(1);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => setImage(img);
  }, [imageUrl]);

  const handleStageClick = (e: any) => {
    if (!image) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;
    const x = point.x / zoom;
    const y = point.y / zoom;

    const newPoint = { x, y };

    if (tool === "line" || tool === "rect") {
      const newPoints = [...current, newPoint];
      if (newPoints.length === 2) {
        setShapes([...shapes, { type: tool, points: newPoints }]);
        setCurrent([]);
      } else {
        setCurrent(newPoints);
      }
    }

    if (tool === "polygon") {
      const newPoints = [...current, newPoint];
      const first = newPoints[0];
      const isClosing =
        newPoints.length >= 3 &&
        Math.abs(first.x - newPoint.x) < 10 &&
        Math.abs(first.y - newPoint.y) < 10;

      if (isClosing) {
        const cleanPoints = newPoints.slice(0, -1);
        setShapes([...shapes, { type: "polygon", points: cleanPoints }]);
        setCurrent([]);
      } else {
        setCurrent(newPoints);
      }
    }
  };

  const handleStagePointer = (e: any) => {
    if (!image) return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const x = pointer.x / zoom;
    const y = pointer.y / zoom;
    const newPoint = { x, y };

    if (tool === "line" || tool === "rect") {
      const newPoints = [...current, newPoint];
      if (newPoints.length === 2) {
        setShapes([...shapes, { type: tool, points: newPoints }]);
        setCurrent([]);
      } else {
        setCurrent(newPoints);
      }
    }

    if (tool === "polygon") {
      const newPoints = [...current, newPoint];
      const first = newPoints[0];
      const isClosing =
        newPoints.length >= 3 &&
        Math.abs(first.x - newPoint.x) < 10 &&
        Math.abs(first.y - newPoint.y) < 10;

      if (isClosing) {
        const cleanPoints = newPoints.slice(0, -1);
        setShapes([...shapes, { type: "polygon", points: cleanPoints }]);
        setCurrent([]);
      } else {
        setCurrent(newPoints);
      }
    }
  };

  const resetAll = () => {
    setShapes([]);
    setCurrent([]);
  };

  const removeByType = (type: Tool) => {
    setShapes(shapes.filter((s) => s.type !== type));
  };

  const handleDownload = () => {
    if (!stageRef.current) return;

    // Obtener las capas
    const stage = stageRef.current;
    const layers = stage.getLayers();
    const imageLayer = layers[0]; // primera capa: imagen
    const shapesLayer = layers[1]; // segunda capa: shapes

    // Ocultar imagen
    imageLayer.visible(false);

    // Forzar render
    stage.draw();

    // Exportar solo shapes
    const uri = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });

    // Volver a mostrar la imagen
    imageLayer.visible(true);
    stage.draw();

    // Descargar
    const link = document.createElement("a");
    link.download = "plano.png";
    link.href = uri;
    link.click();
  };

  const renderShape = (shape: Shape, i: number) => {
    const pts = shape.points.map((p) => [p.x * zoom, p.y * zoom]).flat();

    if (shape.type === "line" && pts.length === 4) {
      const [x1, y1, x2, y2] = pts;
      const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * (scale / zoom);
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      // Determina si la línea es más horizontal o vertical
      const dx = x2 - x1;
      const dy = y2 - y1;
      const offsetX = dy > dx ? 10 : 0;
      const offsetY = dx > dy ? -15 : 0;

      return (
        <React.Fragment key={i}>
          <Line points={pts} stroke="#2563EB" strokeWidth={2} />
          <KonvaText
            text={`${dist.toFixed(2)} m`}
            x={midX + offsetX}
            y={midY + offsetY}
            fontSize={16}
            fill="white"
            stroke="blue"
            strokeWidth={2}
          />
        </React.Fragment>
      );
    }

    if (shape.type === "rect" && shape.points.length === 2) {
      const [p1, p2] = shape.points;
      const x = Math.min(p1.x, p2.x) * zoom;
      const y = Math.min(p1.y, p2.y) * zoom;
      const w = Math.abs(p2.x - p1.x) * zoom;
      const h = Math.abs(p2.y - p1.y) * zoom;

      const widthMeters = Math.abs(p2.x - p1.x) * scale;
      const heightMeters = Math.abs(p2.y - p1.y) * scale;

      return (
        <React.Fragment key={i}>
          <Rect
            x={x}
            y={y}
            width={w}
            height={h}
            stroke="#2563EB"
            strokeWidth={2}
          />
          {/* Base (abajo) */}
          <KonvaText
            text={`${widthMeters.toFixed(2)} m`}
            x={x + w / 2 - 20}
            y={y - 20}
            fontSize={16}
            fill="white"
            stroke="blue"
            strokeWidth={2}
          />
          {/* Altura (izquierda) */}
          <KonvaText
            text={`${heightMeters.toFixed(2)} m`}
            x={x - 45}
            y={y + h / 2 - 10}
            fontSize={16}
            fill="white"
            stroke="blue"
            strokeWidth={2}
          />
        </React.Fragment>
      );
    }

    if (shape.type === "polygon" && shape.points.length >= 3) {
      const ptsFlat = shape.points.map((p) => [p.x * zoom, p.y * zoom]).flat();

      return (
        <React.Fragment key={i}>
          <Line points={ptsFlat} closed stroke="#2563EB" strokeWidth={2} />
          {shape.points.map((point, idx) => {
            const next = shape.points[(idx + 1) % shape.points.length];
            const x1 = point.x * zoom;
            const y1 = point.y * zoom;
            const x2 = next.x * zoom;
            const y2 = next.y * zoom;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            const dist =
              Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * (scale / zoom);

            return (
              <KonvaText
                key={`side-${idx}`}
                text={`${dist.toFixed(2)} m`}
                x={midX + 5}
                y={midY - 10}
                fontSize={16}
                fill="white"
                stroke="blue"
                strokeWidth={2}
              />
            );
          })}
        </React.Fragment>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        Medición
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <div className="flex flex-wrap gap-2 mb-3">
          <Button
            variant={tool === "line" ? "contained" : "outlined"}
            color={tool === "line" ? "primary" : "inherit"}
            onClick={() => setTool("line")}
            startIcon={<FaRulerHorizontal />}
          >
            Línea
          </Button>
          <Button
            variant={tool === "rect" ? "contained" : "outlined"}
            color={tool === "rect" ? "primary" : "inherit"}
            onClick={() => setTool("rect")}
            startIcon={<FaVectorSquare />}
          >
            Rectángulo
          </Button>
          <Button
            variant={tool === "polygon" ? "contained" : "outlined"}
            color={tool === "polygon" ? "primary" : "inherit"}
            onClick={() => setTool("polygon")}
            startIcon={<FaDrawPolygon />}
          >
            Polígono
          </Button>

          <Button variant="outlined" onClick={resetAll}>
            Reset
          </Button>
          {/* <Button variant="outlined" onClick={() => removeByType("line")}>
            X Líneas
          </Button>
          <Button variant="outlined" onClick={() => removeByType("rect")}>
            X Rect
          </Button>
          <Button variant="outlined" onClick={() => removeByType("polygon")}>
            X Pol
          </Button> */}
          <Button
            variant="outlined"
            onClick={() => setZoom((z) => Math.min(z + 0.2, 5))}
          >
            Zoom +
          </Button>
          <Button
            variant="outlined"
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.2))}
          >
            Zoom -
          </Button>
          <Button variant="contained" color="success" onClick={handleDownload}>
            <FaDownload className="w-5 h-5 " />
          </Button>
        </div>
        <div className="overflow-auto  w-full flex justify-center">
          <Stage
            ref={stageRef}
            width={image?.width ? image.width * zoom : 600}
            height={image?.height ? image.height * zoom : 400}
            onClick={handleStageClick}
            onTouchStart={handleStagePointer}
            className="bg-white shadow"
          >
            <Layer>
              {image && (
                <KonvaImage
                  image={image}
                  width={image.width * zoom}
                  height={image.height * zoom}
                />
              )}
            </Layer>
            <Layer>
              {shapes.map((shape, i) => renderShape(shape, i))}
              {current.map((pt, i) => (
                <Rect
                  key={`pt-${i}`}
                  x={pt.x * zoom - 3}
                  y={pt.y * zoom - 3}
                  width={6}
                  height={6}
                  fill="blue"
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MeasurementModal;
