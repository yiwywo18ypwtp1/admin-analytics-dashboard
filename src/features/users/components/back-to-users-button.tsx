"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getPreviousPathname } from "@/lib/navigation";

// Client Component: going back in history needs router.back().
//
// Why router.back() and not <Link href="/dashboard/users">: a link opens the table
// fresh (page 1, no search). Going back returns to the exact previous URL
// (?page=3&search=john…), and Next restores that page with its scroll position.
export function BackToUsersButton() {
  const router = useRouter();

  function handleClick() {
    // Only go back when the previous page really is the users table. Otherwise
    // (opened directly, came from another site or another dashboard page) open
    // the table instead of sending the user somewhere unexpected.
    if (getPreviousPathname() === "/dashboard/users") {
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
