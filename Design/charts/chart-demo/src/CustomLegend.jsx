const legendOrder = ["ground", "low", "high"]; // same as bar bottom-to-top
const legendColors = {
  ground: "#f0de7aff",
  low: "#a59436ff",
  high: "#504509ff",
};

const CustomLegend = ({ payload }) => {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {legendOrder.map((key) => {
        const entry = payload.find((p) => p.value === key);
        if (!entry) return null;
        return (
          <div
            key={entry.value}
            style={{ margin: "0 10px", display: "flex", alignItems: "center" }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                backgroundColor: legendColors[key],
                display: "inline-block",
                marginRight: 5,
              }}
            />
            <span style={{ color: "white" }}>{key}</span>
          </div>
        );
      })}
    </div>
  );
};
export default CustomLegend;
