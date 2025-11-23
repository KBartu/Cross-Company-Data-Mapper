// src/components/MappingPage.tsx
import React, { useEffect, useState } from "react";
import {
  getMappingTemplates,
  suggestMappings,
  transformData,
} from "../api";
import type {
  MappingTemplate,
  SuggestMappingsResponse,
  TransformResponse,
} from "../api";

const pretty = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const MappingPage: React.FC = () => {
  const [sourceFormatText, setSourceFormatText] = useState("{\n  \n}");
  const [targetFormatText, setTargetFormatText] = useState("{\n  \n}");
  const [templateName, setTemplateName] = useState("");

  const [templates, setTemplates] = useState<MappingTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [suggestResult, setSuggestResult] =
    useState<SuggestMappingsResponse | null>(null);

  const [sourceDataText, setSourceDataText] = useState("{\n  \n}");
  const [extraInstructions, setExtraInstructions] = useState("");
  const [transformResult, setTransformResult] =
    useState<TransformResponse | null>(null);

  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingTransform, setLoadingTransform] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseJsonOrThrow = (text: string, label: string) => {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`${label} is not valid JSON`);
    }
  };

  const handleSuggest = async () => {
    setError(null);
    setSuggestResult(null);
    setLoadingSuggest(true);
    try {
      const sourceFormat = parseJsonOrThrow(sourceFormatText, "Source format");
      const targetFormat = parseJsonOrThrow(targetFormatText, "Target format");

      const res = await suggestMappings({
        sourceFormat,
        targetFormat,
        name: templateName || undefined,
      });

      setSuggestResult(res);
      await fetchTemplates(); // refresh list
      setSelectedTemplateId(res.template_id);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoadingSuggest(false);
    }
  };

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    setError(null);
    try {
      const res = await getMappingTemplates();
      setTemplates(res);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleTransform = async () => {
    setError(null);
    setTransformResult(null);
    setLoadingTransform(true);
    try {
      const sourceData = parseJsonOrThrow(sourceDataText, "Source data");

      const payload: any = {
        sourceData,
        extraInstructions: extraInstructions || undefined,
      };

      if (selectedTemplateId) {
        payload.template_id = selectedTemplateId;
      } else {
        payload.sourceFormat = parseJsonOrThrow(
          sourceFormatText,
          "Source format"
        );
        payload.targetFormat = parseJsonOrThrow(
          targetFormatText,
          "Target format"
        );
      }

      const res = await transformData(payload);
      setTransformResult(res);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoadingTransform(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mb-2">Mapping</h1>

      {error && (
        <div
          style={{ fontSize: 14, padding: "10px 12px" }}
          className="border border-red-500/60 bg-red-500/10 text-red-200 rounded-md"
        >
          {error}
        </div>
      )}

      {/* Suggest section */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-base tracking-wide text-slate-200">
            1. Suggest mappings with AI
          </h2>

          <label className="block text-sm text-slate-300 mb-1">
            Template name (optional)
          </label>
          <input
            className="w-full rounded-md bg-slate-950 border border-slate-700 outline-none focus:border-sky-500"
            style={{
              fontSize: 15,
              padding: "10px 12px",
            }}
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g. Customer → CRM contact"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Source format (JSON)
              </label>
              <textarea
                className="w-full font-mono rounded-md bg-slate-950 border border-slate-700 outline-none focus:border-sky-500"
                style={{
                  fontSize: 13,
                  padding: "10px 12px",
                  minHeight: 260,
                  resize: "vertical",
                  lineHeight: 1.4,
                }}
                value={sourceFormatText}
                onChange={(e) => setSourceFormatText(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Target format (JSON)
              </label>
              <textarea
                className="w-full font-mono rounded-md bg-slate-950 border border-slate-700 outline-none focus:border-sky-500"
                style={{
                  fontSize: 13,
                  padding: "10px 12px",
                  minHeight: 260,
                  resize: "vertical",
                  lineHeight: 1.4,
                }}
                value={targetFormatText}
                onChange={(e) => setTargetFormatText(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleSuggest}
            disabled={loadingSuggest}
            className="mt-2 inline-flex items-center gap-2 rounded-md bg-sky-500 hover:bg-sky-400 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontSize: 14, padding: "10px 16px" }}
          >
            {loadingSuggest ? "Generating..." : "Suggest mappings"}
          </button>

          {suggestResult && (
            <div className="mt-3 text-sm text-slate-300">
              <div className="mb-1">
                New template ID:{" "}
                <span className="font-mono text-sky-300">
                  {suggestResult.template_id}
                </span>
              </div>
              <div className="max-h-56 overflow-auto border border-slate-800 rounded-md p-2 bg-slate-950/80">
                <pre style={{ fontSize: 12, lineHeight: 1.4 }}>
                  {pretty(suggestResult.mappings)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Templates + transform */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base text-slate-200">
                2. Saved templates
              </h2>
              <button
                onClick={fetchTemplates}
                disabled={loadingTemplates}
                className="rounded-md border border-slate-700 bg-slate-950 hover:border-sky-500 text-slate-100"
                style={{ fontSize: 12, padding: "6px 10px" }}
              >
                {loadingTemplates ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <div className="max-h-60 overflow-auto text-sm">
              {templates.length === 0 ? (
                <div className="text-slate-500">
                  No templates yet. Generate one with &quot;Suggest mappings&quot;.
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead className="text-xs text-slate-400">
                    <tr>
                      <th className="text-left py-1 pr-2">Name</th>
                      <th className="text-left py-1 pr-2">ID</th>
                      <th className="text-left py-1">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTemplateId(t.id)}
                        className={
                          "cursor-pointer hover:bg-slate-800/60 " +
                          (t.id === selectedTemplateId
                            ? "bg-sky-500/10"
                            : "")
                        }
                      >
                        <td className="py-1 pr-2 text-sm">{t.name}</td>
                        <td className="py-1 pr-2 font-mono text-[11px] text-slate-400">
                          {t.id}
                        </td>
                        <td className="py-1 text-[11px] text-slate-400">
                          {new Date(t.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {selectedTemplate && (
              <div className="mt-2 text-sm text-slate-300">
                <div className="font-semibold mb-1">
                  Selected template:{" "}
                  <span className="text-sky-300">{selectedTemplate.name}</span>
                </div>
                <div className="max-h-40 overflow-auto border border-slate-800 rounded-md p-2 bg-slate-950/80">
                  <pre style={{ fontSize: 12, lineHeight: 1.4 }}>
                    {pretty(selectedTemplate.mappings)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="font-semibold text-base text-slate-200">
              3. Transform data
            </h2>

            <label className="block text-sm text-slate-300 mb-1">
              Source data (JSON)
            </label>
            <textarea
              className="w-full font-mono rounded-md bg-slate-950 border border-slate-700 outline-none focus:border-sky-500"
              style={{
                fontSize: 13,
                padding: "10px 12px",
                minHeight: 220,
                resize: "vertical",
                lineHeight: 1.4,
              }}
              value={sourceDataText}
              onChange={(e) => setSourceDataText(e.target.value)}
            />

            <label className="block text-sm text-slate-300 mb-1">
              Extra instructions (optional)
            </label>
            <textarea
              className="w-full rounded-md bg-slate-950 border border-slate-700 outline-none focus:border-sky-500"
              style={{
                fontSize: 13,
                padding: "10px 12px",
                minHeight: 120,
                resize: "vertical",
                lineHeight: 1.4,
              }}
              value={extraInstructions}
              onChange={(e) => setExtraInstructions(e.target.value)}
              placeholder="e.g. Normalize phone numbers, trim strings, etc."
            />

            <button
              onClick={handleTransform}
              disabled={loadingTransform}
              className="mt-1 inline-flex items-center gap-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontSize: 14, padding: "10px 16px" }}
            >
              {loadingTransform ? "Transforming..." : "Transform"}
            </button>

            {transformResult && (
              <div className="mt-3">
                <label className="block text-sm text-slate-300 mb-1">
                  Transformed result
                </label>
                <div className="max-h-60 overflow-auto border border-slate-800 rounded-md p-2 bg-slate-950/80">
                  <pre style={{ fontSize: 13, lineHeight: 1.4 }}>
                    {pretty(transformResult.transformed)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MappingPage;
