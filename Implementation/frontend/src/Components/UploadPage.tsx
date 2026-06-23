import { useState, useEffect } from "react";
import { set, get, clear } from "idb-keyval";
import { Mutex } from "async-mutex";
import Papa from "papaparse";
/* eslint-disable  @typescript-eslint/no-explicit-any */

const dropdownMutex = new Mutex();
const BALLCHASING_REQUEST_DELAY_MS = 600;
const DEMO_REPLAY_IDS = [
  "7aa47e1b-87ce-4eae-942e-de82331e570a",
  "b928660f-7939-408b-a778-8c8ef73e5107",
  "d2bb12ce-9256-4160-9e8b-34765eb1707c",
  "28487a18-7b11-4ad4-bc5e-7d97b22ca39a",
  "0cabd790-c743-4c29-9abd-03f831cccd61",
];
const DEMO_PLAYER_NAME = "KrysJP";
const DEMO_RANK = "grand-champion-3";

const wait = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

function UploadPage({
  setCurrentPage,
  setReplayData,
  setPlayer,
  setRank,
  setMode,
  backendStatus,
  retryBackend,
  backendUrl,
}: any) {
  const [replayList, setReplayList] = useState<any[]>([]);
  const [playersDropdown, setPlayersDropdown] = useState<any[]>([]);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  const [replayCounter, setReplayCounter] = useState<number>(0);
  const [uploadCounter, setUploadCounter] = useState<number>(0);
  const [analysing, setAnalysing] = useState<boolean>(false);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [ballchasingInput, setBallchasingInput] = useState<string>("");
  const [is3v3, setIs3v3] = useState<boolean>(false);
  const backendReady = backendStatus === "ready";
  const backendBooting = backendStatus === "checking";
  const controlsDisabled = analysing || demoLoading || !backendReady;

  const isPlayer = (p: any, player: any) => {
    if (player.id !== "0" && player.id !== "" && "id" in p) {
      return player.id === p.id;
    }
    return player.name === p.player_name;
  };

  useEffect(() => {
    if (replayCounter > 0 && uploadCounter === replayCounter && analysing) {
      // filter out all the replays without the player
      const player = playersDropdown[selectedPlayer - 1];
      setPlayer(player);
      setRank(selectedRank);
      setReplayData((replayData: any) => {
        return replayData.filter((replay: any) =>
          replay.players.some((replayPlayer: any) =>
            isPlayer(replayPlayer, player),
          ),
        );
      });
      // filter out replays not in replay list
      setReplayData((replayData: any) => {
        return replayData.filter((replay: any) =>
          replayList.some(
            (replayObject: any) => replayObject.game_id === replay.id,
          ),
        );
      });

      console.log("Changing page to analysis.");
      setCurrentPage("analysis");
    }
  }, [
    replayCounter,
    uploadCounter,
    analysing,
    playersDropdown,
    selectedPlayer,
    setReplayData,
    setCurrentPage,
    setPlayer,
    replayList,
    selectedRank,
    setRank,
  ]);

  const updatePlayerDropdown = async (playersList: any[]) => {
    const release = await dropdownMutex.acquire();
    try {
      setPlayersDropdown((currentDropdown) => {
        if (currentDropdown === null) return playersList;

        const newDropdown = [...currentDropdown];

        playersList.forEach((newPlayer) => {
          const exists = newDropdown.some((existing) =>
            isPlayer(newPlayer, existing),
          );

          if (!exists) {
            newDropdown.push(newPlayer);
          }
        });

        return newDropdown.sort((a, b) => a.name.localeCompare(b.name));
      });
    } finally {
      release();
    }
  };

  const mergePlayers = (currentPlayers: any[], playersList: any[]) => {
    const mergedPlayers = [...currentPlayers];

    playersList.forEach((newPlayer) => {
      const exists = mergedPlayers.some((existingPlayer) =>
        isPlayer(newPlayer, existingPlayer),
      );

      if (!exists) {
        mergedPlayers.push(newPlayer);
      }
    });

    return mergedPlayers.sort((a, b) => a.name.localeCompare(b.name));
  };

  const fetchBallchasingReplay = async (id: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/ballchasing/` + id,
    );

    if (!response.ok) {
      throw new Error("Network response not ok");
    }

    return response.json();
  };

  const uploadFile = async (
    file: File,
    match_guid: string,
    name: string,
    players: any[],
  ) => {
    const idbReplay = await get(`replay-${match_guid}`);
    if (idbReplay) {
      console.log(`Replay ${match_guid} found in cache, skipping upload.`);

      const parsed = Papa.parse(idbReplay, { header: true });
      console.log(parsed.data);
      setReplayData((prev: any) => [
        ...prev,
        { id: match_guid, players: players, data: parsed.data },
      ]);

      setUploadCounter((prev) => prev + 1);

      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error("Network response not ok");
      }

      const result = await response.json();

      if (result.status === "success") {
        const key = `replay-${result.match_guid}`;
        await set(key, result.csv); // store csv in IndexedDB
        console.log(`Stored replay data with key: ${key}`);

        const csv = await get(key);
        const parsed = Papa.parse(csv, { header: true });

        setReplayData((prev: any) => [
          ...prev,
          { id: result.match_guid, players: players, data: parsed.data },
        ]);
        setUploadCounter((prev) => prev + 1);
      } else {
        setErrorList((prevErrors) => [
          ...prevErrors,
          "Error uploading " + name + " (remove and try different replay)",
        ]);
        setReplayCounter((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorList((prevErrors) => [
        ...prevErrors,
        "Error uploading " + name + " (remove and try different replay)",
      ]);
      setReplayCounter((prev) => prev - 1);
    }
  };

  const getHeader = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/header`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!response.ok) {
        throw new Error("Network response not ok");
      }

      const data = await response.json();
      setReplayCounter((prev) => prev + 1);

      uploadFile(file, data.game_id, data.name, data.players);

      setReplayList((prevList) => [
        ...prevList,
        { ...data, fileName: file.name },
      ]);
      await updatePlayerDropdown(data.players);
    } catch (error) {
      console.error("Error fetching header:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!backendReady) return;

    const fileList = e.target.files;
    if (!fileList) return;

    const files = Array.from(fileList);

    // duplicate check (for some reason duplicates are ignored anyway)
    if (
      files.some((file) => {
        if (replayList.find((replay) => replay.fileName === file.name)) {
          setErrorList((prevErrors) => [
            ...prevErrors,
            "Duplicate replay: " + file.name,
          ]);
          return true;
        }
      })
    ) {
      return;
    }

    // non .replay check
    if (
      files.some((file) => {
        if (!file.name.endsWith(".replay")) {
          setErrorList((prevErrors) => [
            ...prevErrors,
            "Invalid file type (not .replay): " + file.name,
          ]);
          return true;
        }
      })
    ) {
      return;
    }

    files.forEach((file) => {
      getHeader(file);
    });
  };

  const handleCopy = () => {
    const demoPath =
      "C:\\Users\\%USERNAME%\\Documents\\My Games\\Rocket League\\TAGame";
    try {
      navigator.clipboard.writeText(demoPath);
      alert("Path copied");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const deleteReplay = (index: number) => {
    const updatedList = [...replayList];
    updatedList.splice(index, 1);
    setReplayList(updatedList);

    // remove error messages related to this replay
    const updatedErrors = errorList.filter(
      (error) => !error.includes(replayList[index].name),
    );
    setErrorList(updatedErrors);
  };

  const clearErrors = () => {
    const newErrorList = errorList.filter((error) =>
      error.startsWith("Error uploading"),
    );
    setErrorList(newErrorList);
  };

  const handleSubmit = () => {
    if (!backendReady) {
      setErrorList((prevErrors) => [
        ...prevErrors,
        "Backend is still starting. Please wait until it is ready.",
      ]);
      return;
    }

    if (replayList.length === 0) {
      setErrorList((prevErrors) => [
        ...prevErrors,
        "No replays selected for analysis",
      ]);
      return;
    }
    if (selectedRank === "") {
      setErrorList((prevErrors) => [...prevErrors, "Please select your rank"]);
      return;
    }
    if (selectedPlayer === 0) {
      setErrorList((prevErrors) => [
        ...prevErrors,
        "Please select your player",
      ]);
      return;
    }
    // begin analysing
    setAnalysing(true);
    setMode(is3v3 ? 3 : 2);
  };

  const clearCache = async () => {
    if (window.confirm("Are you sure you want to clear all cached replays?")) {
      try {
        await clear();
        alert("Cache cleared");
      } catch (e) {
        console.error("Failed to clear cache:", e);
        alert("Failed to clear cache.");
      }
    }
  };

  const handleBallchasingUpload = async () => {
    if (!backendReady) return;

    // clear ballchasing errors on new upload attempt
    setErrorList((prev) =>
      prev.filter((error) => !error.includes("ballchasing")),
    );

    // extract from potential url
    const id = ballchasingInput.split("/").pop()?.trim();
    try {
      const data = await fetchBallchasingReplay(id || "");

      const replayData = data.data;

      setReplayList((prevList) => [
        ...prevList,
        { ...data.header, fileName: id },
      ]);

      setReplayData((prev: any) => [...prev, replayData]);

      await updatePlayerDropdown(data.header.players);

      setReplayCounter((prev) => prev + 1);
      setUploadCounter((prev) => prev + 1);
      setBallchasingInput("");
    } catch (error) {
      console.error("Error fetch ballchasing replay:", error);
      setErrorList((prevErrors) => [
        ...prevErrors,
        "Error fetching ballchasing replay",
      ]);
    }
  };

  const handleDemoUpload = async () => {
    if (!backendReady) return;

    setDemoLoading(true);
    setAnalysing(false);
    setErrorList([]);
    setReplayList([]);
    setPlayersDropdown([]);
    setReplayData([]);
    setReplayCounter(0);
    setUploadCounter(0);
    setBallchasingInput("");
    setSelectedRank(DEMO_RANK);
    setSelectedPlayer(0);
    setIs3v3(false);

    const demoReplayList: any[] = [];
    const demoReplayData: any[] = [];
    let demoPlayers: any[] = [];

    try {
      for (const [index, id] of DEMO_REPLAY_IDS.entries()) {
        const data = await fetchBallchasingReplay(id);

        demoReplayList.push({ ...data.header, fileName: id });
        demoReplayData.push(data.data);
        demoPlayers = mergePlayers(demoPlayers, data.header.players);

        setReplayList([...demoReplayList]);
        setReplayData([...demoReplayData]);
        setPlayersDropdown([...demoPlayers]);
        setReplayCounter(demoReplayList.length);
        setUploadCounter(demoReplayData.length);

        if (index < DEMO_REPLAY_IDS.length - 1) {
          await wait(BALLCHASING_REQUEST_DELAY_MS);
        }
      }

      const demoPlayerIndex = demoPlayers.findIndex(
        (player) => player.name === DEMO_PLAYER_NAME,
      );

      if (demoPlayerIndex === -1) {
        setErrorList((prevErrors) => [
          ...prevErrors,
          "Demo player KrysJP was not found in these replays",
        ]);
        return;
      }

      setSelectedPlayer(demoPlayerIndex + 1);
    } catch (error) {
      console.error("Error loading demo replays:", error);
      setErrorList((prevErrors) => [
        ...prevErrors,
        "Error loading demo replays",
      ]);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <section className="section alt" id="upload">
      <div className="container">
        <h2>
          Upload Your Replays{" "}
          <span id="clear-cache" onClick={clearCache}>
            (clear cache)
          </span>
        </h2>
        <p className="note" style={{ width: "600px", margin: "0 auto" }}>
          Please upload replays from <u>a single playlist</u> (only 2v2 or 3v3)
          for accurate analysis. Note that the more replays you upload, the more
          meaningful your analysis will be.
        </p>

        {backendStatus !== "ready" ? (
          <div
            className={
              "backend-status " + (backendBooting ? "booting" : "offline")
            }
            role="status"
            aria-live="polite"
          >
            <div className="backend-status-title">
              {backendBooting
                ? "Backend is booting up"
                : "Backend is not responding"}
            </div>
            <div className="backend-status-message">
              {backendBooting
                ? "The free demo server is waking from sleep. This can take about 1 minute, so uploads are disabled until it connects."
                : "Uploads are disabled because the demo server could not be reached. If the backend opens directly, a browser extension may be blocking the request."}
            </div>
            <a
              className="backend-health-link"
              href={`${backendUrl}/api/status`}
              target="_blank"
              rel="noreferrer"
            >
              Open backend status check
            </a>
            {backendBooting ? (
              <>
                <div
                  className="backend-status-spinner"
                  aria-hidden="true"
                ></div>
                <div className="backend-status-hint">
                  If this never connects but the status check opens, disable
                  uBlock Origin for this site and refresh.
                </div>
              </>
            ) : (
              <>
                <div className="backend-status-hint">
                  Try disabling uBlock Origin for this site, then retry the
                  connection.
                </div>
                <button
                  className="backend-retry-button"
                  type="button"
                  onClick={retryBackend}
                >
                  Retry connection
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="backend-status ready" role="status">
            Backend connected. Uploads are ready. The free demo server may
            sleep again after 15 minutes of inactivity.
          </div>
        )}

        <div className="upload-area">
          <div className="upload-link" onClick={handleCopy}>
            C:\Users\%USERNAME%\Documents\My Games\Rocket
            League\TAGame\DemosEpic
          </div>
          <label
            htmlFor="file-upload"
            onClick={clearErrors}
            className={"file-upload" + (controlsDisabled ? " disabled" : "")}
          >
            {backendReady ? "Choose replays to upload" : "Upload disabled"}
            <span className="material-icons">add</span>
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".replay"
            multiple
            onChange={handleFileChange}
            disabled={controlsDisabled}
          />
          <div className="upload-option-divider">
            OR
          </div>
          <div className="ballchasing-input-container">
            <input
              type="text"
              id="ballchasing-upload"
              disabled={controlsDisabled}
              value={ballchasingInput}
              onChange={(e) => setBallchasingInput(e.target.value)}
              placeholder={
                backendReady
                  ? "Enter Ballchasing ID/URL"
                  : "Waiting for backend..."
              }
              className="ballchasing-input"
            ></input>
            <span
              className={
                "material-icons ballchasing-add" +
                (controlsDisabled ? " disabled" : "")
              }
              onClick={handleBallchasingUpload}
            >
              add
            </span>
          </div>
          <div className="upload-option-divider">OR</div>
          <button
            type="button"
            className="demo-upload-button"
            disabled={controlsDisabled}
            onClick={handleDemoUpload}
          >
            {demoLoading ? "Loading demo replays..." : "Use demo replays"}
          </button>
          <div style={{ textAlign: "center", opacity: 0.7, marginTop: "5px" }}>
            (Click on a replay to remove it)
          </div>
          <div className={"replay-list" + (analysing ? " disabled" : "")}>
            <ol id="replay-names">
              {replayList.map((replay, index) => (
                <li key={index} onClick={() => deleteReplay(index)}>
                  {replay.name}
                </li>
              ))}
            </ol>
          </div>

          <div className="rank-selection" hidden={!replayList.length}>
            <select
              id="rank"
              name="rank"
              disabled={controlsDisabled}
              value={selectedRank}
              onChange={(e) => {
                setSelectedRank(e.target.value);
                clearErrors();
              }}
            >
              <option value="">-- Choose Your Rank --</option>

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
          <div className="rank-selection" hidden={!replayList.length}>
            <select
              id="player"
              name="player"
              disabled={controlsDisabled}
              value={selectedPlayer}
              onChange={(e) => {
                setSelectedPlayer(Number(e.target.value));
                clearErrors();
              }}
            >
              <option value={0}>-- Select Player --</option>
              {playersDropdown !== null
                ? playersDropdown.map((player, index) => (
                    <option key={index} value={index + 1}>
                      {player.name}
                    </option>
                  ))
                : ""}
            </select>
          </div>
          <div className="mode-switch-container" hidden={!replayList.length}>
            <span className="mode-label">2v2</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={is3v3}
                onChange={(e) => setIs3v3(e.target.checked)}
                disabled={controlsDisabled}
              ></input>
              <span className="slider round"></span>
            </label>
            <span className="mode-label">3v3</span>
          </div>
          <div className="error-message">
            {errorList.map((error, index) => (
              <div key={index} style={{ color: "red" }}>
                {error}
              </div>
            ))}
          </div>
          <button
            id="analyse-button"
            disabled={controlsDisabled}
            onClick={handleSubmit}
            hidden={!replayList.length}
          >
            Analyse Replays
          </button>
          <div id="parse-progress" hidden={!analysing}>
            <p>
              Analysing... (
              {replayCounter
                ? Math.round((uploadCounter * 100) / replayCounter)
                : 0}
              %)
            </p>
            <progress
              value={replayCounter ? uploadCounter / replayCounter : 0}
            ></progress>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UploadPage;
