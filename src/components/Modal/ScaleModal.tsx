import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Button,
  TextField,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Stage, Layer, Line, Image as KonvaImage, Circle } from "react-konva";

interface Props {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  onCalcularEscala: (escala: number, blob: Blob) => void;
}

const ScaleModal: React.FC<Props> = ({
  open,
  onClose,
  imageUrl,
  onCalcularEscala,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [points, setPoints] = useState<number[]>([]);
  const [realDistance, setRealDistance] = useState<string>("");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scaleFactor, setScaleFactor] = useState(1);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const stageRef = useRef<any>(null);
  const stageMax = { width: 800, height: 600 };

useEffect(() => {
    if (!imageUrl || !open) return;

    resetPuntos();

    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      const scale = Math.min(
        stageMax.width / naturalWidth,
        stageMax.height / naturalHeight
      );

      setScaleFactor(scale);
      setImageSize({
        width: naturalWidth * scale,
        height: naturalHeight * scale,
      });
      setImage(img);
    };
  }, [imageUrl, open]);

  const handleClose = () => {
    resetPuntos();
    setScale(1);
    setPosition({ x: 0, y: 0 });
    onClose();
  };

  const handleClick = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer || points.length >= 4) return;

    const point = {
      x: (pointer.x - position.x) / scale,
      y: (pointer.y - position.y) / scale,
    };

    setPoints((prevPoints) => [...prevPoints, point.x, point.y]);
  };

  const calcularEscala = async () => {
    if (points.length !== 4 || !realDistance || !image) return;

    const [x1, y1, x2, y2] = points;
    const pixelDistance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const distanciaReal = parseFloat(realDistance.replace(",", "."));
    if (isNaN(distanciaReal) || distanciaReal <= 0) {
      alert("Distancia real inválida");
      return;
    }

    const escala = distanciaReal / pixelDistance;

    const canvas = document.createElement("canvas");
    canvas.width = imageSize.width;
    canvas.height = imageSize.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(image, 0, 0, imageSize.width, imageSize.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCalcularEscala(escala, blob);
        onClose();
      },
      "image/jpeg",
      0.95
    );
  };

  const resetPuntos = () => {
    setPoints([]);
    setRealDistance("");
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

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
    setPosition(e.target.position());
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ position: "relative", p: 2 }}>
        <Typography>Calibrar Medida</Typography>
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "#f9f9f9" }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          width="100%"
        >
          <Box
            width="100%"
            sx={{
              display: "flex",
              justifyContent: "center",
              overflowX: "auto",
              maxHeight: "70vh",
            }}
          >
            <Box
              width="100%"
              maxWidth={imageSize.width}
              sx={{
                width: "100%",
                height: "auto",
                background: "#fff",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Stage
                ref={stageRef}
                width={imageSize.width}
                height={imageSize.height}
                scaleX={scale}
                scaleY={scale}
                x={position.x}
                y={position.y}
                draggable
                onWheel={handleWheel}
                onDragEnd={handleDragEnd}
                onMouseDown={handleClick}
                onTouchStart={handleClick}
                style={{
                  width: "100%",
                  height: "100%",
                  touchAction: "manipulation",
                  background: "#fff",
                }}
              >
                <Layer>
                  {image && (
                    <KonvaImage
                      image={image}
                      width={imageSize.width}
                      height={imageSize.height}
                    />
                  )}
                  {points.length >= 2 && (
                    <Line
                      points={points}
                      stroke="red"
                      strokeWidth={1}
                      lineCap="round"
                      lineJoin="round"
                    />
                  )}
                  {points.map((_, i) => (
                    <Circle
                      key={i}
                      x={points[i * 2]}
                      y={points[i * 2 + 1]}
                      radius={4}
                      fill="blue"
                      draggable
                      onDragMove={(e) => {
                        const newPoints = [...points];
                        newPoints[i * 2] = e.target.x();
                        newPoints[i * 2 + 1] = e.target.y();
                        setPoints(newPoints);
                      }}
                    />
                  ))}
                </Layer>
              </Stage>
            </Box>
          </Box>

          <TextField
            label="Distancia real (m)"
            variant="outlined"
            value={realDistance}
            onChange={(e) => setRealDistance(e.target.value)}
            fullWidth
            sx={{ maxWidth: 300 }}
          />

          <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            gap={2}
            mt={1}
            width="100%"
          >
            <Button
              variant="contained"
              color="primary"
              onClick={calcularEscala}
              disabled={points.length < 4 || !realDistance}
            >
              Calcular escala
            </Button>
            <Button variant="outlined" onClick={resetPuntos}>
              Reset
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ScaleModal;
