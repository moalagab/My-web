import { Navigate, useLocation } from "react-router";

export default function StartRedirect() {
  const { pathname } = useLocation();
  return <Navigate to={pathname.startsWith("/en/") ? "/en/start" : "/start"} replace />;
}
