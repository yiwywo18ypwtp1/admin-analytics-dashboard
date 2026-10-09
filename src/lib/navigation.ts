// Browser-only helper (call it from event handlers or effects, not during render).

// Minimal typing for the Navigation API: TypeScript's DOM types don't include it yet.
type NavigationApi = {
  canGoBack: boolean;
  currentEntry: { index: number } | null;
  entries(): { url: string | null }[];
};

/**
 * Pathname of the previous history entry if it's a page of THIS app, otherwise null
 * (opened in a new tab, from a bookmark, or from another website).
 *
 * Why not history.length > 1: it also counts other websites, so "Back" could take
 * the user out of the app. The Navigation API only lists this site's entries.
 * Browsers without it get null, so callers fall back to a normal link.
 */
export function getPreviousPathname(): string | null {
  const navigation = (window as Window & { navigation?: NavigationApi }).navigation;
  if (!navigation?.canGoBack || !navigation.currentEntry) return null;

  const previous = navigation.entries()[navigation.currentEntry.index - 1];
  return previous?.url ? new URL(previous.url).pathname : null;
}
