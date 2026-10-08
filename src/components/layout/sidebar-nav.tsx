"use client";

import { usePathname } from "next/navigation";
import { NavList } from "./nav-list";

// The only reason this is a Client Component: highlighting the active link
// needs the current URL, and usePathname() only works on the client.
export function SidebarNav() {
  return <NavList pathname={usePathname()} />;
}
