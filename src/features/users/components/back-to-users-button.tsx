"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Client Component: going back in history needs router.back().
//
// Why router.back() and not <Link href="/dashboard/users">: a link opens the table
// fresh (page 1, no search). Going back returns to the exact previous URL
// (?page=3&search=john…), and Next restores that page with its scroll position.
export function BackToUsersButton() {
  const router = useRouter();

  function handleClick() {
    // Opened directly (new tab, bookmark): there's nothing to go back to inside
    // the app, so open the users list instead of leaving the site.
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard/users");
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} className="-ml-3 mb-2">
      <ArrowLeft className="size-4" aria-hidden />
      Back to users
    </Button>
  );
}
