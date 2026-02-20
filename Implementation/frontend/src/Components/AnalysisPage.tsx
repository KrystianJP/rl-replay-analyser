import DataOverview from "./DataOverview";
import DataComparison from "./DataComparison";
/* eslint-disable  @typescript-eslint/no-explicit-any */

function AnalysisPage({ replayData, player, rank }: any) {
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
      <DataComparison rank={rank} />
    </div>
  );
}

export default AnalysisPage;
