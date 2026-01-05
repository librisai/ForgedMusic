import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StyleCard from "../components/StyleCard";
import { useProjectState } from "../state/ProjectContext";

const styles = {
  page: {
    maxWidth: 980,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 600,
  },
  subtitle: {
    margin: 0,
    color: "#b0b0b5",
    lineHeight: 1.5,
  },
  section: {
    background: "#141416",
    border: "1px solid #232327",
    borderRadius: 12,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
  },
  sectionHint: {
    margin: 0,
    fontSize: 13,
    color: "#9a9aa2",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  paletteGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
  },
  paletteButton: {
    border: "1px solid #232327",
    borderRadius: 10,
    padding: 12,
    background: "#0f0f10",
    color: "#c9c9cf",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    transition: "border-color 120ms ease, background 120ms ease",
  },
  paletteButtonSelected: {
    borderColor: "#3b82f6",
    background: "#151922",
  },
  paletteName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
  },
  swatches: {
    display: "flex",
    gap: 6,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 6,
    border: "1px solid #242428",
  },
  ratioRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  ratioButton: {
    border: "1px solid #232327",
    borderRadius: 10,
    padding: "10px 14px",
    background: "#0f0f10",
    color: "#b0b0b5",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  ratioButtonSelected: {
    borderColor: "#3b82f6",
    color: "#fff",
    background: "#151922",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
  },
  nextButton: {
    padding: "12px 18px",
    borderRadius: 10,
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};

const styleOptions = [
  {
    name: "Neon Future",
    description: "Electric glow, mirrored cityscapes, sleek motion trails.",
  },
  {
    name: "Cyber Noir",
    description: "High-contrast shadows with rain-slicked textures and haze.",
  },
  {
    name: "Dream Pop",
    description: "Soft focus, pastel gradients, floating light blooms.",
  },
  {
    name: "Gritty Documentary",
    description: "Handheld realism, muted tones, raw street texture.",
  },
  {
    name: "Surreal Opera",
    description: "Grand, theatrical framing with unexpected symbolism.",
  },
];

const paletteOptions = [
  {
    name: "Chromatic Glow",
    colors: ["#0f172a", "#2563eb", "#38bdf8", "#e879f9"],
  },
  {
    name: "Analog Noir",
    colors: ["#0f0f10", "#2d2d33", "#a1a1aa", "#f4f4f5"],
  },
  {
    name: "Rose Quartz",
    colors: ["#111827", "#db2777", "#f472b6", "#f9a8d4"],
  },
  {
    name: "Sunset Tape",
    colors: ["#18181b", "#f97316", "#facc15", "#fef3c7"],
  },
];

const aspectRatios = ["16:9", "9:16", "1:1"];

export default function Style() {
  const navigate = useNavigate();
  const { selectedStyle, setSelectedStyle, setStepCompletion } = useProjectState();
  const [selectedPalette, setSelectedPalette] = useState(paletteOptions[0].name);
  const [selectedRatio, setSelectedRatio] = useState(aspectRatios[0]);

  useEffect(() => {
    if (!selectedStyle) {
      setSelectedStyle(styleOptions[0].name);
    }
  }, [selectedStyle, setSelectedStyle]);

  const handleNext = () => {
    setStepCompletion("style", true);
    navigate("/generate");
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Style</h1>
        <p style={styles.subtitle}>
          Choose the visual language that matches the track. You can refine it
          later with detailed prompts.
        </p>
      </header>

      <div style={styles.grid}>
        {styleOptions.map(option => (
          <StyleCard
            key={option.name}
            title={option.name}
            description={option.description}
            selected={(selectedStyle || styleOptions[0].name) === option.name}
            onSelect={() => setSelectedStyle(option.name)}
          />
        ))}
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Color palette</h2>
        <p style={styles.sectionHint}>
          Mock palette presets to preview the mood.
        </p>
        <div style={styles.paletteGrid}>
          {paletteOptions.map(palette => {
            const isSelected = palette.name === selectedPalette;
            return (
              <button
                key={palette.name}
                type="button"
                onClick={() => setSelectedPalette(palette.name)}
                style={{
                  ...styles.paletteButton,
                  ...(isSelected ? styles.paletteButtonSelected : {}),
                }}
              >
                <span style={styles.paletteName}>{palette.name}</span>
                <div style={styles.swatches} aria-hidden="true">
                  {palette.colors.map(color => (
                    <span
                      key={color}
                      style={{ ...styles.swatch, background: color }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Aspect ratio</h2>
        <p style={styles.sectionHint}>Choose the framing for export.</p>
        <div style={styles.ratioRow}>
          {aspectRatios.map(ratio => {
            const isSelected = ratio === selectedRatio;
            return (
              <button
                key={ratio}
                type="button"
                onClick={() => setSelectedRatio(ratio)}
                style={{
                  ...styles.ratioButton,
                  ...(isSelected ? styles.ratioButtonSelected : {}),
                }}
              >
                {ratio}
              </button>
            );
          })}
        </div>
      </section>

      <div style={styles.footer}>
        <button type="button" style={styles.nextButton} onClick={handleNext}>
          Next: Generate
        </button>
      </div>
    </div>
  );
}
