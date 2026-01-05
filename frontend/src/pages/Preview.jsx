import { useEffect } from "react";
import AICriticPanel from "../components/AICriticPanel";
import Timeline from "../components/Timeline";
import VideoPreview from "../components/VideoPreview";
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
};

export default function Preview() {
  const { markStepComplete } = useProjectState();

  useEffect(() => {
    markStepComplete("preview");
  }, [markStepComplete]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Preview</h1>
        <p style={styles.subtitle}>
          Review the generated output and navigate scenes before exporting.
        </p>
      </header>
      <VideoPreview />
      <Timeline />
      <AICriticPanel />
    </div>
  );
}
