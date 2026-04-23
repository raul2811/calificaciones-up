import type { ClaseCode, ProvinciaCode } from "@/features/auth/types";

export const PROVINCIA_OPTIONS: readonly ProvinciaCode[] = [
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

export const CLASE_OPTIONS: readonly ClaseCode[] = ["00", "N", "E", "EC", "PE", "AV", "PI"] as const;

export const TOMO_MAX_LENGTH = 4;
export const FOLIO_MAX_LENGTH = 6;

export const NUMERIC_ONLY_REGEX = /^\d+$/;

export const AUTH_FIELD_NAMES = {
  provincia: "provincia",
  clase: "clase",
  tomo: "tomo",
  folio: "folio",
  password: "password",
} as const;
