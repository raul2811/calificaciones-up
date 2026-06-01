import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";

import { AuthenticatedLayout } from "@/routes/AuthenticatedLayout";
import { RootLayout } from "@/routes/RootLayout";

const AnalyticsPage = lazy(() => import("@/features/student/pages/AnalyticsPage").then((module) => ({ default: module.AnalyticsPage })));
const DashboardOverviewPage = lazy(() => import("@/features/student/pages/DashboardOverviewPage").then((module) => ({ default: module.DashboardOverviewPage })));
const MorosidadPage = lazy(() => import("@/features/student/pages/MorosidadPage").then((module) => ({ default: module.MorosidadPage })));
const PendientesPage = lazy(() => import("@/features/student/pages/PendientesPage").then((module) => ({ default: module.PendientesPage })));
const PerfilPage = lazy(() => import("@/features/student/pages/PerfilPage").then((module) => ({ default: module.PerfilPage })));
const PlanPage = lazy(() => import("@/features/student/pages/PlanPage").then((module) => ({ default: module.PlanPage })));
const ProfesoresPage = lazy(() => import("@/features/student/pages/ProfesoresPage").then((module) => ({ default: module.ProfesoresPage })));
const RecoveryPage = lazy(() => import("@/features/student/pages/RecoveryPage").then((module) => ({ default: module.RecoveryPage })));
const HomePage = lazy(() => import("@/pages/home/HomePage").then((module) => ({ default: module.HomePage })));
const LoginPage = lazy(() => import("@/pages/login/LoginPage").then((module) => ({ default: module.LoginPage })));
const NotFoundPage = lazy(() => import("@/pages/system/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));

function routeElement(element: ReactNode) {
  return <Suspense fallback={null}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: routeElement(<HomePage />),
      },
      {
        path: "login",
        element: routeElement(<LoginPage />),
      },
      {
        element: <AuthenticatedLayout />,
        children: [
          { path: "dashboard", element: routeElement(<DashboardOverviewPage />) },
          { path: "plan", element: routeElement(<PlanPage />) },
          { path: "pendientes", element: routeElement(<PendientesPage />) },
          { path: "analytics", element: routeElement(<AnalyticsPage />) },
          { path: "recovery", element: routeElement(<RecoveryPage />) },
          { path: "profesores", element: routeElement(<ProfesoresPage />) },
          { path: "morosidad", element: routeElement(<MorosidadPage />) },
          { path: "perfil", element: routeElement(<PerfilPage />) },
        ],
      },
      {
        path: "*",
        element: routeElement(<NotFoundPage />),
      },
    ],
  },
]);
