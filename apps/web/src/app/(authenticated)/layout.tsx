import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";
import { StudentDataProvider } from "@/features/student/context/StudentDataContext";

export default function AuthenticatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <StudentDataProvider>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </StudentDataProvider>
  );
}
