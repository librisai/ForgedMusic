const styles = {
  bar: {
    height: 56,
    background: "#0b0b0c",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    borderBottom: "1px solid #1a1a1d",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    color: "#c9c9cf",
    fontSize: 14,
  },
  appName: {
    color: "#fff",
    fontWeight: 600,
    letterSpacing: 0.2,
  },
  separator: {
    width: 1,
    height: 18,
    background: "#2b2b30",
  },
  projectName: {
    color: "#b5b5bb",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  status: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "#b5b5bb",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "#f59e0b",
    boxShadow: "0 0 0 3px rgba(245, 158, 11, 0.18)",
  },
  button: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #2b2b30",
    background: "#141416",
    color: "#b8b8be",
    fontSize: 13,
    fontWeight: 600,
    cursor: "not-allowed",
  },
};

export default function Topbar() {
  const hasUnsavedChanges = true;

  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        <span style={styles.appName}>ForgedMusic</span>
        <span style={styles.separator} />
        <span style={styles.projectName}>Project: Untitled</span>
      </div>
      <div style={styles.right}>
        <div style={styles.status} role="status" aria-live="polite">
          {hasUnsavedChanges && <span style={styles.statusDot} aria-hidden="true" />}
          <span>{hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}</span>
        </div>
        <button type="button" style={styles.button} disabled>
          Export
        </button>
      </div>
    </div>
  );
}
