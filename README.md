# RL Replay Analyser

A web-based analytics tool that aggregates Rocket League replay statistics across multiple games to visualise playstyle tendencies and compare performance against rank averages.

**Live site:** https://rl-replay-analyser.vercel.app/

---

## ⚠️ Important Notes (Free Hosting Limitations)

- **Cold start:** The backend may take 1+ minutes to respond to the first request. Once active, it works as expected (unless left unattended for approx. 15 minutes).
- **Built-in parser:** Due to server performance constraints, the file upload parser is near unusable on the hosted version. Use the **Ballchasing URL/ID upload method** instead. The file upload works fine when running locally.

---

## How to Try It

1. Open this link to a sample replay list: https://ballchasing.com/?player-name=krysjp&playlist=11
2. Right-click any replay name (blue text) and select **Copy Link**
3. Paste the URL into the **Ballchasing URL/ID** input box on the site and click **+**
4. Once the server is active, the replay name will appear in the list below
5. Repeat for as many replays as you'd like — at least 5 is recommended for meaningful results
6. Select **Grand Champion III** as the rank, **KrysJP** as the player, and click **Analyse Replays**
