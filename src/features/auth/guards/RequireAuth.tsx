import AuthGuard from "./AuthGuard";

type RequireAuthProps = {
  allowedRoles?: string[];
  redirectTo?: string;
};

export default function RequireAuth({ allowedRoles, redirectTo = "/login" }: RequireAuthProps) {
  return (
    <AuthGuard
      allowedRoles={allowedRoles}
      fallbackPath={redirectTo}
    />
  );
}