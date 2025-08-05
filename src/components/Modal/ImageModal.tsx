import { Modal, Box } from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";

const ImageModal = ({
  open,
  onClose,
  imageUrl,
}: {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
}) => {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const small = img.width < 600 || img.height < 600;
      setIsSmall(small);
    };
  }, [imageUrl]);

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
        <button
          title="Cerrar vista ampliada"
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-700 hover:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-xl"
          style={{ zIndex: 10 }}
        >
          <FaTimes className="text-lg" />
        </button>

        {isSmall ? (
          <Box
            sx={{
              width: "min(90vw, 600px)",
              height: "min(90vh, 600px)",
              minWidth: "300px",
              minHeight: "300px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "8px",
              p: 2,
              backgroundColor: "transparent", // Sin fondo blanco
            }}
          >
            <img
              src={imageUrl}
              alt="Vista ampliada"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          </Box>
        ) : (
          <img
            src={imageUrl}
            alt="Vista ampliada"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-lg cursor-grab"
          />
        )}
      </Box>
    </Modal>
  );
};

export default ImageModal;
