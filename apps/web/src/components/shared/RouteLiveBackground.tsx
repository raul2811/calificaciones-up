"use client";

import { useLocation } from "react-router-dom";

import { LiveBackground, type LiveBackgroundVariant } from "@/components/shared/LiveBackground";

function resolveVariant(pathname: string): LiveBackgroundVariant {
  if (pathname === "/") {
    return "subtle-gradient";
  }

  if (pathname === "/login") {
    return "subtle-gradient";
  }

  if (pathname === "/dashboard" || pathname === "/analytics") {
    return "grid";
  }

  if (
    pathname === "/plan" ||
    pathname === "/pendientes" ||
    pathname === "/profesores" ||
    pathname === "/morosidad" ||
    pathname === "/recovery" ||
    pathname === "/perfil"
  ) {
    return "none";
  }

  return "grid";
}

export function RouteLiveBackground() {
  const location = useLocation();
  return <LiveBackground variant={resolveVariant(location.pathname)} />;
}
