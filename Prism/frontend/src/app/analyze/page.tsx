export const dynamic = "force-dynamic";

import AnalyzeClient from "./AnalyzeClient";
import RequireAuth from "../../components/RequireAuth.client";
import EditorialNav from "../../components/editorial/EditorialNav.client";

export default function AnalyzePage() {
  return (
    <RequireAuth>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--ed-page-bg)",
          color: "var(--ed-text-primary)",
          fontFamily: "var(--font-inter), Inter, sans-serif",
        }}
      >
        <EditorialNav activeCategory="analyze" />
        <AnalyzeClient />
      </div>
    </RequireAuth>
  );
}
