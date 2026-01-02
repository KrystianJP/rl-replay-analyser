function UploadPage() {
  return (
    <section className="section alt" id="upload">
      <div className="container">
        <h2>Upload Your Replays</h2>
        <p className="note">
          Please upload replays from <u>only one game mode</u> (e.g: only 2v2)
          for accurate analysis
        </p>

        <div className="upload-area">
          <div className="upload-link">
            C:\Users\%USERNAME%\Documents\My Games\Rocket League\TAGame\Demos
          </div>
          <label htmlFor="file-upload" className="file-upload">
            Choose replays to upload
            <span className="material-icons">add</span>
          </label>
          <input type="file" id="file-upload" multiple />
          <div style={{ textAlign: "center", opacity: 0.7, marginTop: "5px" }}>
            (Click on a replay to remove it)
          </div>
          <div className="replay-list">
            <ol id="replay-names">
              <li>DFH Stadium - 2v2 - 2025-02-14</li>
              <li>Champions Field - 2v2 - 2025-02-11</li>
              <li>Mannfield (Night) - 2v2 - 2025-02-09</li>
              <li>Utopia Coliseum - 2v2 - 2025-02-07</li>
              <li>Neo Tokyo - 2v2 - 2025-02-04</li>
              <li>Forbidden Temple - 2v2 - 2025-02-01</li>
              <li>Starbase ARC - 2v2 - 2025-01-28</li>
              <li>Neo Tokyo - 2v2 - 2025-02-04</li>
              <li>Forbidden Temple - 2v2 - 2025-02-01</li>
              <li>Starbase ARC - 2v2 - 2025-01-28</li>
              <li>Starbase ARC - 2v2 - 2025-01-28</li>
              <li>Neo Tokyo - 2v2 - 2025-02-04</li>
              <li>Forbidden Temple - 2v2 - 2025-02-01</li>
              <li>Starbase ARC - 2v2 - 2025-01-28</li>
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
            ❌ Invalid file type. Please upload .replay files only.
          </div>
        </div>
      </div>
    </section>
  );
}

export default UploadPage;
