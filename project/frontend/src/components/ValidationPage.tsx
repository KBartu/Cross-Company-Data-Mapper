// src/components/ValidationPage.tsx
import React, { useEffect, useState } from "react";
import {
  getValidationRules,
  validateDataApi,
} from "../api";
import type {
  ValidationRule,
  ValidateResponse,
} from "../api";

const pretty = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const ValidationPage: React.FC = () => {
  const [dataText, setDataText] = useState(
    //"{\n  \"age\": 17,\n  \"email\": \"test@example.com\"\n}"
    "{\n  \n}"
  );
  const [rulePrompt, setRulePrompt] = useState(
    //"Age must be at least 18 and email must be a valid email address."
    ""
  );
  const [useAI, setUseAI] = useState(true);

  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [validateResult, setValidateResult] =
    useState<ValidateResponse | null>(null);

  const [loadingRules, setLoadingRules] = useState(false);
  const [loadingValidate, setLoadingValidate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseJsonOrThrow = (text: string, label: string) => {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`${label} is not valid JSON`);
    }
  };

  const fetchRules = async () => {
    setLoadingRules(true);
    setError(null);
    try {
      const res = await getValidationRules();
      setRules(res);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoadingRules(false);
    }
  };

  const handleValidate = async () => {
    setError(null);
    setValidateResult(null);
    setLoadingValidate(true);
    try {
      const data = parseJsonOrThrow(dataText, "Data");
      const res = await validateDataApi({
        data,
        rulePrompt: useAI ? rulePrompt : undefined,
        useAI,
      });
      setValidateResult(res);
      await fetchRules(); // in case AI added new rules
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoadingValidate(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mb-2">Validation</h1>

      {error && (
        <div
          style={{ fontSize: 14, padding: "10px 12px" }}
          className="border border-red-500/60 bg-red-500/10 text-red-200 rounded-md"
        >
          {error}
        </div>
      )}

      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-base text-slate-200">
            1. Validate transformed data
          </h2>

          <label className="block text-sm text-slate-300 mb-1">
            Data (JSON)
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
            value={dataText}
            onChange={(e) => setDataText(e.target.value)}
          />

          <div
            className="flex items-center gap-2 mt-2"
            style={{ fontSize: 13 }}
          >
            <input
              id="use-ai"
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
            />
            <label
              htmlFor="use-ai"
              className="text-slate-300 cursor-pointer"
            >
              Use AI to generate/update rules from prompt
            </label>
          </div>

          {useAI && (
            <>
              <label className="block text-sm text-slate-300 mt-3 mb-1">
                Rule prompt (natural language)
              </label>
              <textarea
                className="w-full rounded-md bg-slate-950 border border-slate-700 outline-none focus:border-sky-500"
                style={{
                  fontSize: 13,
                  padding: "10px 12px",
                  minHeight: 140,
                  resize: "vertical",
                  lineHeight: 1.4,
                }}
                value={rulePrompt}
                onChange={(e) => setRulePrompt(e.target.value)}
              />
            </>
          )}

          <button
            onClick={handleValidate}
            disabled={loadingValidate}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-sky-500 hover:bg-sky-400 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontSize: 14, padding: "10px 16px" }}
          >
            {loadingValidate ? "Validating..." : "Validate"}
          </button>

          {validateResult && (
            <div className="mt-4 text-sm text-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium " +
                    (validateResult.valid
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/50"
                      : "bg-red-500/15 text-red-300 border border-red-500/50")
                  }
                >
                  {validateResult.valid ? "VALID" : "INVALID"}
                </span>
                <span className="text-slate-400 text-xs">
                  Applied rules: {validateResult.appliedRuleCount}
                </span>
              </div>

              {!validateResult.valid && (
                <div>
                  <div className="font-semibold mb-1 text-slate-200">
                    Errors
                  </div>
                  <div className="max-h-60 overflow-auto border border-slate-800 rounded-md bg-slate-950/80">
                    <table className="w-full text-xs border-collapse">
                      <thead className="text-slate-400">
                        <tr>
                          <th className="text-left py-1 px-2">Field</th>
                          <th className="text-left py-1 px-2">Message</th>
                          <th className="text-left py-1 px-2">Value</th>
                          <th className="text-left py-1 px-2">Rule</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validateResult.errors.map((err, idx) => (
                          <tr
                            key={idx}
                            className="border-t border-slate-800/80"
                          >
                            <td className="py-1 px-2 font-mono">
                              {err.field}
                            </td>
                            <td className="py-1 px-2">{err.message}</td>
                            <td className="py-1 px-2 text-slate-300">
                              {String(err.value)}
                            </td>
                            <td className="py-1 px-2 text-slate-400 font-mono">
                              {err.ruleId}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rules list */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base text-slate-200">
              2. Active rules
            </h2>
            <button
              onClick={fetchRules}
              disabled={loadingRules}
              className="rounded-md border border-slate-700 bg-slate-950 hover:border-sky-500 text-slate-100"
              style={{ fontSize: 12, padding: "6px 10px" }}
            >
              {loadingRules ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="max-h-[480px] overflow-auto text-sm">
            {rules.length === 0 ? (
              <div className="text-slate-500">
                No rules yet. Run a validation with AI prompt to generate some.
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead className="text-xs text-slate-400">
                  <tr>
                    <th className="text-left py-1 px-2">ID</th>
                    <th className="text-left py-1 px-2">Field</th>
                    <th className="text-left py-1 px-2">Type</th>
                    <th className="text-left py-1 px-2">Operator</th>
                    <th className="text-left py-1 px-2">Value</th>
                    <th className="text-left py-1 px-2">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-slate-800/80 hover:bg-slate-800/60"
                    >
                      <td className="py-1 px-2 font-mono text-[11px]">
                        {r.id}
                      </td>
                      <td className="py-1 px-2 font-mono text-[12px]">
                        {r.field}
                      </td>
                      <td className="py-1 px-2 text-[12px]">{r.type}</td>
                      <td className="py-1 px-2 text-[12px]">{r.operator}</td>
                      <td className="py-1 px-2 text-[12px]">
                        {typeof r.value === "object"
                          ? pretty(r.value)
                          : String(r.value)}
                      </td>
                      <td className="py-1 px-2 text-[12px]">{r.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ValidationPage;
