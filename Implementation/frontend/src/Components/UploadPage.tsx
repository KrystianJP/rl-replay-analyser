import { useState } from "react";
import { set, get } from "idb-keyval";
import { Mutex } from "async-mutex";
/* eslint-disable  @typescript-eslint/no-explicit-any */

const dropdownMutex = new Mutex();

function UploadPage() {
  const [replayList, setReplayList] = useState<any[]>([]);
  const [playersDropdown, setPlayersDropdown] = useState<any[] | null>(null);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [replayCounter, setReplayCounter] = useState<number>(0);
  const [uploadCounter, setUploadCounter] = useState<number>(0);
  const [analysing, setAnalysing] = useState<boolean>(false);

  const updatePlayerDropdown = async (playersList: any[]) => {
    const release = await dropdownMutex.acquire();
    try {
      setPlayersDropdown((currentDropdown) => {
        if (currentDropdown === null) {
          return playersList;
        }
        // online_id defaults at "0", epic_id defaults at ""
        const recurringPlayers = playersList.filter((player) => {
          return currentDropdown.some((existing) => {
            if (
              player.online_id &&
              player.online_id !== "0" &&
              existing.online_id !== "0"
            ) {
              if (player.online_id === existing.online_id) return true;
            }

            if (
              player.epic_id &&
              player.epic_id !== "" &&
              existing.epic_id !== ""
            ) {
              if (player.epic_id === existing.epic_id) return true;
            }

            // no online id implies epic player, so name unique
            const playerHasNoIds =
              (!player.online_id || player.online_id === "0") &&
              !player.epic_id;
            const existingHasNoIds =
              (!existing.online_id || existing.online_id === "0") &&
              !existing.epic_id;

            // if either player has no ids, then match by name (because one is epic on old replay)
            if (playerHasNoIds || existingHasNoIds) {
              return player.name === existing.name;
            }

            return false;
          });
        });
        return recurringPlayers;
      });
    } finally {
      release();
    }
  };

  const uploadFile = async (file: File, match_guid: string) => {
    const idbReplay = await get(`replay-${match_guid}`);
    if (idbReplay) {
      console.log(`Replay ${match_guid} found in cache, skipping upload.`);
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

      setUploadCounter((prev) => prev + 1);

      if (result.status === "success") {
        const key = `replay-${result.match_guid}`;
        await set(key, result.csv); // store csv in IndexedDB
        console.log(`Stored replay data with key: ${key}`);

        // const csv = await get(key);
        // const parsed = Papa.parse(csv, { header: true });
        // console.log("Parsed CSV Data:", parsed.data);
      } else {
        setErrorList((prevErrors) => [
          ...prevErrors,
          "Error uploading " + file.name + " (try different replay)",
        ]);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorList((prevErrors) => [
        ...prevErrors,
        "Error uploading " + file.name + " (try different replay)",
      ]);
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

      uploadFile(file, data.game_id);

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
      (error) => !error.includes(replayList[index].fileName),
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
    if (selectedPlayer === "") {
      setErrorList((prevErrors) => [
        ...prevErrors,
        "Please select your player",
      ]);
      return;
    }
    // begin analysing
    setAnalysing(true);
  };

  return (
    <section className="section alt" id="upload">
      <div className="container">
        <h2>Upload Your Replays</h2>
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
          <div style={{ textAlign: "center", opacity: 0.7, marginTop: "5px" }}>
            (Click on a replay to remove it)
          </div>
          <div className="replay-list">
            <ol id="replay-names">
              {replayList.map((replay, index) => (
                <li key={index} onClick={() => deleteReplay(index)}>
                  {replay.name}
                </li>
              ))}
            </ol>
          </div>
          <div className="rank-selection">
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
          <div className="rank-selection">
            <select
              id="player"
              name="player"
              disabled={analysing}
              value={selectedPlayer}
              onChange={(e) => {
                setSelectedPlayer(e.target.value);
                clearErrors();
              }}
            >
              <option value="">-- Select Player --</option>
              {playersDropdown !== null
                ? playersDropdown.map((player, index) => (
                    <option key={index} value={player.name}>
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
          >
            Analyse Replays
          </button>
          <p hidden={!analysing}>
            Parsed {uploadCounter} / {replayCounter}
          </p>
        </div>
      </div>
    </section>
  );
}

export default UploadPage;
