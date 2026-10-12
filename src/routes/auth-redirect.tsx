import { Navigate } from "react-router";

export default function AuthRedirect() {
  return <Navigate to="/admin" replace />;
}
