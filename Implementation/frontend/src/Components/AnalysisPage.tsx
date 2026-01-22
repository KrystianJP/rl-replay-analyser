import DataOverview from "./DataOverview";
/* eslint-disable  @typescript-eslint/no-explicit-any */

function AnalysisPage({ replayData, player }: any) {
  return (
    <div>
      <DataOverview replayData={replayData} player={player} />

      <section className="section" id="playstyle">
        <div className="container">
          <h2>
            Playstyle Classification
            <span className="material-icons">arrow_drop_down</span>
          </h2>
          <p id="your-playstyle">Your Playstyle:</p>
          <div className="playstyle-result">FREESTYLER</div>
          <p className="playstyle-description">
            Freestylers are known for their flashy and acrobatic maneuvers,
            often prioritizing style over efficiency. They excel in aerial plays
            and creative shots but may sometimes neglect fundamental positioning
            and teamwork.
          </p>

          <div className="list-section">
            <p className="list-heading">Why this playstyle?</p>
            <ul>
              <li>Statistic 1</li>
              <li>Statistic 2</li>
              <li>Statistic 3</li>
            </ul>
          </div>
          <div className="list-section">
            <p className="list-heading">Improvement tips:</p>
            <ul>
              <li>Example advice - Statistic</li>
              <li>Example advice - Statistic</li>
              <li>General advice</li>
            </ul>
          </div>
          <div className="list-section">
            <p className="list-heading">Other playstyles:</p>
            <ul>
              <li>
                <span style={{ color: "#7eaef5", fontWeight: "bold" }}>
                  STRIKER
                </span>{" "}
                -<span className="playstyle-sureness">28%</span>
              </li>
              <li>
                <span style={{ color: "#f57e7e", fontWeight: "bold" }}>
                  ENFORCER
                </span>{" "}
                -<span className="playstyle-sureness">18%</span>
              </li>
              <li>[playstyle] - [model sureness]</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section alt" id="comparison">
        <div className="container">
          <h2>
            Rank Comparison<span className="material-icons">arrow_drop_up</span>
          </h2>
          <h3>You vs Average [user's rank]</h3>
          <div className="spider-charts">
            <div className="spider-chart-container">Spider Chart</div>
            <div className="spider-chart-container">Spider Chart</div>
            <div className="spider-chart-container">Spider Chart</div>
            <div className="spider-chart-container">Spider Chart</div>
          </div>
          <div className="list-section">
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
                <option value="bronze1">Bronze I</option>
                <option value="bronze2">Bronze II</option>
                <option value="bronze3">Bronze III</option>

                <option value="silver1">Silver I</option>
                <option value="silver2">Silver II</option>
                <option value="silver3">Silver III</option>

                <option value="gold1">Gold I</option>
                <option value="gold2">Gold II</option>
                <option value="gold3">Gold III</option>

                <option value="plat1">Platinum I</option>
                <option value="plat2">Platinum II</option>
                <option value="plat3">Platinum III</option>

                <option value="diamond1">Diamond I</option>
                <option value="diamond2">Diamond II</option>
                <option value="diamond3">Diamond III</option>

                <option value="champ1">Champion I</option>
                <option value="champ2">Champion II</option>
                <option value="champ3">Champion III</option>

                <option value="gc1">Grand Champ I</option>
                <option value="gc2">Grand Champ II</option>
                <option value="gc3">Grand Champ III</option>

                <option value="ssl">Supersonic Legend</option>
              </select>
            </div>
          </h3>
          <div className="spider-charts">
            <div className="spider-chart-container">Spider Chart</div>
            <div className="spider-chart-container">Spider Chart</div>
            <div className="spider-chart-container">Spider Chart</div>
            <div className="spider-chart-container">Spider Chart</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AnalysisPage;
