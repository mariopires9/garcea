"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { executeGraphQL, runGatedMutation } from "@/lib/graphql-server";
import { UPDATE_HISTORIAL_SECTION_MUTATION } from "@/lib/queries/historial";

export async function updateHistorySectionAction(formData: FormData) {
  const description = String(formData.get("description") ?? "");

  await runGatedMutation(() =>
    executeGraphQL(UPDATE_HISTORIAL_SECTION_MUTATION, { description }),
  );

  revalidatePath("/history");
  revalidatePath("/manage/history");
  redirect("/manage/history");
}
