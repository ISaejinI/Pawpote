/** Met en forme la saisie d'une date au fil de la frappe : « 12 / 03 / 2021 ». */
export function formatDateInput(text: string) {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join(' / ');
}

/** Lit une date saisie au format « JJ / MM / AAAA ». Renvoie `null` si elle n'existe pas. */
export function parseDateInput(text: string): Date | null {
  const match = /^(\d{2}) \/ (\d{2}) \/ (\d{4})$/.exec(text.trim());
  if (!match) return null;

  const [day, month, year] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);

  // Rejette les dates impossibles (ex. 31/02), que `Date` corrige silencieusement
  const exists =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return exists ? date : null;
}

/** Âge en années révolues à la date du jour. */
export function ageInYears(birthDate: Date, today = new Date()) {
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

/**
 * Vérifie une date de naissance saisie et renvoie un message d'erreur, ou `undefined`.
 * `maxAge` borne les dates trop anciennes (fautes de frappe).
 */
export function validateBirthDate(text: string, { maxAge }: { maxAge: number }) {
  if (!text.trim()) return 'Renseigne la date de naissance.';

  const date = parseDateInput(text);
  if (!date) return 'Cette date n’existe pas (format JJ / MM / AAAA).';
  if (date > new Date()) return 'Cette date est dans le futur.';
  if (ageInYears(date) > maxAge) return 'Cette date semble trop ancienne.';

  return undefined;
}

/** « AAAA-MM-JJ » (colonne `date`) → « JJ / MM / AAAA » (champ de saisie). */
export function isoToDateInput(iso: string | null) {
  const match = iso ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso) : null;
  return match ? `${match[3]} / ${match[2]} / ${match[1]}` : '';
}

/** « JJ / MM / AAAA » → « AAAA-MM-JJ ». Renvoie `null` si la date n'existe pas. */
export function dateInputToIso(text: string) {
  const date = parseDateInput(text);
  if (!date) return null;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
