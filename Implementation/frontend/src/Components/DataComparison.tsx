import CustomRadarChart from "./CustomRadarChart";
/* eslint-disable  @typescript-eslint/no-explicit-any */

const RANK_CODE_TO_NAME = {
  "silver-1": "Silver I",
  "silver-2": "Silver II",
  "silver-3": "Silver III",
  "gold-1": "Gold I",
  "gold-2": "Gold II",
  "gold-3": "Gold III",
  "platinum-1": "Platinum I",
  "platinum-2": "Platinum II",
  "platinum-3": "Platinum III",
  "diamond-1": "Diamond I",
  "diamond-2": "Diamond II",
  "diamond-3": "Diamond III",
  "champion-1": "Champion I",
  "champion-2": "Champion II",
  "champion-3": "Champion III",
  "grand-champion-1": "Grand Champion I",
  "grand-champion-2": "Grand Champion II",
  "grand-champion-3": "Grand Champion III",
  "supersonic-legend": "Supersonic Legend",
};

const dataCore = [
  {
    category: "Shots /min",
    You: 82,
    You_Original: 0.78,
    RankAverage: 76,
    RankAverage_Original: 0.72,
    unit: "",
  },
  {
    category: "Goals %",
    You: 61,
    You_Original: 28.5,
    RankAverage: 64,
    RankAverage_Original: 29.8,
    unit: "%",
  },
  {
    category: "Saves /min",
    You: 38,
    You_Original: 0.32,
    RankAverage: 72,
    RankAverage_Original: 0.48,
    unit: "",
  },
  {
    category: "Assists %",
    You: 47,
    You_Original: 18.2,
    RankAverage: 69,
    RankAverage_Original: 23.4,
    unit: "%",
  },
  {
    category: "Shooting %",
    You: 58,
    You_Original: 27.1,
    RankAverage: 63,
    RankAverage_Original: 29.0,
    unit: "%",
  },
];

const dataBoost = [
  {
    category: "BPM",
    You: 88,
    You_Original: 448,
    RankAverage: 83,
    RankAverage_Original: 430,
    unit: "",
  },
  {
    category: "Wasted Usage",
    You: 74,
    You_Original: 14.1,
    RankAverage: 71,
    RankAverage_Original: 15.3,
    unit: "%",
  },
  {
    category: "Small Pads collected",
    You: 91,
    You_Original: 41,
    RankAverage: 85,
    RankAverage_Original: 37,
    unit: "",
  },
  {
    category: "Big Pads stolen /min",
    You: 79,
    You_Original: 1.4,
    RankAverage: 75,
    RankAverage_Original: 1.2,
    unit: "",
  },
  {
    category: "Large Pads collected",
    You: 67,
    You_Original: 9,
    RankAverage: 74,
    RankAverage_Original: 10,
    unit: "",
  },
  {
    category: "% No Boost",
    You: 29,
    You_Original: 11.2,
    RankAverage: 78,
    RankAverage_Original: 9.1,
    unit: "%",
  },
  {
    category: "% Low Boost",
    You: 52,
    You_Original: 24.6,
    RankAverage: 73,
    RankAverage_Original: 22.8,
    unit: "%",
  },
  {
    category: "% Full Boost",
    You: 63,
    You_Original: 22.5,
    RankAverage: 77,
    RankAverage_Original: 25.1,
    unit: "%",
  },
];

const dataMovement = [
  {
    category: "Average Speed",
    You: 93,
    You_Original: 1635,
    RankAverage: 88,
    RankAverage_Original: 1600,
    unit: "",
  },
  {
    category: "% Supersonic Speed",
    You: 86,
    You_Original: 29.4,
    RankAverage: 84,
    RankAverage_Original: 27.8,
    unit: "%",
  },
  {
    category: "% On Ground",
    You: 41, // prefers air more than avg
    You_Original: 54.2,
    RankAverage: 69,
    RankAverage_Original: 60.5,
    unit: "%",
  },
  {
    category: "% Low In Air",
    You: 77,
    You_Original: 27.5,
    RankAverage: 74,
    RankAverage_Original: 24.1,
    unit: "%",
  },
  {
    category: "% High In Air",
    You: 82,
    You_Original: 18.3,
    RankAverage: 79,
    RankAverage_Original: 15.6,
    unit: "%",
  },
  {
    category: "Demos Taken /min",
    You: 34, // gets caught sometimes
    You_Original: 0.41,
    RankAverage: 65,
    RankAverage_Original: 0.33,
    unit: "",
  },
  {
    category: "Demos Inflicted /min",
    You: 91, // very aggressive
    You_Original: 0.92,
    RankAverage: 86,
    RankAverage_Original: 0.78,
    unit: "",
  },
];

