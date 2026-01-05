import { Navigate, useLocation } from "react-router-dom";
import { useProjectState } from "../state/ProjectContext";

export default function RequireStep({ stepId, children }) {
  const location = useLocation();
  const { canAccessStep, lastAccessibleStep } = useProjectState();

  if (canAccessStep(stepId)) {
    return children;
  }

  const fallbackPath = lastAccessibleStep?.path || "/create";

  return <Navigate to={fallbackPath} replace state={{ from: location }} />;
}
