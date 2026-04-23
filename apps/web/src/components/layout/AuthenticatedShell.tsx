import { AuthenticatedShellClient } from "@/components/layout/AuthenticatedShellClient";

type AuthenticatedShellProps = {
  children: React.ReactNode;
};

export function AuthenticatedShell({ children }: AuthenticatedShellProps) {
  return <AuthenticatedShellClient>{children}</AuthenticatedShellClient>;
}
