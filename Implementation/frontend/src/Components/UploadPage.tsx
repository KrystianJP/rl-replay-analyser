import { useState, useEffect } from "react";
import { set, get, clear } from "idb-keyval";
import { Mutex } from "async-mutex";
import Papa from "papaparse";
/* eslint-disable  @typescript-eslint/no-explicit-any */

const dropdownMutex = new Mutex();

function UploadPage({
  setCurrentPage,
  setReplayData,
  setPlayer,
  setRank,
}: any) {
  const [replayList, setReplayList] = useState<any[]>([]);
  const [playersDropdown, setPlayersDropdown] = useState<any[]>([]);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  const [replayCounter, setReplayCounter] = useState<number>(0);
  const [uploadCounter, setUploadCounter] = useState<number>(0);
  const [analysing, setAnalysing] = useState<boolean>(false);
  const [ballchasingInput, setBallchasingInput] = useState<string>("");

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
      const response = await fetch("http://127.0.0.1:8000/api/upload", {
        method: "POST",
        body: formData,
      });
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
      const response = await fetch("http://127.0.0.1:8000/api/header", {
        method: "POST",
        body: formData,
      });
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
    // clear ballchasing errors on new upload attempt
    setErrorList((prev) =>
      prev.filter((error) => !error.includes("ballchasing")),
    );

    // extract from potential url
    const id = ballchasingInput.split("/").pop()?.trim();
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/ballchasing/" + id,
      );

      if (!response.ok) {
        throw new Error("Network response not ok");
      }

      const data = await response.json();

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

  return (
    <section className="section alt" id="upload">
      <div className="container">
        <h2>
          Upload Your Replays{" "}
          <span id="clear-cache" onClick={clearCache}>
            (clear cache)
          </span>
        </h2>
        <p className="note">
          Please upload replays from <u>a single playlist</u> (e.g: only 2v2)
          for accurate analysis
        </p>

        <div className="upload-area">
          <div className="upload-link" onClick={handleCopy}>
            C:\Users\%USERNAME%\Documents\My Games\Rocket
            League\TAGame\DemosEpic
          </div>
          <label
            htmlFor="file-upload"
            onClick={clearErrors}
            className="file-upload"
          >
            Choose replays to upload
            <span className="material-icons">add</span>
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".replay"
            multiple
            onChange={handleFileChange}
            disabled={analysing}
          />
          <div style={{ textAlign: "center", opacity: 0.7, padding: "5px 0" }}>
            OR
          </div>
          <div className="ballchasing-input-container">
            <input
              type="text"
              id="ballchasing-upload"
              disabled={analysing}
              value={ballchasingInput}
              onChange={(e) => setBallchasingInput(e.target.value)}
              placeholder="Enter Ballchasing ID/URL"
              className="ballchasing-input"
            ></input>
            <span
              className="material-icons ballchasing-add"
              onClick={handleBallchasingUpload}
            >
              add
            </span>
          </div>
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
              disabled={analysing}
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
              disabled={analysing}
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
          <div className="error-message">
            {errorList.map((error, index) => (
              <div key={index} style={{ color: "red" }}>
                {error}
              </div>
            ))}
          </div>
          <button
            id="analyse-button"
            disabled={analysing}
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
