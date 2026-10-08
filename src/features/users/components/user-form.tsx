"use client";

import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useActionState, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonStyles } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { UserFormState } from "../actions";
import { USER_ROLES, USER_STATUSES, type User } from "../types";

type UserFormProps = {
  /** Create: createUserAction. Edit: updateUserAction bound to the user's id. */
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
  /** Present when editing: fills the form with current values. */
  user?: User;
};

// Client Component: needs form state (errors, pending), a live avatar preview,
// and a toast + navigation after a successful save.
export function UserForm({ action, user }: UserFormProps) {
  const router = useRouter();
  const isEdit = user !== undefined;
  // useActionState runs the Server Action on submit and gives back its result
  // (`state`) plus `isPending` while the request is in flight.
  const [state, formAction, isPending] = useActionState(action, { status: "idle" });

  const errors = state.status === "error" ? state.fieldErrors : undefined;
  // After a failed submit, show what the user typed; otherwise the saved values.
  const values = state.status === "error" ? state.values : undefined;
  const defaults = {
    name: values?.name ?? user?.name ?? "",
    email: values?.email ?? user?.email ?? "",
    role: values?.role ?? user?.role ?? "viewer",
    status: values?.status ?? user?.status ?? "active",
    avatarUrl: values?.avatarUrl ?? user?.avatarUrl ?? "",
  };

  // Navigation and toasts are side effects, so they run after the render that
  // received the "success" state, not during it. Depends on `isEdit` (a boolean),
  // not on the `user` object: the page re-renders after saving and passes a new
  // `user` object, which would run this effect twice (two toasts).
  useEffect(() => {
    if (state.status !== "success") return;
    toast.success(isEdit ? "User updated" : "User created");
    router.push(`/dashboard/users/${state.userId}`);
  }, [state, isEdit, router]);

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "error" && state.message && (
        <p role="alert" className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <CircleAlert className="size-4 shrink-0" aria-hidden />
          {state.message}
        </p>
      )}

      {/* The browser checks required/minLength/type="email" before submitting (instant
          feedback, no request). The Server Action validates again with zod, because
          a request can skip the browser. Unique email can only be checked on the server. */}
      <Field label="Name" error={errors?.name?.[0]}>
        {(props) => (
          <Input {...props} name="name" defaultValue={defaults.name} required minLength={2} maxLength={100} />
        )}
      </Field>

      <Field label="Email" error={errors?.email?.[0]}>
        {(props) => <Input {...props} name="email" type="email" defaultValue={defaults.email} required />}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Role" error={errors?.role?.[0]}>
          {(props) => (
            <Select {...props} name="role" defaultValue={defaults.role} className="w-full capitalize">
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Status" error={errors?.status?.[0]}>
          {(props) => (
            <Select {...props} name="status" defaultValue={defaults.status} className="w-full capitalize">
              {USER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <AvatarField defaultValue={defaults.avatarUrl} error={errors?.avatarUrl?.[0]} />

      <div className="flex justify-end gap-2 border-t border-zinc-200 pt-5">
        <Link
          href={user ? `/dashboard/users/${user.id}` : "/dashboard/users"}
          className={buttonStyles({ variant: "secondary" })}
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : isEdit ? "Save changes" : "Create user"}
        </Button>
      </div>
    </form>
  );
}

function AvatarField({ defaultValue, error }: { defaultValue: string; error?: string }) {
  // Only the preview needs state; the input itself stays uncontrolled like the others.
  const [url, setUrl] = useState(defaultValue);
  const canPreview = URL.canParse(url) && url.startsWith("https://");

  return (
    <Field label="Avatar URL" hint="Optional. An https:// link to an image." error={error}>
      {(props) => (
        <div className="flex items-center gap-3">
          <Avatar name="?" src={canPreview ? url : null} size={40} />
          <Input
            {...props}
            name="avatarUrl"
            type="url"
            placeholder="https://…"
            defaultValue={defaultValue}
            onChange={(event) => setUrl(event.target.value)}
          />
        </div>
      )}
    </Field>
  );
}

type FieldControlProps = {
  id: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
};

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  /** Render prop: receives the id and aria attributes that link the input to its label and error. */
  children: (props: FieldControlProps) => ReactNode;
};

// Label + input + error message, wired together for screen readers.
function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": message ? messageId : undefined,
      })}
      {message && (
        <p id={messageId} className={error ? "mt-1.5 text-sm text-red-600" : "mt-1.5 text-xs text-zinc-500"}>
          {message}
        </p>
      )}
    </div>
  );
}
