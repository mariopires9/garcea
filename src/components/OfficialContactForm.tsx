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
import { OFFICIAL_CONTACT_TYPE_LABELS } from "@/components/OfficialContactIcon";

type ContactType = keyof typeof OFFICIAL_CONTACT_TYPE_LABELS;

const VALUE_FIELD: Record<ContactType, { label: string; type: string; placeholder?: string }> = {
  EMAIL: { label: "Email", type: "email" },
  PHONE: { label: "Número de Telefone", type: "tel" },
  FACEBOOK: { label: "Link do Facebook", type: "url", placeholder: "https://..." },
};

export function OfficialContactForm({
  action,
  error,
  defaultValues,
  submitLabel = "Adicionar",
}: {
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
  defaultValues?: { type: ContactType; label: string | null; value: string };
  submitLabel?: string;
}) {
  const [type, setType] = useState<ContactType>(defaultValues?.type ?? "EMAIL");
  const valueField = VALUE_FIELD[type];

  return (
    <FormCard error={error}>
      <Stack component="form" action={action} spacing={2}>
        <FormControl fullWidth>
          <InputLabel id="official-contact-type-label">Tipo</InputLabel>
          <Select
            labelId="official-contact-type-label"
            label="Tipo"
            name="type"
            value={type}
            onChange={(event: SelectChangeEvent) =>
              setType(event.target.value as ContactType)
            }
          >
            {Object.entries(OFFICIAL_CONTACT_TYPE_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Etiqueta (opcional)"
          name="label"
          placeholder="Ex.: Associação GARCEA"
          defaultValue={defaultValues?.label ?? ""}
        />

        <TextField
          label={valueField.label}
          name="value"
          type={valueField.type}
          placeholder={valueField.placeholder}
          required
          defaultValue={defaultValues?.value}
        />

        <SubmitButton variant="contained" sx={{ alignSelf: "flex-start" }}>
          {submitLabel}
        </SubmitButton>
      </Stack>
    </FormCard>
  );
}
