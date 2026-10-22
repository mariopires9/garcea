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
  CREATE_USER_MUTATION,
  UPDATE_USER_MUTATION,
  CHANGE_PASSWORD_MUTATION,
  DELETE_USER_MUTATION,
} from "@/lib/queries/users";

function readString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

/** Runs a gated mutation; GraphQL errors (validation/permission) go back to `errorPath`. */
async function runOrRedirect(errorPath: string, fn: () => Promise<unknown>) {
  try {
    await runGatedMutation(fn);
  } catch (error) {
    if (error instanceof GraphQLRequestError) {
      redirect(withFlash(errorPath, { error: error.message }));
    }
    throw error;
  }
}

function readNewPassword(formData: FormData, errorPath: string) {
  const newPassword = readString(formData, "newPassword");
  if (newPassword !== readString(formData, "confirmPassword")) {
    redirect(withFlash(errorPath, { error: "As palavras-passe não coincidem." }));
  }
  return newPassword;
}

export async function createUserAction(formData: FormData) {
  const errorPath = "/manage/accounts/new";
  const password = readNewPassword(formData, errorPath);
  const input = {
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    password,
  };

  await runOrRedirect(errorPath, () => executeGraphQL(CREATE_USER_MUTATION, { input }));

  revalidatePath("/manage/accounts");
  redirect(withFlash("/manage/accounts", { success: "Conta criada com sucesso." }));
}

export async function updateUserAction(id: string, formData: FormData) {
  const errorPath = `/manage/accounts/${id}/edit`;
  const input = {
    name: readString(formData, "name"),
    email: readString(formData, "email"),
  };

  await runOrRedirect(errorPath, () => executeGraphQL(UPDATE_USER_MUTATION, { id, input }));

  revalidatePath("/manage/accounts");
  redirect(withFlash("/manage/accounts", { success: "Dados da conta atualizados." }));
}

export async function changePasswordAction(id: string, formData: FormData) {
  const errorPath = `/manage/accounts/${id}/edit`;
  const newPassword = readNewPassword(formData, errorPath);
  const currentPassword = formData.get("currentPassword");

  await runOrRedirect(errorPath, () =>
    executeGraphQL(CHANGE_PASSWORD_MUTATION, {
      id,
      currentPassword: typeof currentPassword === "string" ? currentPassword : null,
      newPassword,
    }),
  );

  redirect(withFlash("/manage/accounts", { success: "Palavra-passe alterada com sucesso." }));
}

export async function deleteUserAction(id: string) {
  await runOrRedirect(`/manage/accounts/${id}/delete`, () =>
    executeGraphQL(DELETE_USER_MUTATION, { id }),
  );

  revalidatePath("/manage/accounts");
  redirect(withFlash("/manage/accounts", { success: "Conta eliminada com sucesso." }));
}
