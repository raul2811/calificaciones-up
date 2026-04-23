export const PROVINCIA_VALUES = [
  "00",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
] as const;

export const CLASE_VALUES = ["00", "N", "E", "EC", "PE", "AV", "PI"] as const;

export type Provincia = (typeof PROVINCIA_VALUES)[number];
export type Clase = (typeof CLASE_VALUES)[number];

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

type Brand<T, TName extends string> = T & { readonly __brand: TName };

export type Tomo = Brand<string, "Tomo">;
export type Folio = Brand<string, "Folio">;

const NUMERIC_REGEX = /^\d+$/;
const TOMO_MAX_LENGTH = 4;
const FOLIO_MAX_LENGTH = 6;

export function createProvincia(input: string): ValidationResult<Provincia> {
  if (PROVINCIA_VALUES.includes(input as Provincia)) {
    return { ok: true, value: input as Provincia };
  }

  return { ok: false, error: "Provincia invalida." };
}

export function createClase(input: string): ValidationResult<Clase> {
  if (CLASE_VALUES.includes(input as Clase)) {
    return { ok: true, value: input as Clase };
  }

  return { ok: false, error: "Clase invalida." };
}

export function createTomo(input: string): ValidationResult<Tomo> {
  if (!input || !NUMERIC_REGEX.test(input) || input.length > TOMO_MAX_LENGTH) {
    return { ok: false, error: "Tomo debe ser numerico y tener maximo 4 caracteres." };
  }

  return { ok: true, value: input as Tomo };
}

export function createFolio(input: string): ValidationResult<Folio> {
  if (!input || !NUMERIC_REGEX.test(input) || input.length > FOLIO_MAX_LENGTH) {
    return { ok: false, error: "Folio debe ser numerico y tener maximo 6 caracteres." };
  }

  return { ok: true, value: input as Folio };
}

export class Password {
  private readonly rawValue: string;

  private constructor(value: string) {
    this.rawValue = value;
  }

  static create(input: string): ValidationResult<Password> {
    if (!input || input.trim() === "") {
      return { ok: false, error: "Password es requerido." };
    }

    return { ok: true, value: new Password(input) };
  }

  value(): string {
    return this.rawValue;
  }

  toString(): string {
    return "[REDACTED_PASSWORD]";
  }

  toJSON(): string {
    return "[REDACTED_PASSWORD]";
  }
}
