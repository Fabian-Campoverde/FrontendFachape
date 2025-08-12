import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { procesarImagenThunk } from "../../store/backSlice";
import { useAppDispatch, type RootState } from "../../store";
import { Button } from "@mui/material";
import { FaMagic, FaRuler, FaSpinner } from "react-icons/fa";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import ImageUploader from "../Input/ImageUploader";
import CropIcon from "@mui/icons-material/Crop";
import CloseIcon from "@mui/icons-material/Close";
import PolygonCropper from "../Recorte/PolygonCropper";
import ImageModal from "../Modal/ImageModal";
import ScaleModal from "../Modal/ScaleModal";
import MeasurementModal from "../Modal/MeasurementModal";
import { EditorImagen } from "./ProcesamientoUI";


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
  const [selectedResultUrl, setSelectedResultUrl] = useState<string | null>(null);
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
    for (const action of acciones) {
      await dispatch(
        procesarImagenThunk({
          image: fileToSend,
          action,
          escalaPx: escala,
        })
      );
    }
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
      {/* Input Imagen */}
      <div className="w-full rounded-xl shadow-sm ">
        <ImageUploader handleFileChange={handleFileChange} />
      </div>
<EditorImagen
      previewUrl={previewUrl}
      results={results}
      loading={loading}
      error={error}
      actionOptions={actionOptions}
      selectedAction={selectedAction}
      selectedFile={selectedFile}
      selectedResultUrl={selectedResultUrl}
      showCrop={showCrop}
      crop={crop}
      completedCrop={completedCrop}
      imgRef={imgRef}
      modalOpen={modalOpen}
      modalResultOpen={modalResultOpen}
      openMedidaModal={openMedidaModal}
      openMedidaOriginModal={openMedidaOriginModal}
      toggleCrop={toggleCrop}
      setCrop={setCrop}
      setCompletedCrop={setCompletedCrop}
      setModalOpen={setModalOpen}
      setModalResultOpen={setModalResultOpen}
      setOpenMedidaModal={setOpenMedidaModal}
      setOpenMedidaOriginModal={setOpenMedidaOriginModal}
      setPreviewUrl={setPreviewUrl}
      setSelectedFile={setSelectedFile}
      setSelectedAction={setSelectedAction}
      setSelectedResultUrl={setSelectedResultUrl}
      setEscalaPx={setEscalaPx}
      setBlobEscalado={setBlobEscalado}
      
      handleMejorar={handleMejorar}
      handleSubmit={handleSubmit}
      handleMedidaSubmit={handleMedidaSubmit}
      setShowManualCrop={setShowManualCrop}
    />
      {/* Resultados */}
      
      {results["medir_yolo_original"] &&
        results["medir_yolo_con_medidas"] &&
        results["medir_yolo_solo_lineas"] && (
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
