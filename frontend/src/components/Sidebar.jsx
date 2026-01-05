import { NavLink, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useProjectState } from "../state/ProjectContext";

const styles = {
  wrapper: {
    width: 240,
    background: "#141416",
    padding: "20px 16px",
    borderRight: "1px solid #1f1f22",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  brand: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 650,
    letterSpacing: 0.2,
    margin: "4px 0 12px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 8,
  },
  linkBase: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    color: "#b0b0b5",
    background: "transparent",
    border: "1px solid transparent",
    outline: "none",
    transition: "background 120ms ease, border-color 120ms ease, color 120ms ease, box-shadow 120ms ease",
  },
  linkActive: {
    color: "#fff",
    background: "#1a1a1d",
    borderColor: "#2b2b30",
    boxShadow: "inset 3px 0 0 #3b82f6",
  },
  linkLocked: {
    color: "#6e6e75",
    cursor: "not-allowed",
    opacity: 0.65,
  },
  linkFocus: {
    boxShadow: "0 0 0 2px rgba(59,130,246,0.35), inset 3px 0 0 #3b82f6",
    borderColor: "#2b2b30",
  },
  stepIndex: {
    width: 22,
    height: 22,
    borderRadius: 999,
    background: "#1f1f22",
    color: "#9d9da3",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepIndexActive: {
    background: "#3b82f6",
    color: "#fff",
  },
  stepIndexLocked: {
    background: "#1b1b1e",
    color: "#6e6e75",
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: 520,
    letterSpacing: 0.2,
    lineHeight: 1.2,
  },
  lockHint: {
    marginLeft: "auto",
    fontSize: 12,
    color: "#7a7a82",
    opacity: 0.9,
  },
  footerHint: {
    marginTop: "auto",
    fontSize: 12,
    color: "#7a7a82",
  },
};

export default function Sidebar() {
  const location = useLocation();
  const { steps, canAccessStep } = useProjectState();
  const [focusedStepId, setFocusedStepId] = useState(null);

  const stepMeta = useMemo(() => {
    return steps.map((step, index) => ({
      ...step,
      index: index + 1,
      locked: !canAccessStep(step.id),
    }));
  }, [steps, canAccessStep]);

  return (
    <nav aria-label="ForgedMusic workflow" style={styles.wrapper}>
      <div style={styles.brand}>ForgedMusic</div>

      <ul style={styles.list}>
        {stepMeta.map(step => {
          const isCurrentPath =
            location.pathname === step.path ||
            (step.path !== "/" && location.pathname.startsWith(step.path + "/"));

          return (
            <li key={step.path}>
              <NavLink
                to={step.locked ? location.pathname : step.path}
                tabIndex={step.locked ? -1 : 0}
                aria-disabled={step.locked ? "true" : undefined}
                aria-current={isCurrentPath ? "page" : undefined}
                onClick={event => {
                  if (step.locked) event.preventDefault();
                }}
                onFocus={() => {
                  if (!step.locked) setFocusedStepId(step.id);
                }}
                onBlur={() => {
                  if (!step.locked) setFocusedStepId(null);
                }}
                style={({ isActive }) => {
                  const active = isActive || isCurrentPath;
                  const focused = focusedStepId === step.id;

                  return {
                    ...styles.linkBase,
                    ...(active ? styles.linkActive : {}),
                    ...(focused ? styles.linkFocus : {}),
                    ...(step.locked ? styles.linkLocked : {}),
                  };
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    ...styles.stepIndex,
                    ...(step.locked ? styles.stepIndexLocked : {}),
                    ...(isCurrentPath ? styles.stepIndexActive : {}),
                  }}
                >
                  {step.index}
                </span>

                <span style={styles.stepLabel}>{step.label}</span>

                {step.locked ? <span style={styles.lockHint}>Locked</span> : null}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div style={styles.footerHint}>Complete steps to unlock the next stage.</div>
    </nav>
  );
}
