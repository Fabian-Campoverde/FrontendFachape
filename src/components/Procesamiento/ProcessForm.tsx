import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { procesarImagenThunk } from "../../store/backSlice";
import { useAppDispatch, type RootState } from "../../store";
import { Button } from "@mui/material";
import { FaDownload, FaMagic, FaRuler, FaSpinner } from "react-icons/fa";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import ImageUploader from "../Input/ImageUploader";
import CropIcon from "@mui/icons-material/Crop";
import CloseIcon from "@mui/icons-material/Close";
import PolygonCropper from "../Recorte/PolygonCropper";
import ImageModal from "../Modal/ImageModal";
import MedidaModal from "../Modal/MedidaModal";
import ImageMeasurementModal from "../Modal/ImageMeasurementModal";
import MeasurementModal from "../Modal/MeasurementModal";

const ProcessForm = () => {
  const dispatch = useAppDispatch();
  const {
    results = {},
    loading = {},
    error = {},
  } = useSelector((state: RootState) => state.procesamiento || {});
 const [showMedidaModal, setShowMedidaModal] = useState<string | null>(null);
  
  const [modalResultOpen, setModalResultOpen] = useState(false);
  const [showManualCrop, setShowManualCrop] = useState(false);
  const [escalaActual, setEscalaActual] = useState<number | null>(0);

  const actionOptions: Record<string, string> = {
    remover: "Básico",
    remover_carvekit: "CarveKit",
    remover_blurfusion: "BlurFusion",
    remover_briaai: "BriaAI",
    remover_u2net: "U2Net",
    remover_basnet: "Basnet",
  };

  const [blobEscalado, setBlobEscalado] = useState<Blob | null>(null);


  const [selectedAction, setSelectedAction] = useState<string>(
    Object.keys(actionOptions)[0]
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [completedCrop, setCompletedCrop] = useState<any>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResultUrl, setSelectedResultUrl] = useState<string | null>(
    null
  );
  const [openMedidaModal, setOpenMedidaModal] = useState(false);
  const [openMedidaOriginModal, setOpenMedidaOriginModal] = useState(false);

  const [escalaPx, setEscalaPx] = useState<number | null>(null);

  const toggleCrop = () => setShowCrop((prev) => !prev);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowCrop(false);
    }
  };

  const getProcessedBlob = async (): Promise<Blob | null> => {
    const image = imgRef.current;
    if (!image) return null;

    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropArea =
      showCrop && completedCrop?.width
        ? completedCrop
        : {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          };

    const cropWidth = cropArea.width * scaleX;
    const cropHeight = cropArea.height * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(
      image,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      cropWidth,
      cropHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || null);
      }, "image/jpeg");
    });
  };

  const handleSubmit = async () => {
    if (!selectedFile || !previewUrl) return;

    const blob = await getProcessedBlob();
    if (!blob) return;

    const fileToSend = new File([blob], selectedFile.name, {
      type: "image/jpeg",
    });

    Object.keys(actionOptions).forEach((actionKey) => {
      dispatch(procesarImagenThunk({ image: fileToSend, action: actionKey }));
    });
  };
  
  const handleMedidaSubmit = async (blob: Blob, escala: number) => {
  if (!selectedFile || !blob || escala == null) return;

  const fileToSend = new File([blob], selectedFile.name, {
    type: "image/jpeg",
  });

  const acciones = [
    "medir_yolo_original",
    "medir_yolo_con_medidas",
    "medir_yolo_solo_lineas",
  ];

  acciones.forEach((action) => {
    dispatch(
      procesarImagenThunk({
        image: fileToSend,
        action,
        escalaPx: escala,
      })
    );
  });
  setEscalaActual(escala);
};

  

  useEffect(() => {
    if (!loading["mejorar_s"] && results["mejorar_s"]) {
      setPreviewUrl(results["mejorar_s"]);
      fetch(results["mejorar_s"])
        .then((res) => res.blob())
        .then((blob) => {
          const improvedFile = new File(
            [blob],
            selectedFile?.name || "mejorada.jpg",
            {
              type: "image/jpeg",
            }
          );
          setSelectedFile(improvedFile);
        });
    }
  }, [loading["mejorar_s"], results["mejorar_s"]]);
  const handleMejorar = async () => {
    if (!selectedFile || !previewUrl) return;

    const blob = await getProcessedBlob();
    if (!blob) return;

    const improvedFile = new File([blob], selectedFile.name, {
      type: "image/jpeg",
    });

    dispatch(procesarImagenThunk({ image: improvedFile, action: "mejorar_s" }));
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto py-8 px-4">
      {/* Input arriba */}
      <div className="w-full rounded-xl shadow-sm ">
        <ImageUploader handleFileChange={handleFileChange} />
      </div>

      {/* Abajo: dos columnas */}
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        {/* IZQUIERDA: preview + botones */}
        <div className="flex-1 bg-[#E0E7FF] border border-gray-200 rounded-xl shadow-sm p-6 space-y-4 flex flex-col items-center justify-between">
          {previewUrl && (
            <div className="relative w-full max-w-4xl mx-auto p-2">
              {/* Botón cancelar selección */}
              <div className="absolute top-2 right-2 z-10 flex flex-row space-x-2 translate-y-[-100%]">
                <button
                  title="Cancelar selección"
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white rounded p-1 text-xs sm:text-sm md:text-base w-8 sm:w-10 h-8 sm:h-7 flex items-center justify-center"
                >
                  <CloseIcon fontSize="inherit" />
                </button>

                <button
                  title="Recortar imagen"
                  onClick={toggleCrop}
                  className={`${
                    showCrop
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white rounded p-1 text-xs sm:text-sm md:text-base w-8 sm:w-10 h-8 sm:h-7 flex items-center justify-center`}
                >
                  <CropIcon fontSize="inherit" />
                </button>

                <button
                  onClick={() => setShowManualCrop(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded p-1 text-xs sm:text-sm md:text-base w-8 sm:w-10 h-8 sm:h-7 flex items-center justify-center"
                >
                  ✏️
                </button>
              </div>

              {/* Imagen */}
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow">
                <div className="w-full h-auto aspect-video flex items-center justify-center">
                  {showCrop ? (
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      keepSelection
                    >
                      <img
                        ref={imgRef}
                        src={previewUrl}
                        alt="preview"
                        className="max-w-full max-h-[90vh] object-contain"
                      />
                    </ReactCrop>
                  ) : (
                    <img
                      ref={imgRef}
                      src={previewUrl}
                      alt="preview"
                      className="max-w-full max-h-[90vh] object-contain cursor-pointer"
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "90vh",
                        objectFit: "contain",
                        display: "block",
                        margin: "0 auto",
                      }}
                      onClick={() => !showCrop && setModalOpen(true)}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full mt-4">
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleMejorar}
                  disabled={!selectedFile || loading["mejorar_s"]}
                  sx={{
                    backgroundColor: loading["mejorar_s"]
                      ? "#d32f2f"
                      : "#e53935",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    padding: "10px 0",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 10px rgba(229, 57, 53, 0.4)",
                    "&:hover": {
                      backgroundColor: "#c62828",
                      boxShadow: "0px 4px 15px rgba(198, 40, 40, 0.6)",
                    },
                    "&:disabled": {
                      backgroundColor: "#f8bbbb",
                      color: "#ffffff",
                      cursor: "not-allowed",
                      boxShadow: "none",
                    },
                  }}
                >
                  {loading["mejorar_s"] ? "Mejorando..." : "✨ Mejorar"}
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={!selectedFile || loading[selectedAction]}
                  sx={{ py: 1.2, fontWeight: "bold" }}
                >
                  🪄 Remover Fondo
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => setOpenMedidaOriginModal(true)}
                  disabled={!selectedFile || loading["medir_yolo_con_medidas"]}
                  sx={{ py: 1.2, fontWeight: "bold" }}
                >
                  {loading["medir_yolo_con_medidas"]
                    ? "Generando..."
                    : "📏 Generar Medidas"}
                </Button>
              </div>

              <ImageModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                imageUrl={previewUrl}
              />
              <MedidaModal
                open={openMedidaOriginModal}
                onClose={() => setOpenMedidaOriginModal(false)}
                imageUrl={previewUrl}
                onCalcularEscala={(escala: number, blob: Blob) => {
                  setEscalaPx(escala);
                  setBlobEscalado(blob);
                  handleMedidaSubmit(blob, escala);
                }}
              />
            </div>
          )}
        </div>

        {/* DERECHA: resultados */}
        <div className="flex-1 bg-[#E0E7FF] border border-gray-200 rounded-xl shadow-sm p-4 md:p-6 flex flex-col items-center">
          {/* Contenedor de Imagen */}
          <div className="w-full max-w-4xl mx-auto p-2">
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow">
              <div className="w-full h-auto aspect-video flex items-center justify-center">
                {loading[selectedAction] ? (
                  <FaSpinner className="animate-spin text-blue-500 text-4xl" />
                ) : error[selectedAction] ? (
                  <p className="text-red-500 text-center px-4">
                    {error[selectedAction]}
                  </p>
                ) : results[selectedAction] ? (
                  <img
                    src={results[selectedAction]}
                    alt={selectedAction}
                    className="max-w-full max-h-[90vh] object-contain cursor-pointer"
                    onClick={() => setModalResultOpen(true)}
                  />
                ) : (
                  <p className="text-gray-500 text-center px-6 text-sm">
                    No se ha generado ninguna imagen aún.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          {results[selectedAction] && (
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <MedidaModal
                open={openMedidaModal}
                onClose={() => setOpenMedidaModal(false)}
                imageUrl={results[selectedAction]}
                onCalcularEscala={(escala: number, blob: Blob) => {
                  setEscalaPx(escala);
                  setBlobEscalado(blob);
                  handleMedidaSubmit(blob, escala);
                }}
              />
              {Object.entries(actionOptions).map(
                ([actionKey, label], index) => {
                  const colors = [
                    "bg-blue-600 hover:bg-blue-700",
                    "bg-green-600 hover:bg-green-700",
                    "bg-purple-600 hover:bg-purple-700",
                    "bg-rose-600 hover:bg-rose-700",
                  ];
                  const color = colors[index % colors.length];
                  const isSelected = selectedAction === actionKey;

                  return (
                    <button
                      key={actionKey}
                      onClick={() => {
                        setSelectedAction(actionKey);
                        if (results[actionKey]) {
                          setSelectedResultUrl(results[actionKey]);
                        }
                      }}
                      disabled={loading[actionKey]}
                      title={label}
                      className={`flex items-center justify-center w-10 h-10 rounded-full text-sm transition-all duration-200 border shadow-sm group ${
                        isSelected
                          ? `${color} text-white border-transparent`
                          : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                      } ${
                        loading[actionKey]
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {loading[actionKey] ? (
                        <FaSpinner className="animate-spin text-white text-xs" />
                      ) : (
                        <FaMagic className="text-base" />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          )}

          {modalResultOpen && results[selectedAction] && (
            <ImageModal
              open={modalResultOpen}
              onClose={() => setModalResultOpen(false)}
              imageUrl={results[selectedAction]}
            />
          )}
          <div className="flex flex-col gap-3 w-full mt-5">
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={() => setOpenMedidaModal(true)}
              disabled={!selectedResultUrl || loading["medir_yolo_con_medidas"]}
              sx={{ py: 1.2, fontWeight: "bold" }}
            >
              {loading["medir_yolo_con_medidas"] ? "Generando..." : "📐 Generar Medidas"}
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              // onClick={handleMedida1Submit}
              disabled={!selectedResultUrl || loading["medir_yolo_con_medidas"]}
              sx={{ py: 1.2, fontWeight: "bold" }}
            >
              {loading["medir_yolo_con_medidas"] ? "Generando..." : "🗺️ Generar Plano"}
            </Button>
          </div>
        </div>
      </div>
      {results["medir_yolo_original"] && results["medir_yolo_con_medidas"] && results["medir_yolo_solo_lineas"] && (
  <div className="w-full mt-6">
    <div className="bg-[#E0E7FF] border border-gray-200 rounded-xl shadow p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold text-center text-gray-800 mb-4">
        Resultado de Medición
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* BLOQUE DE IMAGEN INDIVIDUAL */}
        {[
          { key: "medir_yolo_original", label: "Original" },
          { key: "medir_yolo_con_medidas", label: "Con medidas" },
          { key: "medir_yolo_solo_lineas", label: "Solo líneas" },
        ].map(({ key, label }) => (
          <div
            key={key}
            className="flex flex-col items-center p-4 border border-gray-300 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="font-medium mb-2 text-center text-gray-700">
              {label}
            </h3>
            <img
              src={results[key]}
              alt={label}
              className="max-w-full max-h-[60vh] object-contain rounded mb-3"
            />

            <div className="flex gap-4">
              <a
                href={results[key]}
                download={`${key}.jpg`}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded shadow"
              >
                <FaDownload />
                Descargar
              </a>

              <button
                onClick={() => setShowMedidaModal(key)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded shadow"
              >
                <FaRuler />
                Medir
              </button>
            </div>

            <MeasurementModal
              isOpen={showMedidaModal === key}
              onClose={() => setShowMedidaModal(null)}
              imageUrl={results[key]}
              scale={escalaActual || 1}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
)}

      {showManualCrop && previewUrl && (
        <PolygonCropper
          imageUrl={previewUrl || ""}
          open={showManualCrop}
          onClose={() => setShowManualCrop(false)}
        />
      )}
    </div>
  );
};

export default ProcessForm;
