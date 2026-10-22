"use client";

import { useState, type ReactNode } from "react";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import { compressImagesInFormData } from "@/lib/compress-image";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-limits";

function toMegabytes(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(1).replace(".", ",");
}

/**
 * A form that compresses the images in `imageField` in the browser before
 * handing the FormData to the Server Action. Compression runs inside the form
 * action, so `SubmitButton`'s pending spinner also covers it. If the files
 * are still too big for one request, it shows an error instead of sending.
 */
export function ImageCompressingForm({
  action,
  imageField,
  maxDimension,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  imageField: string;
  maxDimension: number;
  children: ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);

  async function compressThenSubmit(formData: FormData) {
    setError(null);
    await compressImagesInFormData(formData, imageField, { maxDimension });

    const totalBytes = formData
      .getAll(imageField)
      .reduce((sum, entry) => sum + (entry instanceof File ? entry.size : 0), 0);
    if (totalBytes > MAX_UPLOAD_BYTES) {
      setError(
        `Os ficheiros ocupam ${toMegabytes(totalBytes)} MB, mais do que o máximo de ` +
          `${toMegabytes(MAX_UPLOAD_BYTES)} MB por envio. Envie menos ficheiros de cada vez ` +
          "ou ficheiros mais pequenos.",
      );
      return;
    }

    await action(formData);
  }

  return (
    <Stack component="form" action={compressThenSubmit} spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      {children}
    </Stack>
  );
}
