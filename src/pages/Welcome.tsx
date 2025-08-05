import ProcessForm from "../components/Procesamiento/ProcessForm";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const Welcome = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card
        sx={{
          width: "100%",
          maxWidth: "100%",
          borderRadius: 0,
          backgroundColor: "transparent",
          boxShadow: "none",
          border: "none",
          px: { xs: 0, md: 0 },
          py: { xs: 2, md: 2 },
        }}
      >
        <CardContent>
          <Box
            className="text-center mb-10 px-4 py-8 rounded-2xl"
            sx={{
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            <ImageIcon sx={{ fontSize: 60, color: "#facc15", mb: 2 }} />

            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: "#fde68a",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                mb: 2,
              }}
            >
              Plataforma Inteligente de Análisis de Fachadas
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#e2e8f0",
                fontSize: { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.8,
                maxWidth: "900px",
                mx: "auto",
                textAlign: "justify",
                mb: 3,
              }}
            >
              Esta herramienta avanzada permite procesar imágenes de fachadas de
              casas de forma automática e inteligente.
            </Typography>
            <Accordion
              sx={{
                backgroundColor: "#1e293b",
                borderRadius: "12px",
                mt: 2,
                color: "#e2e8f0",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#facc15" }} />}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  ¿Cómo funciona esta herramienta?
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 3, textAlign: "justify" }}>
                <Typography paragraph>
                  <strong>1.</strong> Puedes mejorar la calidad de la imagen
                  presionando <strong>"Mejorar"</strong> si la imagen lo
                  requiere.
                </Typography>
                <Typography paragraph>
                  <strong>2.</strong> Al hacer clic en{" "}
                  <strong>"Procesar imagen"</strong>, se eliminará el fondo
                  utilizando 6 modelos distintos para que puedas elegir el más
                  preciso.
                </Typography>
                <Typography paragraph>
                  <strong>3.</strong> Luego de elegir el resultado más adecuado,
                  presiona <strong>"Obtener medidas"</strong> para detectar
                  contornos externos (fachada) e internos (puertas y ventanas).
                </Typography>
                <Typography paragraph>
                  <strong>4.</strong> Finalmente, se calcularán las dimensiones
                  exactas y se generará un plano detallado como referencia
                  arquitectónica.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Divider sx={{ borderColor: "rgba(30, 211, 30, 0.8)" }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ProcessForm />
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};
