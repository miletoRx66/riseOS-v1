import { PrivateRoute } from "../auth/PrivateRoute";
import { MainLayout } from "./MainLayout";
import { ToastProvider } from "../../context/ToastContext";

export function ProtectedLayout() {
  return (
    <PrivateRoute>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </PrivateRoute>
  );
}
