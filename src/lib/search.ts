/** French and English searches match accents, case and extra spaces consistently. */
export function searchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("fr")
    .trim()
    .replace(/\s+/g, " ");
}
