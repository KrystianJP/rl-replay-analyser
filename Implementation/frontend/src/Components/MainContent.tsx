import UploadPage from "./UploadPage";
import AnalysisPage from "./AnalysisPage";
/* eslint-disable  @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";

type BackendStatus = "checking" | "ready" | "offline";

function MainContent() {
  const [currentPage, setCurrentPage] = useState<"upload" | "analysis">(
    "upload",
  );
  const [replayData, setReplayData] = useState<any>([]);
  const [player, setPlayer] = useState<any>({});
  const [rank, setRank] = useState<string>("");
  const [mode, setMode] = useState<number>(3);
  const [backendStatus, setBackendStatus] =
    useState<BackendStatus>("checking");

  const checkBackend = async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/health`, {
        signal,
      });

      return response.ok;
    } catch {
      return false;
    }
  };

  const waitForBackend = async (signal?: AbortSignal) => {
    setBackendStatus("checking");

    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (signal?.aborted) return;

      const ready = await checkBackend(signal);

      if (ready) {
        setBackendStatus("ready");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    if (signal?.aborted) return;

    setBackendStatus("offline");
  };

  useEffect(() => {
    const controller = new AbortController();
    waitForBackend(controller.signal);

    return () => controller.abort();
  }, []);

  return (
    <main className="main-content">
      {currentPage === "upload" ? (
        <UploadPage
          setCurrentPage={setCurrentPage}
          setReplayData={setReplayData}
          setPlayer={setPlayer}
          setRank={setRank}
          setMode={setMode}
          backendStatus={backendStatus}
          retryBackend={() => waitForBackend()}
        />
      ) : (
        <AnalysisPage
          replayData={replayData}
          player={player}
          rank={rank}
          mode={mode}
        />
      )}
    </main>
  );
}

export default MainContent;
