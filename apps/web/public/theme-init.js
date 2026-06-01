try {
  const savedTheme = window.localStorage.getItem("up-theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("theme-dark");
  } else {
    document.documentElement.classList.remove("theme-dark");
  }
} catch (_error) {}
