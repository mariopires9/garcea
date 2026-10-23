"use client";

import { useState } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FormCard } from "@/components/FormCard";
import { SubmitButton } from "@/components/SubmitButton";
import { SOCIAL_PLATFORM_LABELS } from "@/components/SocialIcon";

type Platform = keyof typeof SOCIAL_PLATFORM_LABELS;

export function SocialLinkForm({
  action,
  error,
  defaultValues,
  submitLabel = "Adicionar",
}: {
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
  defaultValues?: { platform: Platform; url: string };
  submitLabel?: string;
}) {
  const [platform, setPlatform] = useState<Platform>(defaultValues?.platform ?? "FACEBOOK");

  return (
    <FormCard error={error}>
      <Stack component="form" action={action} spacing={2}>
        <FormControl fullWidth>
          <InputLabel id="social-link-platform-label">Plataforma</InputLabel>
          <Select
            labelId="social-link-platform-label"
            label="Plataforma"
            name="platform"
            value={platform}
            onChange={(event: SelectChangeEvent) =>
              setPlatform(event.target.value as Platform)
            }
          >
            {Object.entries(SOCIAL_PLATFORM_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Link"
          name="url"
          type="url"
          required
          placeholder="https://..."
          defaultValue={defaultValues?.url}
        />

        <SubmitButton variant="contained" sx={{ alignSelf: "flex-start" }}>
          {submitLabel}
        </SubmitButton>
      </Stack>
    </FormCard>
  );
}
