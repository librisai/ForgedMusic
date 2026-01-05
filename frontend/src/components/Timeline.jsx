import { useState } from "react";

const styles = {
  wrapper: {
    width: "100%",
    background: "#141416",
    border: "1px solid #232327",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#c9c9cf",
    margin: 0,
  },
  bar: {
    display: "flex",
    gap: 10,
    background: "#0f0f10",
    borderRadius: 10,
    padding: 10,
    border: "1px solid #1f1f22",
  },
  segment: {
    flex: 1,
    minWidth: 90,
    background: "#1a1a1d",
    border: "1px solid #2a2a2f",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#b0b0b5",
    fontSize: 12,
    textAlign: "center",
    cursor: "pointer",
    transition: "background 120ms ease, border-color 120ms ease, color 120ms ease",
  },
  segmentHover: {
    background: "#222228",
    borderColor: "#3b3b44",
    color: "#fff",
  },
};

const scenes = ["Scene 1", "Scene 2", "Scene 3", "Scene 4"];

export default function Timeline() {
  return (
    <div style={styles.wrapper}>
      <p style={styles.label}>Timeline</p>
      <div style={styles.bar}>
        {scenes.map(scene => (
          <TimelineSegment key={scene} label={scene} />
        ))}
      </div>
    </div>
  );
}

function TimelineSegment({ label }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={() => console.log("Selected", label)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.segment,
        ...(isHovered ? styles.segmentHover : {}),
      }}
      aria-label={`Select ${label}`}
    >
      {label}
    </button>
  );
}
