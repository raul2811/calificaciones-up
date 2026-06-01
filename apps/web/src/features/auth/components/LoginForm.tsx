"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Anchor,
  Alert,
  Button,
  Divider,
  Fieldset,
  Group,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import {
  AUTH_FIELD_NAMES,
  CLASE_OPTIONS,
  FOLIO_MAX_LENGTH,
  NUMERIC_ONLY_REGEX,
  PROVINCIA_OPTIONS,
  TOMO_MAX_LENGTH,
} from "@/features/auth/constants";
import { login } from "@/features/auth/api";
import type { AuthRequest, ClaseCode, ProvinciaCode } from "@/features/auth/types";
import { ApiClientError } from "@/lib/api/client";
import { getEnv } from "@/lib/env";
import styles from "@/features/auth/components/LoginForm.module.css";

type FormState = {
  provincia: ProvinciaCode;
  clase: ClaseCode;
  tomo: string;
  folio: string;
  password: string;
};

const INITIAL_FORM: FormState = {
  provincia: PROVINCIA_OPTIONS[0],
  clase: CLASE_OPTIONS[0],
  tomo: "",
  folio: "",
  password: "",
};

function validateForm(values: FormState): string | null {
  if (!PROVINCIA_OPTIONS.includes(values.provincia)) {
    return "Provincia inválida.";
  }

  if (!CLASE_OPTIONS.includes(values.clase)) {
    return "Clase inválida.";
  }

  if (!values.tomo || !NUMERIC_ONLY_REGEX.test(values.tomo) || values.tomo.length > TOMO_MAX_LENGTH) {
    return `Tomo debe ser numérico y tener máximo ${TOMO_MAX_LENGTH} dígitos.`;
  }

  if (!values.folio || !NUMERIC_ONLY_REGEX.test(values.folio) || values.folio.length > FOLIO_MAX_LENGTH) {
    return `Folio debe ser numérico y tener máximo ${FOLIO_MAX_LENGTH} dígitos.`;
  }

  if (!values.password.trim()) {
    return "Password es requerido.";
  }

  return null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.code === "HTTP_ERROR" && typeof error.details === "object" && error.details !== null) {
      const details = error.details as { error?: string; message?: string };
      if (typeof details.error === "string" && details.error.trim()) {
        return details.error;
      }
      if (typeof details.message === "string" && details.message.trim()) {
        return details.message;
      }
    }

    return "No fue posible iniciar sesión.";
  }

  return "Error inesperado. Intenta nuevamente.";
}

