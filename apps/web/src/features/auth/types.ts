export type ProvinciaCode =
  | "00"
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15";

export type ClaseCode = "00" | "N" | "E" | "EC" | "PE" | "AV" | "PI";

export type AuthFormValues = {
  provincia: ProvinciaCode;
  clase: ClaseCode;
  tomo: string;
  folio: string;
  password: string;
};

export type AuthRequest = AuthFormValues;

export type AuthResponse = {
  authenticated: boolean;
};

export type SessionResponse = {
  authenticated: boolean;
};
