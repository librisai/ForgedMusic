import { useState } from "react";

const styles = {
  card: {
    width: "100%",
    padding: 18,
    borderRadius: 12,
    border: "1px solid #232327",
    background: "#141416",
    color: "#fff",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    transition: "border-color 120ms ease, background 120ms ease, box-shadow 120ms ease",
  },
  cardHover: {
    borderColor: "#3a3a40",
    background: "#18181b",
  },
  cardSelected: {
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.4)",
  },
  cardFocus: {
    outline: "2px solid #3b82f6",
    outlineOffset: 2,
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: 0.2,
  },
  selectedBadge: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#3b82f6",
  },
  description: {
    margin: 0,
    color: "#a6a6ad",
    lineHeight: 1.5,
    fontSize: 13,
  },
};

export default function StyleCard({ title, description, selected, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      aria-pressed={selected}
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
        ...(selected ? styles.cardSelected : {}),
        ...(isFocused ? styles.cardFocus : {}),
      }}
    >
      <div style={styles.titleRow}>
        <span style={styles.title}>{title}</span>
        {selected && <span style={styles.selectedBadge}>Selected</span>}
      </div>
      <p style={styles.description}>{description}</p>
    </button>
  );
}
