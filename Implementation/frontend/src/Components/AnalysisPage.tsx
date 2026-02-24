import DataOverview from "./DataOverview";
import PlaystyleClassification from "./PlaystyleClassification";
import DataComparison from "./DataComparison";
/* eslint-disable  @typescript-eslint/no-explicit-any */

function AnalysisPage({ replayData, player, rank }: any) {
  return (
    <div>
      <DataOverview replayData={replayData} player={player} />
      <PlaystyleClassification
        replayData={replayData}
        player={player}
        rank={rank}
      />
      <DataComparison replayData={replayData} player={player} rank={rank} />
    </div>
  );
}

export default AnalysisPage;
