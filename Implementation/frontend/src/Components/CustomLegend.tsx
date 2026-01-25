/* eslint-disable  @typescript-eslint/no-explicit-any */

const legendColors = ["#f0de7aff", "#a59436ff", "#504509ff"];

const CustomLegend = ({ payload, dataKeys }: any) => {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {dataKeys.map((key: any, index: number) => {
        const entry = payload.find((p: any) => p.value === key);
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
                backgroundColor: legendColors[index],
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
