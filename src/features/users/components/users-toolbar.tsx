"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PAGE_SIZES, SEARCH_MAX_LENGTH, type UsersQuery } from "../schemas";
import { USER_STATUSES, type UserStatus } from "../types";
import { buildUsersHref } from "../users-url";

const SEARCH_DEBOUNCE_MS = 300;

// Client Component: typing and <select> changes need event handlers.
// It receives the query already parsed and validated by the server page, so it
// never parses the URL itself; it only builds new URLs from it.
export function UsersToolbar({ query }: { query: UsersQuery }) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 p-4">
      <SearchInput query={query} />

      <Select
        aria-label="Filter by status"
        value={query.status ?? ""}
        // push (not replace): a filter is a deliberate step, so Back should undo it.
        onChange={(event) =>
          router.push(buildUsersHref(query, { status: (event.target.value || undefined) as UserStatus | undefined }))
        }
      >
        <option value="">All statuses</option>
        {USER_STATUSES.map((status) => (
          <option key={status} value={status} className="capitalize">
            {status}
          </option>
        ))}
      </Select>

      <label className="ml-auto flex items-center gap-2 text-sm text-zinc-500">
        Rows per page
        <Select
          value={query.limit}
          onChange={(event) =>
            router.push(buildUsersHref(query, { limit: Number(event.target.value) as UsersQuery["limit"] }))
          }
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
}

function SearchInput({ query }: { query: UsersQuery }) {
  const router = useRouter();
  // What's in the input right now (updates on every keystroke).
  const [value, setValue] = useState(query.search);
  // The last search this input put into the URL.
  const [sentSearch, setSentSearch] = useState(query.search);
  // The last URL search this component has seen.
  const [seenUrlSearch, setSeenUrlSearch] = useState(query.search);

  // The URL search changed. If it's not the value we sent, someone else changed it
  // ("Clear filters", the sidebar "Users" link), so show the new value in the input.
  // If it IS our value, keep the input as is: the user may have typed more meanwhile.
  // (Adjusting state during render is React's recommended way to react to a prop change.)
  if (query.search !== seenUrlSearch) {
    setSeenUrlSearch(query.search);
    if (query.search !== sentSearch) {
      setValue(query.search);
      setSentSearch(query.search);
    }
  }

  // Debounce: update the URL 300 ms after the user stops typing, not on every key.
  // Each keystroke re-runs the effect, and its cleanup cancels the previous timer.
  useEffect(() => {
    const search = value.trim();
    if (search === sentSearch) return;

    const timer = setTimeout(() => {
      setSentSearch(search);
      // replace (not push): one history entry per keystroke would make Back useless.
      router.replace(buildUsersHref(query, { search }), { scroll: false });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, sentSearch, query, router]);

  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" aria-hidden />
      <Input
        type="search"
        aria-label="Search users"
        placeholder="Search by name or email"
        value={value}
        maxLength={SEARCH_MAX_LENGTH}
        onChange={(event) => setValue(event.target.value)}
        className="pl-9"
      />
    </div>
  );
}
