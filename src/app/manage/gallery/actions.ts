"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import {
  executeGraphQL,
  runGatedMutation,
  GraphQLRequestError,
} from "@/lib/graphql-server";
import { withFlash } from "@/lib/flash";
import { uploadPhoto, deletePhoto } from "@/lib/supabase-storage";
import { normalizeVideoUrl } from "@/lib/video";
import { MAX_PHOTOS_PER_UPLOAD } from "@/lib/config";
import {
  CREATE_GALLERY_ITEM_MUTATION,
  GALLERY_ITEM_QUERY,
  UPDATE_GALLERY_ITEM_MUTATION,
  DELETE_GALLERY_ITEM_MUTATION,
  DELETE_GALLERY_ITEMS_MUTATION,
} from "@/lib/queries/gallery";

function readEventId(formData: FormData) {
  const eventIdRaw = formData.get("eventId");
  return typeof eventIdRaw === "string" && eventIdRaw ? eventIdRaw : null;
}

async function createOneGalleryItem(input: {
  type: "PHOTO" | "VIDEO";
  url: string;
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
  const eventId = readEventId(formData);

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
        await createOneGalleryItem({ type, url, eventId });
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
      await createOneGalleryItem({ type, url, eventId });
    } catch (error) {
      if (error instanceof GraphQLRequestError) {
        redirect(withFlash("/manage/gallery/new", { error: error.message }));
      }
      throw error;
    }
  }

  if (eventId) revalidatePath(`/events/${eventId}`);
  revalidatePath("/manage/gallery");
  redirect(
    withFlash("/manage/gallery", { success: "Item adicionado à galeria com sucesso." }),
  );
}

export async function updateGalleryItemAction(id: string, formData: FormData) {
  const editPath = `/manage/gallery/${id}/edit`;
  const { galleryItem: item } = await executeGraphQL<{
    galleryItem: { type: "PHOTO" | "VIDEO"; event: { id: string } | null } | null;
  }>(GALLERY_ITEM_QUERY, { id });
  if (!item) redirect("/manage/gallery");

  const eventId = readEventId(formData);
  const input: { eventId: string | null; url?: string } = { eventId };

  // The item's type comes from the DB, not the form: photos may get a new
  // file, videos a new link. Leaving either empty keeps the current one.
  let newPhotoUrl: string | undefined;
  try {
    if (item.type === "PHOTO") {
      const file = formData.get("photo");
      if (file instanceof File && file.size > 0) {
        newPhotoUrl = await uploadPhoto(file);
        input.url = newPhotoUrl;
      }
    } else {
      const videoUrl = formData.get("videoUrl");
      if (typeof videoUrl === "string" && videoUrl.trim()) {
        input.url = normalizeVideoUrl(videoUrl.trim());
      }
    }
    // The resolver deletes the replaced photo's old file on success.
    await runGatedMutation(() => executeGraphQL(UPDATE_GALLERY_ITEM_MUTATION, { id, input }));
  } catch (error) {
    // Let Next.js's own redirect (e.g. to /login on an expired session) through.
    unstable_rethrow(error);
    if (newPhotoUrl) await deletePhoto(newPhotoUrl).catch(() => {});
    // GraphQL errors and uploadPhoto/normalizeVideoUrl's plain Errors all
    // carry a Portuguese message meant for the form.
    if (error instanceof Error) {
      redirect(withFlash(editPath, { error: error.message }));
    }
    throw error;
  }

  revalidatePath("/manage/gallery");
  revalidatePath("/");
  if (item.event) revalidatePath(`/events/${item.event.id}`);
  if (eventId) revalidatePath(`/events/${eventId}`);
  redirect(withFlash("/manage/gallery", { success: "Item atualizado com sucesso." }));
}

export async function deleteGalleryItemAction(id: string) {
  await runGatedMutation(() =>
    executeGraphQL(DELETE_GALLERY_ITEM_MUTATION, { id }),
  );

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

  revalidatePath("/manage/gallery");
  redirect(
    withFlash("/manage/gallery", {
      success:
        count === 1 ? "1 item eliminado com sucesso." : `${count} itens eliminados com sucesso.`,
    }),
  );
}
