import { useEffect, useState } from "react";
import { MantineProvider } from "@mantine/core";

import { LoginForm } from "@/features/auth/components/LoginForm";
import "@mantine/core/styles.css";

type ColorScheme = "light" | "dark";

function getColorScheme(): ColorScheme {
  return document.documentElement.classList.contains("theme-dark") ? "dark" : "light";
}

export function LoginPage() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(getColorScheme);

  useEffect(() => {
    const root = document.documentElement;
    const syncColorScheme = () => setColorScheme(getColorScheme());
    const observer = new MutationObserver(syncColorScheme);

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("storage", syncColorScheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", syncColorScheme);
    };
  }, []);

  return (
    <MantineProvider forceColorScheme={colorScheme}>
      <LoginForm />
    </MantineProvider>
  );
}
