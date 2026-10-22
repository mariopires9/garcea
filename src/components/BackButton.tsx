import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

/** Links up to the parent page (e.g. /manage/events/new -> /manage/events). */
export function BackButton({ href }: { href: string }) {
  return (
    <Button href={href} startIcon={<ArrowBackIcon />} sx={{ alignSelf: "flex-start", mb: -2 }}>
      Voltar
    </Button>
  );
}
