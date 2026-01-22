import UploadPage from "./UploadPage";
import AnalysisPage from "./AnalysisPage";
/* eslint-disable  @typescript-eslint/no-explicit-any */

import { useState } from "react";

function MainContent() {
  const [currentPage, setCurrentPage] = useState<"upload" | "analysis">(
    "upload",
  );
  const [replayData, setReplayData] = useState<any>([]);
  const [player, setPlayer] = useState<any>({});

  return (
    <main className="main-content">
      {currentPage === "upload" ? (
        <UploadPage
          setCurrentPage={setCurrentPage}
          setReplayData={setReplayData}
          setPlayer={setPlayer}
        />
      ) : (
        <AnalysisPage replayData={replayData} player={player} />
      )}
    </main>
  );
}

export default MainContent;
