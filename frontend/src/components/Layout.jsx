import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useProjectState } from "../state/ProjectContext";
import { STEPS } from "../state/steps";

export default function Layout() {
  const location = useLocation();
  const { setCurrentStep } = useProjectState();

  useEffect(() => {
    const stepMatch = STEPS.find(step => step.path === location.pathname);
    if (stepMatch) {
      setCurrentStep(stepMatch.id);
    }
  }, [location.pathname, setCurrentStep]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar />
        <div style={{ flex: 1, padding: 24, background: "#0f0f10", color: "#fff" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
