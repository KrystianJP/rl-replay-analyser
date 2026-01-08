import { useState } from "react";

function UploadPage() {
  const [replayList, setReplayList] = useState<string[]>([]);

  const uploadFile = async (file: File) => {
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

      const data = await response.json();
      console.log("File uploaded successfully:", data.name);
    } catch (error) {
      console.error("Error uploading file:", error);
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
      setReplayList((prevList) => [...prevList, data.name]);
    } catch (error) {
      console.error("Error fetching header:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const files = Array.from(fileList);
    files.forEach((file) => {
      getHeader(file);
      uploadFile(file);
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
          <label htmlFor="file-upload" className="file-upload">
            Choose replays to upload
            <span className="material-icons">add</span>
          </label>
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={handleFileChange}
          />
          <div style={{ textAlign: "center", opacity: 0.7, marginTop: "5px" }}>
            (Click on a replay to remove it)
          </div>
          <div className="replay-list">
            <ol id="replay-names">
              {replayList.map((replay, index) => (
                <li key={index}>{replay}</li>
              ))}
            </ol>
          </div>
          <div className="rank-selection">
            <select id="rank" name="rank">
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
          <button id="analyse-button">Analyse Replays</button>

          <div className="error-message hidden">
            Invalid file type. Please upload .replay files only.
          </div>
        </div>
      </div>
    </section>
  );
}

export default UploadPage;
