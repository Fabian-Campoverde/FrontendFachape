import React, { type RefObject } from "react";
import { Button } from "@mui/material";
import { FaMagic, FaSpinner } from "react-icons/fa";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import ImageModal from "../Modal/ImageModal";
import ScaleModal from "../Modal/ScaleModal";
import CloseIcon from "@mui/icons-material/Close";
import CropIcon from "@mui/icons-material/Crop";

export interface EditorImagenProps {
  previewUrl: string | null;
  results: Record<string, string>;
  loading: Record<string, boolean>;
  error: Record<string, string>;
  actionOptions: Record<string, string>;
  selectedAction: string;
  selectedFile: File | null;
  selectedResultUrl: string | null;
  showCrop: boolean;
  crop: Crop;
  completedCrop: Crop | null;
  imgRef: RefObject<HTMLImageElement | null>;
  modalOpen: boolean;
  modalResultOpen: boolean;
  openMedidaModal: boolean;
  openMedidaOriginModal: boolean;


  // setters y controladores de UI
  toggleCrop: () => void;
  setCrop: (crop: Crop) => void;
  setCompletedCrop: (crop: Crop) => void;
  setModalOpen: (open: boolean) => void;
  setModalResultOpen: (open: boolean) => void;
  setOpenMedidaModal: (open: boolean) => void;
  setOpenMedidaOriginModal: (open: boolean) => void;
  setPreviewUrl: (url: string | null) => void;
  setSelectedFile: (file: File | null) => void;
  setSelectedAction: (action: string) => void;
  setSelectedResultUrl: (url: string | null) => void;
  setShowManualCrop: (show: boolean) => void;

  // setters de cálculo y escala
  setEscalaPx: (escala: number | null) => void;
  setBlobEscalado: (blob: Blob | null) => void;

  // funciones de negocio
  handleMejorar: () => void;
  handleSubmit: () => void;
  handleMedidaSubmit: (blob: Blob, escala: number) => void;
}

export const EditorImagen: React.FC<EditorImagenProps> = ({
  previewUrl,
  results,
  loading,
  error,
  actionOptions,
  selectedAction,
  selectedFile,
  selectedResultUrl,
  showCrop,
  crop,
  completedCrop,
  imgRef,
  modalOpen,
  modalResultOpen,
  openMedidaModal,
  openMedidaOriginModal,
  toggleCrop,
  setCrop,
  setCompletedCrop,
  setModalOpen,
  setModalResultOpen,
  setOpenMedidaModal,
  setOpenMedidaOriginModal,
  setPreviewUrl,
  setSelectedFile,
  setSelectedAction,
  setSelectedResultUrl,
  handleMejorar,
  handleSubmit,
  handleMedidaSubmit,
  setShowManualCrop, setEscalaPx, setBlobEscalado
}) => {
  return (
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
                  disabled={!selectedFile || loading["mejorar_gan"]}
                  sx={{
                    backgroundColor: loading["mejorar_gan"]
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
                  {loading["mejorar_gan"] ? "Mejorando..." : "✨ Mejorar"}
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
                  disabled={
                    !selectedFile ||
                    loading["medir_yolo_original"] ||
                    loading["medir_yolo_con_medidas"] ||
                    loading["medir_yolo_solo_lineas"]
                  }
                  sx={{ py: 1.2, fontWeight: "bold" }}
                >
                  {loading["medir_yolo_original"] ||
                  loading["medir_yolo_con_medidas"] ||
                  loading["medir_yolo_solo_lineas"] ? (
                    <FaSpinner className="animate-spin text-blue-500 text-4xl" />
                  ) : (
                    "📏 Generar Medidas"
                  )}
                </Button>
              </div>

              <ImageModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                imageUrl={previewUrl}
              />
              <ScaleModal
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
              <ScaleModal
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
              disabled={
                !selectedResultUrl ||
                loading["medir_yolo_original"] ||
                loading["medir_yolo_con_medidas"] ||
                loading["medir_yolo_solo_lineas"]
              }
              hidden={!selectedResultUrl}
              sx={{ py: 1.2, fontWeight: "bold" }}
            >
              {loading["medir_yolo_original"] ||
              loading["medir_yolo_con_medidas"] ||
              loading["medir_yolo_solo_lineas"] ? (
                <FaSpinner className="animate-spin text-blue-500 text-4xl" />
              ) : (
                "📐 Generar Medidas"
              )}
            </Button>
          </div>
        </div>
    </div>
  );
};
