"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  executeGraphQL,
  runGatedMutation,
  GraphQLRequestError,
} from "@/lib/graphql-server";
import { withFlash } from "@/lib/flash";
import {
  CREATE_SOCIAL_LINK_MUTATION,
  DELETE_SOCIAL_LINK_MUTATION,
  MOVE_SOCIAL_LINK_MUTATION,
  UPDATE_SOCIAL_LINK_MUTATION,
} from "@/lib/queries/socialLinks";

const VALID_PLATFORMS = [
  "FACEBOOK",
  "INSTAGRAM",
  "YOUTUBE",
  "TWITTER",
  "WHATSAPP",
  "SPOTIFY",
  "OTHER",
];

function readSocialLinkInput(formData: FormData) {
  const platform = String(formData.get("platform") ?? "");
  const url = String(formData.get("url") ?? "").trim();

  if (!VALID_PLATFORMS.includes(platform)) return { error: "Plataforma inválida." };
  if (!url) return { error: "O link é obrigatório." };
  return { input: { platform, url } };
}

export async function createSocialLinkAction(formData: FormData) {
  const { input, error } = readSocialLinkInput(formData);
  if (error) redirect(withFlash("/manage/social-links", { error }));

  try {
    await runGatedMutation(() => executeGraphQL(CREATE_SOCIAL_LINK_MUTATION, { input }));
  } catch (error) {
    if (error instanceof GraphQLRequestError) {
      redirect(withFlash("/manage/social-links", { error: error.message }));
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/manage/social-links");
  redirect(
    withFlash("/manage/social-links", { success: "Link adicionado com sucesso." }),
  );
}

export async function updateSocialLinkAction(id: string, formData: FormData) {
  const editPath = `/manage/social-links/${id}/edit`;
  const { input, error } = readSocialLinkInput(formData);
  if (error) redirect(withFlash(editPath, { error }));

  try {
    await runGatedMutation(() => executeGraphQL(UPDATE_SOCIAL_LINK_MUTATION, { id, input }));
  } catch (error) {
    if (error instanceof GraphQLRequestError) {
      redirect(withFlash(editPath, { error: error.message }));
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/manage/social-links");
  redirect(
    withFlash("/manage/social-links", { success: "Link atualizado com sucesso." }),
  );
}

export async function deleteSocialLinkAction(id: string) {
  await runGatedMutation(() => executeGraphQL(DELETE_SOCIAL_LINK_MUTATION, { id }));

  revalidatePath("/");
  revalidatePath("/manage/social-links");
  redirect(
    withFlash("/manage/social-links", { success: "Link eliminado com sucesso." }),
  );
}

export async function moveSocialLinkAction(id: string, direction: "UP" | "DOWN") {
  await runGatedMutation(() =>
    executeGraphQL(MOVE_SOCIAL_LINK_MUTATION, { id, direction }),
  );

  revalidatePath("/");
  revalidatePath("/manage/social-links");
  redirect("/manage/social-links");
}
