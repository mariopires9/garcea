import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { isPdfUrl } from "@/lib/supabase-storage";
import { FormCard } from "@/components/FormCard";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageCompressingForm } from "@/components/ImageCompressingForm";

type EventFormValues = {
  title: string;
  description: string;
  date: string;
  location: string;
  posterUrl?: string | null;
  type?: "FOLCLORE" | "OUTROS";
};

function toDateInputValue(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function EventForm({
  action,
  defaultValues,
  submitLabel,
  error,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: EventFormValues;
  submitLabel: string;
  error?: string;
}) {
  return (
    <FormCard error={error}>
      {/* Posters often carry small text, so keep more resolution than gallery photos. */}
      <ImageCompressingForm action={action} imageField="cartaz" maxDimension={2560}>
        <TextField label="Título" name="title" required defaultValue={defaultValues?.title} />
        <TextField
          label="Descrição"
          name="description"
          required
          multiline
          rows={4}
          defaultValue={defaultValues?.description}
        />
        <TextField
          label="Data"
          name="date"
          type="date"
          required
          defaultValue={toDateInputValue(defaultValues?.date)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Localização"
          name="location"
          required
          defaultValue={defaultValues?.location}
        />

        <FormControl fullWidth>
          <InputLabel id="event-type-label">Tipo</InputLabel>
          <Select
            labelId="event-type-label"
            label="Tipo"
            name="type"
            defaultValue={defaultValues?.type ?? "FOLCLORE"}
          >
            <MenuItem value="FOLCLORE">Folclore</MenuItem>
            <MenuItem value="OUTROS">Outros</MenuItem>
          </Select>
        </FormControl>

        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            Cartaz (opcional)
          </Typography>
          {defaultValues?.posterUrl &&
            (isPdfUrl(defaultValues.posterUrl) ? (
              <Typography variant="body2">
                <a href={defaultValues.posterUrl} target="_blank" rel="noreferrer">
                  Ver cartaz atual (PDF)
                </a>
              </Typography>
            ) : (
              <Box
                component="img"
                src={defaultValues.posterUrl}
                alt=""
                sx={{ maxWidth: "12.5rem", borderRadius: 1 }}
              />
            ))}
          <input type="file" name="cartaz" accept="image/*,application/pdf" />
          {defaultValues?.posterUrl && (
            <label style={{ fontSize: "0.875rem" }}>
              <input type="checkbox" name="removePoster" /> Remover cartaz atual
            </label>
          )}
        </Stack>

        <SubmitButton variant="contained" sx={{ alignSelf: "flex-start" }}>
          {submitLabel}
        </SubmitButton>
      </ImageCompressingForm>
    </FormCard>
  );
}
