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
  CREATE_OFFICIAL_CONTACT_MUTATION,
  DELETE_OFFICIAL_CONTACT_MUTATION,
  MOVE_OFFICIAL_CONTACT_MUTATION,
  UPDATE_OFFICIAL_CONTACT_MUTATION,
} from "@/lib/queries/officialContacts";

const VALID_TYPES = ["EMAIL", "PHONE", "FACEBOOK"];

function readOfficialContactInput(formData: FormData) {
  const type = String(formData.get("type") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();

  if (!VALID_TYPES.includes(type)) return { error: "Tipo de contacto inválido." };
  if (!value) return { error: "O valor do contacto é obrigatório." };
  return { input: { type, label: label || null, value } };
}

export async function createOfficialContactAction(formData: FormData) {
  const { input, error } = readOfficialContactInput(formData);
  if (error) redirect(withFlash("/manage/official-contacts", { error }));

  try {
    await runGatedMutation(() =>
      executeGraphQL(CREATE_OFFICIAL_CONTACT_MUTATION, { input }),
    );
  } catch (error) {
    if (error instanceof GraphQLRequestError) {
      redirect(withFlash("/manage/official-contacts", { error: error.message }));
    }
    throw error;
  }

  revalidatePath("/contacts");
  revalidatePath("/manage/official-contacts");
  redirect(
    withFlash("/manage/official-contacts", {
      success: "Contacto adicionado com sucesso.",
    }),
  );
}

export async function updateOfficialContactAction(id: string, formData: FormData) {
  const editPath = `/manage/official-contacts/${id}/edit`;
  const { input, error } = readOfficialContactInput(formData);
  if (error) redirect(withFlash(editPath, { error }));

  try {
    await runGatedMutation(() =>
      executeGraphQL(UPDATE_OFFICIAL_CONTACT_MUTATION, { id, input }),
    );
  } catch (error) {
    if (error instanceof GraphQLRequestError) {
      redirect(withFlash(editPath, { error: error.message }));
    }
    throw error;
  }

  revalidatePath("/contacts");
  revalidatePath("/manage/official-contacts");
  redirect(
    withFlash("/manage/official-contacts", {
      success: "Contacto atualizado com sucesso.",
    }),
  );
}

export async function deleteOfficialContactAction(id: string) {
  await runGatedMutation(() =>
    executeGraphQL(DELETE_OFFICIAL_CONTACT_MUTATION, { id }),
  );

  revalidatePath("/contacts");
  revalidatePath("/manage/official-contacts");
  redirect(
    withFlash("/manage/official-contacts", {
      success: "Contacto eliminado com sucesso.",
    }),
  );
}

export async function moveOfficialContactAction(id: string, direction: "UP" | "DOWN") {
  await runGatedMutation(() =>
    executeGraphQL(MOVE_OFFICIAL_CONTACT_MUTATION, { id, direction }),
  );

  revalidatePath("/contacts");
  revalidatePath("/manage/official-contacts");
  redirect("/manage/official-contacts");
}
