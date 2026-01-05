import UploadPage from "./UploadPage";
import AnalysisPage from "./AnalysisPage";

import { useState } from "react";

function MainContent() {
  const [currentPage] = useState<"upload" | "analysis">("upload");

  return (
    <main className="main-content">
      {currentPage === "upload" ? <UploadPage /> : <AnalysisPage />}
    </main>
  );
}

export default MainContent;
