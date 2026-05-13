import { Navigate } from "react-router-dom";
import { hasValidSessionToken } from "../utils/authToken";

export default function ProtectedRoute({ children }) {
  if (!hasValidSessionToken()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
