import { useState } from "react";

const defaultSuggestions = [
  {
    id: "opening-pacing",
    title: "Hold the opening longer",
    note: "Stay on the hero shot for 2 seconds before the first cut to establish tone.",
  },
  {
    id: "chorus-glow",
    title: "Lift the chorus glow",
    note: "Introduce a restrained neon rim on the chorus to mirror the vocal lift.",
  },
  {
    id: "verse-motion",
    title: "Add subtle camera motion",
    note: "A slow lateral drift in verse two will add momentum without feeling busy.",
  },
];

const styles = {
  panel: {
    background: "#141416",
    border: "1px solid #232327",
    borderRadius: 14,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  titleBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: "#fff",
  },
  subtitle: {
    margin: 0,
    fontSize: 13,
    color: "#b0b0b5",
    lineHeight: 1.5,
  },
  toggle: {
    border: "1px solid #2a2a2f",
    background: "#0f0f10",
    color: "#c9c9cf",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  body: {
    display: "grid",
    gap: 12,
  },
  suggestionCard: {
    borderRadius: 12,
    border: "1px solid #232327",
    background: "#0f0f10",
    padding: 16,
    display: "grid",
    gap: 8,
  },
  suggestionTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
  },
  suggestionNote: {
    margin: 0,
    fontSize: 13,
    color: "#a6a6ad",
    lineHeight: 1.5,
  },
  applyButton: {
    justifySelf: "flex-start",
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #2a2a2f",
    background: "#141416",
    color: "#d2d2d7",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default function AICriticPanel({ suggestions = defaultSuggestions, onApply }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const bodyId = "ai-critic-body";

  const handleApply = suggestion => {
    if (onApply) {
      onApply(suggestion);
      return;
    }
    console.log("Apply suggestion:", suggestion.title);
  };

  return (
    <section style={styles.panel} aria-label="AI critic panel">
      <div style={styles.header}>
        <div style={styles.titleBlock}>
          <h2 style={styles.title}>AI Critic</h2>
          <p style={styles.subtitle}>
            Creative direction notes to elevate pacing, mood, and visual rhythm.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(previous => !previous)}
          style={styles.toggle}
          aria-expanded={!isCollapsed}
          aria-controls={bodyId}
        >
          {isCollapsed ? "Expand" : "Collapse"}
        </button>
      </div>

      {!isCollapsed && (
        <div id={bodyId} style={styles.body}>
          {suggestions.map(suggestion => (
            <div key={suggestion.id} style={styles.suggestionCard}>
              <h3 style={styles.suggestionTitle}>{suggestion.title}</h3>
              <p style={styles.suggestionNote}>{suggestion.note}</p>
              <button
                type="button"
                style={styles.applyButton}
                onClick={() => handleApply(suggestion)}
              >
                Apply suggestion
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
