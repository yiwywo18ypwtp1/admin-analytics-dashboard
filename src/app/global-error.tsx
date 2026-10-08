"use client"; // Error boundaries must be Client Components (React requirement).

import "./globals.css";

// Last line of defense: shown only when the ROOT layout itself crashes, which
// dashboard/error.tsx can't catch (an error boundary never wraps the layout
// it lives in). It replaces the whole document, so it renders its own
// <html>/<body> and imports the global styles itself.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center p-6 font-sans">
        {/* metadata exports aren't supported here, React's <title> works instead. */}
        <title>Something went wrong</title>
        <div className="text-center">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {error.digest ? `Error ID: ${error.digest}` : "The app failed to load. Please try again."}
          </p>
          {/* Plain markup on purpose: if the app crashed, shared components might be the cause. */}
          <button
            type="button"
            onClick={retry}
            className="mt-6 h-9 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
