"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  executeGraphQL,
  runGatedMutation,
  GraphQLRequestError,
} from "@/lib/graphql-server";
import { withFlash } from "@/lib/flash";
import { uploadPhoto, deletePhoto } from "@/lib/supabase-storage";
import { normalizeVideoUrl } from "@/lib/video";
import { MAX_PHOTOS_PER_UPLOAD } from "@/lib/upload-limits";
import {
  CREATE_GALLERY_ITEM_MUTATION,
  UPDATE_GALLERY_ITEM_MUTATION,
  DELETE_GALLERY_ITEM_MUTATION,
  DELETE_GALLERY_ITEMS_MUTATION,
} from "@/lib/queries/gallery";

function readCaption(formData: FormData) {
  const captionRaw = formData.get("caption");
  return typeof captionRaw === "string" && captionRaw ? captionRaw : null;
}

async function createOneGalleryItem(input: {
  type: "PHOTO" | "VIDEO";
  url: string;
  caption: string | null;
  eventId: string | null;
}) {
  try {
    await runGatedMutation(() =>
      executeGraphQL(CREATE_GALLERY_ITEM_MUTATION, { input }),
    );
  } catch (error) {
    // Don't leave an unreferenced file behind if the DB write failed.
    if (input.type === "PHOTO") {
      await deletePhoto(input.url).catch(() => {});
    }
    throw error;
  }
}

export async function createGalleryItemAction(formData: FormData) {
  const type = formData.get("type") === "VIDEO" ? "VIDEO" : "PHOTO";
  const eventIdRaw = formData.get("eventId");
  const eventId = typeof eventIdRaw === "string" && eventIdRaw ? eventIdRaw : null;
  const caption = readCaption(formData);

  if (type === "PHOTO") {
    const files = formData
      .getAll("photo")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);
    if (files.length === 0) {
      redirect(
        withFlash("/manage/gallery/new", {
          error: "Escolha pelo menos uma foto para enviar.",
        }),
      );
    }
    if (files.length > MAX_PHOTOS_PER_UPLOAD) {
      redirect(
        withFlash("/manage/gallery/new", {
          error: `Pode enviar no máximo ${MAX_PHOTOS_PER_UPLOAD} fotos de cada vez.`,
        }),
      );
    }

    try {
      // Sequential on purpose: fail fast and stop, rather than uploading many
      // files in parallel and having to reconcile a partial-failure state.
      for (const file of files) {
        const url = await uploadPhoto(file);
        await createOneGalleryItem({ type, url, caption, eventId });
      }
    } catch (error) {
      if (error instanceof GraphQLRequestError) {
        redirect(withFlash("/manage/gallery/new", { error: error.message }));
      }
      throw error;
    }
  } else {
    const videoUrl = formData.get("videoUrl");
    if (typeof videoUrl !== "string" || !videoUrl) {
      redirect(
        withFlash("/manage/gallery/new", { error: "Indique o link do vídeo." }),
      );
    }

    try {
      const url = normalizeVideoUrl(videoUrl);
      await createOneGalleryItem({ type, url, caption, eventId });
    } catch (error) {
      if (error instanceof GraphQLRequestError) {
        redirect(withFlash("/manage/gallery/new", { error: error.message }));
      }
      throw error;
    }
  }

  revalidatePath("/gallery");
  if (eventId) revalidatePath(`/events/${eventId}`);
  revalidatePath("/manage/gallery");
  redirect(
    withFlash("/manage/gallery", { success: "Item adicionado à galeria com sucesso." }),
  );
}

export async function updateGalleryItemAction(id: string, formData: FormData) {
  const caption = readCaption(formData);

  await runGatedMutation(() =>
    executeGraphQL(UPDATE_GALLERY_ITEM_MUTATION, { id, input: { caption } }),
  );

  revalidatePath("/gallery");
  revalidatePath("/manage/gallery");
  redirect(
    withFlash("/manage/gallery", { success: "Legenda atualizada com sucesso." }),
  );
}

export async function deleteGalleryItemAction(id: string) {
  await runGatedMutation(() =>
    executeGraphQL(DELETE_GALLERY_ITEM_MUTATION, { id }),
  );

  revalidatePath("/gallery");
  revalidatePath("/manage/gallery");
  redirect(
    withFlash("/manage/gallery", { success: "Item eliminado com sucesso." }),
  );
}

export async function deleteGalleryItemsAction(formData: FormData) {
  const ids = formData
    .getAll("id")
    .filter((entry): entry is string => typeof entry === "string" && entry !== "");
  // The UI never submits an empty selection; nothing to report if it does.
  if (ids.length === 0) redirect("/manage/gallery");

  const data = await runGatedMutation(() =>
    executeGraphQL<{ deleteGalleryItems: number }>(DELETE_GALLERY_ITEMS_MUTATION, { ids }),
  );
  const count = data.deleteGalleryItems;

  revalidatePath("/gallery");
  revalidatePath("/manage/gallery");
  redirect(
    withFlash("/manage/gallery", {
      success:
        count === 1 ? "1 item eliminado com sucesso." : `${count} itens eliminados com sucesso.`,
    }),
  );
}
