"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createUser, deleteUser, updateUser } from "./data";
import { EMAIL_TAKEN_MESSAGE, type UserInput, userInputSchema } from "./schemas";

// Server Actions are the UI's entry point for changing users. Same flow as the
// Route Handlers: validate → data.ts → map the result. Only the output differs:
// form state instead of HTTP status codes.
//
// Every action is a public POST endpoint, so the input is validated here again,
// even though the form already checks it in the browser.

type FieldErrors = Partial<Record<keyof UserInput, string[]>>;

export type UserFormState =
  | { status: "idle" }
  | { status: "success"; userId: number }
  | {
      status: "error";
      message?: string;
      fieldErrors?: FieldErrors;
      // React resets a form after its action runs. Sending the submitted values
      // back lets the form show them again instead of making the user retype.
      values: Record<string, string>;
    };

const UNEXPECTED_ERROR = "Something went wrong. Please try again.";

// Called by <form action> via useActionState: (previous state, form data) → new state.
export async function createUserAction(_prev: UserFormState, formData: FormData): Promise<UserFormState> {
  const values = formValues(formData);
  const parsed = userInputSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    const result = await createUser(parsed.data);
    if (!result.ok) return { status: "error", fieldErrors: { email: [EMAIL_TAKEN_MESSAGE] }, values };

    revalidateDashboard();
    return { status: "success", userId: result.data.id };
  } catch (error) {
    console.error(error);
    return { status: "error", message: UNEXPECTED_ERROR, values };
  }
}

// The edit page binds the id: updateUserAction.bind(null, user.id).
export async function updateUserAction(
  id: number,
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const values = formValues(formData);
  const parsed = userInputSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    const result = await updateUser(id, parsed.data);
    if (!result.ok) {
      return result.error === "EMAIL_TAKEN"
        ? { status: "error", fieldErrors: { email: [EMAIL_TAKEN_MESSAGE] }, values }
        : { status: "error", message: "This user no longer exists.", values };
    }

    revalidateDashboard();
    return { status: "success", userId: id };
  } catch (error) {
    console.error(error);
    return { status: "error", message: UNEXPECTED_ERROR, values };
  }
}

export type DeleteUserResult = { ok: true } | { ok: false; message: string };

// Never throws: it's called inside startTransition for an optimistic update, and a
// thrown error there would replace the whole page with error.tsx instead of
// rolling back one row and showing a toast.
export async function deleteUserAction(id: number): Promise<DeleteUserResult> {
  try {
    // NOT_FOUND (already deleted, e.g. in another tab) also counts as success:
    // the user is gone either way, which is what was asked for.
    await deleteUser(id);
    revalidateDashboard();
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Couldn't delete the user. Please try again." };
  }
}

// A changed user can appear on every dashboard page: the users table, the user's
// own page and the overview (KPIs, recent transactions). Revalidating the
// dashboard layout marks all of them stale, so each shows fresh data next time
// it's opened, and the current page is re-rendered in this same response.
function revalidateDashboard() {
  revalidatePath("/dashboard", "layout");
}

function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

function validationError(error: z.ZodError<UserInput>, values: Record<string, string>): UserFormState {
  return { status: "error", fieldErrors: z.flattenError(error).fieldErrors, values };
}
