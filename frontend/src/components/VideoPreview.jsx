const styles = {
  wrapper: {
    width: "100%",
    maxWidth: 960,
    margin: "0 auto",
  },
  frame: {
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 9",
    background: "#000",
    borderRadius: 12,
    border: "1px solid #1f1f22",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#8b8b93",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  placeholder: {
    padding: 12,
    textAlign: "center",
  },
};

export default function VideoPreview({ children }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.frame}>
        {children || (
          <span style={styles.placeholder}>Preview will appear here</span>
        )}
      </div>
    </div>
  );
}
