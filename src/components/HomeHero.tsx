import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";

export function HomeHero() {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #0340d8 0%, #062a8f 100%)",
        color: "common.white",
        py: { xs: 4, sm: 6 },
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <Typography variant="h6" component="h1" sx={{ mb: 3, opacity: 0.9, fontWeight: 400 }}>
          Bem-vindo ao site oficial da Associação GARCEA. Aqui pode encontrar
          informação sobre os nossos eventos, uma galeria de fotos e vídeos, e
          formas de entrar em contacto connosco.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "center" }}
        >
          <Button href="/events" variant="contained" color="secondary" size="large">
            Ver Eventos
          </Button>
          <Button
            href="/history"
            variant="outlined"
            size="large"
            sx={{
              color: "common.white",
              borderColor: "rgba(255,255,255,0.6)",
              "&:hover": { borderColor: "common.white", bgcolor: "rgba(255,255,255,0.08)" },
            }}
          >
            Conhecer a Nossa História
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