export function LoginForm() {
  const router = useRouter();
  const env = getEnv();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => !isLoading, [isLoading]);

  const provinciaData = PROVINCIA_OPTIONS.map((option) => ({ value: option, label: option }));
  const claseData = CLASE_OPTIONS.map((option) => ({ value: option, label: option }));

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload: AuthRequest = {
      provincia: form.provincia,
      clase: form.clase,
      tomo: form.tomo,
      folio: form.folio,
      password: form.password,
    };

    setIsLoading(true);

    try {
      const result = await login(payload);
      if (result.authenticated) {
        try {
          window.sessionStorage.setItem("up-optimistic-session", "1");
        } catch {
          // ignore storage failures
        }
        router.replace("/dashboard");
        return;
      }
      setError("Credenciales inválidas.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setError(null);
  }

  function handleTomoChange(value: string) {
    setForm((prev) => ({ ...prev, tomo: value.trim() }));
  }

  function handleFolioChange(value: string) {
    setForm((prev) => ({ ...prev, folio: value.trim() }));
  }

  function handlePasswordChange(value: string) {
    setForm((prev) => ({ ...prev, password: value }));
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className="landing-brand">
            <span className="landing-brand-mark">UP</span>
            <span>{env.appName}</span>
          </Link>
          <Text size="sm" c="dimmed">
            Acceso para estudiantes
          </Text>
        </div>
      </header>

      <section className={styles.content}>
        <article className={styles.asidePanel}>
          <Text className="section-kicker">Acceso institucional</Text>
          <Title order={1} mt="sm" className="text-primary">
            Consulta tu expediente académico con una interfaz más clara
          </Title>
          <Text mt="md" size="md" c="dimmed">
            La plataforma organiza dashboard, plan, analytics, pendientes, recovery, profesores y morosidad en un flujo de consulta más legible para el estudiante.
          </Text>

          <div className={styles.heroGrid}>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Plan y avance", "Lectura rápida del historial, créditos y progreso."],
                ["Pendientes", "Bloqueos y materias por resolver con prioridad visual."],
                ["Analytics", "Distribuciones útiles derivadas del expediente real."],
                ["Morosidad", "Estado financiero dentro del mismo flujo de consulta."],
              ].map(([title, description]) => (
                <section key={title} className={`surface-elevated ${styles.heroCard}`}>
                  <Title order={3} size="h5" className="text-primary">
                    {title}
                  </Title>
                  <Text mt="xs" size="sm" c="dimmed">
                    {description}
                  </Text>
                </section>
              ))}
            </div>
          </div>
        </article>

        <article className={`surface-hero ${styles.formPanel}`}>
          <Stack gap="md">
            <div>
              <Text className="section-kicker">Iniciar sesión</Text>
              <Title order={2} mt="xs" className="text-primary">
                {env.appName}
              </Title>
              <Text mt="xs" size="sm" c="dimmed">
                Usa tus credenciales actuales para abrir el expediente académico.
              </Text>
            </div>

            <Divider className={styles.mantineDivider} />

            <form className={styles.formSection} onSubmit={handleSubmit}>
              <Stack gap="md">
                <Fieldset legend="Cédula" classNames={{ root: styles.fieldSet, legend: styles.fieldSetLegend }}>
                  <div className={styles.cedulaRow}>
                    <div className={`${styles.cedulaCol} ${styles.mantineInput}`}>
                      <Select
                        aria-label="Provincia"
                        data={provinciaData}
                        name={AUTH_FIELD_NAMES.provincia}
                        value={form.provincia}
                        onChange={(value) => setForm((prev) => ({ ...prev, provincia: (value ?? PROVINCIA_OPTIONS[0]) as ProvinciaCode }))}
                        disabled={isLoading}
                        allowDeselect={false}
                        size="md"
                        comboboxProps={{ withinPortal: false }}
                        classNames={{
                          root: styles.mantineFieldRoot,
                          input: styles.mantineControl,
                          dropdown: styles.mantineDropdown,
                          option: styles.mantineOption,
                        }}
                      />
                      <Text className={styles.controlLabel}>Provincia</Text>
                    </div>

                    <div className={`${styles.cedulaCol} ${styles.mantineInput}`}>
                      <Select
                        aria-label="Clase"
                        data={claseData}
                        name={AUTH_FIELD_NAMES.clase}
                        value={form.clase}
                        onChange={(value) => setForm((prev) => ({ ...prev, clase: (value ?? CLASE_OPTIONS[0]) as ClaseCode }))}
                        disabled={isLoading}
                        allowDeselect={false}
                        size="md"
                        comboboxProps={{ withinPortal: false }}
                        classNames={{
                          root: styles.mantineFieldRoot,
                          input: styles.mantineControl,
                          dropdown: styles.mantineDropdown,
                          option: styles.mantineOption,
                        }}
                      />
                      <Text className={styles.controlLabel}>Clase</Text>
                    </div>

                    <div className={`${styles.cedulaCol} ${styles.mantineInput}`}>
                      <TextInput
                        aria-label="Tomo"
                        name={AUTH_FIELD_NAMES.tomo}
                        inputMode="numeric"
                        maxLength={TOMO_MAX_LENGTH}
                        value={form.tomo}
                        onChange={(event) => handleTomoChange(event.target.value)}
                        disabled={isLoading}
                        placeholder="Tomo"
                        size="md"
                        classNames={{
                          root: styles.mantineFieldRoot,
                          input: styles.mantineControl,
                        }}
                      />
                      <Text className={styles.controlLabel}>Tomo</Text>
                    </div>

                    <div className={`${styles.cedulaCol} ${styles.mantineInput}`}>
                      <TextInput
                        aria-label="Folio"
                        name={AUTH_FIELD_NAMES.folio}
                        inputMode="numeric"
                        maxLength={FOLIO_MAX_LENGTH}
                        value={form.folio}
                        onChange={(event) => handleFolioChange(event.target.value)}
                        disabled={isLoading}
                        placeholder="Folio"
                        size="md"
                        classNames={{
                          root: styles.mantineFieldRoot,
                          input: styles.mantineControl,
                        }}
                      />
                      <Text className={styles.controlLabel}>Folio</Text>
                    </div>
                  </div>
                </Fieldset>

                <div className={styles.mantineInput}>
                  <Text fw={500} size="sm" mb={8} className="text-primary">
                    Contraseña
                  </Text>
                  <PasswordInput
                    name={AUTH_FIELD_NAMES.password}
                    value={form.password}
                    onChange={(event) => handlePasswordChange(event.target.value)}
                    disabled={isLoading}
                    placeholder="Ingresa tu contraseña"
                    size="md"
                    classNames={{
                      root: styles.mantineFieldRoot,
                      input: styles.mantineControl,
                      section: styles.mantineSection,
                    }}
                  />
                </div>

                {error ? (
                  <Alert className={`${styles.errorBox} ${styles.mantineAlert}`} role="alert" aria-live="assertive">
                    {error}
                  </Alert>
                ) : null}

                <Group grow>
                  <Button type="submit" loading={isLoading} disabled={!canSubmit} size="md" radius="md" className={styles.mantineButtonPrimary}>
                    {isLoading ? "Verificando credenciales institucionales..." : "Entrar al portal"}
                  </Button>
                  <Button type="button" variant="default" onClick={handleReset} disabled={isLoading} size="md" radius="md" className={styles.mantineButtonSecondary}>
                    Limpiar
                  </Button>
                </Group>

                <Anchor component={Link} href="/" ta="center" size="sm" className={styles.mantineAnchor}>
                  Volver al inicio
                </Anchor>

                <Group className={styles.auxLinks}>
                  <Anchor
                    component="button"
                    type="button"
                    size="sm"
                    c="dimmed"
                    className={styles.mantineAnchor}
                    onClick={(event) => event.preventDefault()}
                  >
                    ¿Olvidaste tu contraseña?
                  </Anchor>
                  <Text size="sm" className={styles.secondaryText}>
                    |
                  </Text>
                  <Anchor
                    component="button"
                    type="button"
                    size="sm"
                    c="dimmed"
                    className={styles.mantineAnchor}
                    onClick={(event) => event.preventDefault()}
                  >
                    Regístrate
                  </Anchor>
                </Group>
              </Stack>
            </form>
          </Stack>
        </article>
      </section>
    </main>
  );
}
