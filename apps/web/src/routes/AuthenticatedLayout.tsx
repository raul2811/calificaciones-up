import { Outlet } from "react-router-dom";

import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";
import { StudentDataProvider } from "@/features/student/context/StudentDataContext";

export function AuthenticatedLayout() {
  return (
    <StudentDataProvider>
      <AuthenticatedShell>
        <Outlet />
      </AuthenticatedShell>
    </StudentDataProvider>
  );
}
