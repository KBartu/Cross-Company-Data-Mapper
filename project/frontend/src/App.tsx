// src/App.tsx
import React, { useState } from "react";
import MappingPage from "./components/MappingPage";
import ValidationPage from "./components/ValidationPage";

type Tab = "mapping" | "validation";

const App: React.FC = () => {
  const [tab, setTab] = useState<Tab>("mapping");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">
              Cross-Company Data Mapper
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
              demo UI
            </span>
          </div>
          <nav className="flex gap-2 text-sm">
            <button
              onClick={() => setTab("mapping")}
              className={
                "px-3 py-1.5 rounded-lg transition border " +
                (tab === "mapping"
                  ? "bg-sky-500 text-white border-sky-400 shadow-sm"
                  : "bg-slate-900 border-slate-700 hover:border-slate-500")
              }
            >
              Mapping
            </button>
            <button
              onClick={() => setTab("validation")}
              className={
                "px-3 py-1.5 rounded-lg transition border " +
                (tab === "validation"
                  ? "bg-sky-500 text-white border-sky-400 shadow-sm"
                  : "bg-slate-900 border-slate-700 hover:border-slate-500")
              }
            >
              Validation
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {tab === "mapping" ? <MappingPage /> : <ValidationPage />}
        </div>
      </main>
    </div>
  );
};

export default App;
