import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Typography, Button, Container, Box } from "@mui/material";

interface Props {
  children: ReactNode;
}

const NotFoundPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        backgroundImage: "linear-gradient(to right, #0f172a, #1e293b, #0f172a)", // tailwind: from-slate-900 via-slate-800 to-slate-900
        color: "white",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "5rem", md: "8rem" },
            fontWeight: "bold",
            mb: 2,
          }}
        >
          404
        </Typography>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: 500 }}
        >
          Oops... Página no encontrada
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 4, color: "rgba(255,255,255,0.7)" }}
        >
          Parece que la página que buscas no existe o fue movida.
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#2563eb", // tailwind: blue-600
            "&:hover": { backgroundColor: "#1d4ed8" }, // tailwind: blue-700
            px: 4,
            py: 1.2,
            fontWeight: "bold",
          }}
          href="/"
        >
          Volver al inicio
        </Button>
      </Container>
    </Box>
  );
};

export const RoutesWithNotFound = ({ children }: Props) => {
  return (
    <Routes>
      {children}
      <Route path="*" element={<Navigate to="/404" />} />
      <Route path="/404" element={<NotFoundPage />} />
    </Routes>
  );
};
