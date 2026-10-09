/**
 * Escapes LIKE wildcards so user input is matched literally.
 *
 * In SQL LIKE, "%" means "any text" and "_" means "any character". Without
 * escaping, searching for "%" would match every row. The query must declare the
 * escape character: `column LIKE ? ESCAPE '\'`.
 *
 * (Bound parameters already protect against SQL injection; this is about the
 * meaning of the characters *inside* a LIKE pattern, which parameters don't change.)
 */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}
