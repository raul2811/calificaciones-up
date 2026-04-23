import { describe, expect, it } from "vitest";

import {
  CLASE_VALUES,
  PROVINCIA_VALUES,
  Password,
  createClase,
  createFolio,
  createProvincia,
  createTomo,
} from "./types";

describe("auth domain", () => {
  describe("createProvincia", () => {
    it("accepts all allowed provincias", () => {
      for (const provincia of PROVINCIA_VALUES) {
        const result = createProvincia(provincia);
        expect(result.ok).toBe(true);
      }
    });

    it("rejects invalid provincia", () => {
      const result = createProvincia("16");
      expect(result).toEqual({ ok: false, error: "Provincia invalida." });
    });
  });

  describe("createClase", () => {
    it("accepts all allowed clases", () => {
      for (const clase of CLASE_VALUES) {
        const result = createClase(clase);
        expect(result.ok).toBe(true);
      }
    });

    it("rejects invalid clase", () => {
      const result = createClase("X");
      expect(result).toEqual({ ok: false, error: "Clase invalida." });
    });
  });

  describe("createTomo", () => {
    it("accepts numeric values up to 4 chars", () => {
      expect(createTomo("1").ok).toBe(true);
      expect(createTomo("9999").ok).toBe(true);
    });

    it("rejects non-numeric and too long values", () => {
      expect(createTomo("12A")).toEqual({ ok: false, error: "Tomo debe ser numerico y tener maximo 4 caracteres." });
      expect(createTomo("12345")).toEqual({
        ok: false,
        error: "Tomo debe ser numerico y tener maximo 4 caracteres.",
      });
    });
  });

  describe("createFolio", () => {
    it("accepts numeric values up to 6 chars", () => {
      expect(createFolio("1").ok).toBe(true);
      expect(createFolio("999999").ok).toBe(true);
    });

    it("rejects non-numeric and too long values", () => {
      expect(createFolio("ABC")).toEqual({ ok: false, error: "Folio debe ser numerico y tener maximo 6 caracteres." });
      expect(createFolio("1234567")).toEqual({
        ok: false,
        error: "Folio debe ser numerico y tener maximo 6 caracteres.",
      });
    });
  });

  describe("Password", () => {
    it("requires a non-empty password", () => {
      expect(Password.create("")).toEqual({ ok: false, error: "Password es requerido." });
      expect(Password.create("   ")).toEqual({ ok: false, error: "Password es requerido." });
    });

    it("redacts output to prevent accidental logging", () => {
      const result = Password.create("super-secret");
      expect(result.ok).toBe(true);

      if (!result.ok) {
        throw new Error("Expected valid password");
      }

      expect(result.value.value()).toBe("super-secret");
      expect(String(result.value)).toBe("[REDACTED_PASSWORD]");
      expect(JSON.stringify({ password: result.value })).toBe('{"password":"[REDACTED_PASSWORD]"}');
    });
  });
});
