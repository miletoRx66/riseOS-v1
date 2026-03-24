import { PrivateRoute } from "../auth/PrivateRoute";
import { MainLayout } from "./MainLayout";

export function ProtectedLayout() {
  return (
    <PrivateRoute>
      <MainLayout />
    </PrivateRoute>
  );
}