const dataPositioning = [
  {
    category: "% Most Back",
    You: 28, // rarely last man
    You_Original: 27.3,
    RankAverage: 74,
    RankAverage_Original: 32.8,
    unit: "%",
  },
  {
    category: "% Most Forward",
    You: 89, // very aggressive
    You_Original: 41.2,
    RankAverage: 81,
    RankAverage_Original: 36.5,
    unit: "%",
  },
  {
    category: "% Closest To Ball",
    You: 84,
    You_Original: 38.4,
    RankAverage: 79,
    RankAverage_Original: 34.9,
    unit: "%",
  },
  {
    category: "% Furthest From Ball",
    You: 33,
    You_Original: 26.8,
    RankAverage: 72,
    RankAverage_Original: 31.7,
    unit: "%",
  },
  {
    category: "% Behind Ball",
    You: 45,
    You_Original: 49.6,
    RankAverage: 76,
    RankAverage_Original: 53.2,
    unit: "%",
  },
  {
    category: "% Ahead Of Ball",
    You: 88,
    You_Original: 50.4,
    RankAverage: 83,
    RankAverage_Original: 46.8,
    unit: "%",
  },
  {
    category: "% Defending Third",
    You: 37,
    You_Original: 29.8,
    RankAverage: 71,
    RankAverage_Original: 33.4,
    unit: "%",
  },
  {
    category: "% Attacking Third",
    You: 90,
    You_Original: 38.6,
    RankAverage: 84,
    RankAverage_Original: 35.2,
    unit: "%",
  },
];

function DataComparison({ rank }: any) {
  return (
    <section className="section alt" id="comparison">
      <div className="container">
        <h2>
          Rank Comparison<span className="material-icons">arrow_drop_up</span>
        </h2>
        <h3>
          You vs Average{" "}
          <u>{RANK_CODE_TO_NAME[rank as keyof typeof RANK_CODE_TO_NAME]}</u>
        </h3>
        <div className="spider-charts">
          <CustomRadarChart data={dataCore} />
          <CustomRadarChart data={dataBoost} />
          <CustomRadarChart data={dataMovement} />
          <CustomRadarChart data={dataPositioning} />
        </div>
        <div className="list-section outliers-container">
          <p className="list-heading">Outliers</p>
          <ul>
            <li>
              <span style={{ color: "rgb(255,147,147)", fontWeight: "bold" }}>
                [Outlier]
              </span>{" "}
              - [Advice]
            </li>
            <li>
              <span style={{ color: "rgb(255,147,147)", fontWeight: "bold" }}>
                [Outlier]
              </span>{" "}
              - [Advice]
            </li>
            <li>
              <span style={{ color: "rgb(255,147,147)", fontWeight: "bold" }}>
                [Outlier]
              </span>{" "}
              - [Advice]
            </li>
          </ul>
        </div>
        <h3 style={{ marginTop: "5rem" }}>
          You vs Average
          <div className="rank-selection">
            <select id="rank" name="rank">
              <option value="">-- Choose A Rank --</option>
              <option value="silver-1">Silver I</option>
              <option value="silver-2">Silver II</option>
              <option value="silver-3">Silver III</option>

              <option value="gold-1">Gold I</option>
              <option value="gold-2">Gold II</option>
              <option value="gold-3">Gold III</option>

              <option value="platinum-1">Platinum I</option>
              <option value="platinum-2">Platinum II</option>
              <option value="platinum-3">Platinum III</option>

              <option value="diamond-1">Diamond I</option>
              <option value="diamond-2">Diamond II</option>
              <option value="diamond-3">Diamond III</option>

              <option value="champion-1">Champion I</option>
              <option value="champion-2">Champion II</option>
              <option value="champion-3">Champion III</option>

              <option value="grand-champion-1">Grand Champ I</option>
              <option value="grand-champion-2">Grand Champ II</option>
              <option value="grand-champion-3">Grand Champ III</option>

              <option value="supersonic-legend">Supersonic Legend</option>
            </select>
          </div>
        </h3>
        <div className="spider-charts">
          <CustomRadarChart data={dataCore} />
          <CustomRadarChart data={dataBoost} />
          <CustomRadarChart data={dataMovement} />
          <CustomRadarChart data={dataPositioning} />
        </div>
      </div>
    </section>
  );
}

export default DataComparison;
