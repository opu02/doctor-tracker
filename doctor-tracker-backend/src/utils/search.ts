const SPLIT = /[\s,.;:()/\\_-]+/u;

export function tokenize(text: string): string[] {
  return text.toLowerCase().split(SPLIT).filter(Boolean);
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds the `searchTokens` array stored on each document.
 *  - texts: free text (name, specialization, hospital...) split into lower-case words
 *  - exact: values kept whole (email, phone); an email's local part is also split into words
 */
export function buildSearchTokens(
  texts: Array<string | undefined>,
  exact: Array<string | undefined> = []
): string[] {
  const out = new Set<string>();
  for (const text of texts) {
    if (text) tokenize(text).forEach((word) => out.add(word));
  }
  for (const value of exact) {
    const v = value?.trim().toLowerCase();
    if (!v) continue;
    out.add(v);
    if (v.includes("@")) tokenize(v.split("@")[0]).forEach((word) => out.add(word));
  }
  return [...out].slice(0, 40);
}

/**
 * Turns the search box text into a Mongo condition. Every typed word must be the *prefix*
 * of some token, e.g. "abdur rah" matches "Abdur Rahman". Anchored prefix regexes
 * (^term) are served by the multikey index on `searchTokens`, unlike unanchored /term/i.
 */
export function searchCondition(input?: string): Record<string, unknown> | undefined {
  const raw = (input ?? "").trim().toLowerCase();
  if (!raw) return undefined;

  const terms = (raw.includes("@") ? [raw] : tokenize(raw)).slice(0, 5);
  if (terms.length === 0) return undefined;

  const conditions = terms.map((term) => ({ searchTokens: { $regex: `^${escapeRegex(term)}` } }));
  return conditions.length === 1 ? conditions[0] : { $and: conditions };
}

/** Removes internal fields before sending a document to the client. */
export function omitInternal<T extends Record<string, unknown>>(doc: T): Omit<T, "searchTokens"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { searchTokens, ...rest } = doc;
  return rest;
}
