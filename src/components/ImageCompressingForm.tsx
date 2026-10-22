"use client";

import type { ReactNode } from "react";
import Stack from "@mui/material/Stack";
import { compressImagesInFormData } from "@/lib/compress-image";

/**
 * A form that compresses the images in `imageField` in the browser before
 * handing the FormData to the Server Action. Compression runs inside the form
 * action, so `SubmitButton`'s pending spinner also covers it.
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
  async function compressThenSubmit(formData: FormData) {
    await compressImagesInFormData(formData, imageField, { maxDimension });
    await action(formData);
  }

  return (
    <Stack component="form" action={compressThenSubmit} spacing={2}>
      {children}
    </Stack>
  );
}
