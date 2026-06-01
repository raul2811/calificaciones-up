import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";

const RouteLiveBackground = lazy(() =>
  import("@/components/shared/RouteLiveBackground").then((module) => ({ default: module.RouteLiveBackground })),
);

export function RootLayout() {
  return (
    <>
      <Suspense fallback={null}>
        <RouteLiveBackground />
      </Suspense>
      <div className="relative z-10 min-h-dvh">
        <Outlet />
      </div>
    </>
  );
}
