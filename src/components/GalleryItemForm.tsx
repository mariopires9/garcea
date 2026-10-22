"use client";

import { useState } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FormCard } from "@/components/FormCard";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageCompressingForm } from "@/components/ImageCompressingForm";
import { MAX_PHOTOS_PER_UPLOAD } from "@/lib/upload-limits";

type EventOption = { id: string; title: string };

export function GalleryItemForm({
  action,
  events,
  error,
}: {
  action: (formData: FormData) => void | Promise<void>;
  events: EventOption[];
  error?: string;
}) {
  const [type, setType] = useState<"PHOTO" | "VIDEO">("PHOTO");
  const [photoError, setPhotoError] = useState<string | null>(null);

  return (
    <FormCard error={error}>
      <ImageCompressingForm action={action} imageField="photo" maxDimension={1920}>
        <FormControl fullWidth>
          <InputLabel id="type-label">Tipo</InputLabel>
          <Select
            labelId="type-label"
            label="Tipo"
            name="type"
            value={type}
            onChange={(event: SelectChangeEvent) =>
              setType(event.target.value as "PHOTO" | "VIDEO")
            }
          >
            <MenuItem value="PHOTO">Foto</MenuItem>
            <MenuItem value="VIDEO">Vídeo</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="event-label" shrink>
            Evento (opcional)
          </InputLabel>
          <Select
            labelId="event-label"
            label="Evento (opcional)"
            name="eventId"
            defaultValue=""
            displayEmpty
            notched
          >
            <MenuItem value="">Nenhum</MenuItem>
            {events.map((event) => (
              <MenuItem key={event.id} value={event.id}>
                {event.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {type === "PHOTO" ? (
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Ficheiros de foto (até {MAX_PHOTOS_PER_UPLOAD} de cada vez)
            </Typography>
            <input
              type="file"
              name="photo"
              accept="image/*"
              multiple
              required
              onChange={(event) => {
                const count = event.target.files?.length ?? 0;
                if (count > MAX_PHOTOS_PER_UPLOAD) {
                  event.target.value = "";
                  setPhotoError(
                    `Selecionou ${count} fotos. Pode enviar no máximo ${MAX_PHOTOS_PER_UPLOAD} de cada vez.`,
                  );
                } else {
                  setPhotoError(null);
                }
              }}
            />
            {photoError && <Alert severity="warning">{photoError}</Alert>}
          </Stack>
        ) : (
          <TextField
            label="Link do Vídeo (YouTube ou Facebook)"
            name="videoUrl"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=... ou https://www.facebook.com/.../videos/..."
            helperText="Cole o link normal do vídeo, tal como aparece no YouTube ou no Facebook"
          />
        )}

        <SubmitButton variant="contained" sx={{ alignSelf: "flex-start" }}>
          Enviar
        </SubmitButton>
      </ImageCompressingForm>
    </FormCard>
  );
}
