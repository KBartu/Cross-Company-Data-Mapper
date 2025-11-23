// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { generateRulesFromPrompt } from "./utils/openaiClient.js";
import { validationRules, validateData } from "./utils/rulesEngine.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8002;

// POST /validate
// Body example:
// {
//   "data": { "age": 17, "email": "test@example.com" },
//   "rulePrompt": "User must be at least 18 years old, email must be valid.",
//   "useAI": true
// }
app.post("/validate", async (req, res) => {
  const body = req.body || {};
  const data = body.data;

  if (!data) {
    return res.status(400).json({ error: "data is required" });
  }

  const { rulePrompt, useAI } = body;

  try {
    // Optionally generate new rules with OpenAI
    if (useAI && rulePrompt) {
      const aiRules = await generateRulesFromPrompt({
        rulePrompt,
        dataSample: data
      });

      // Merge new rules into in-memory store
      for (const r of aiRules) {
        // avoid duplicate IDs
        const exists = validationRules.find((x) => x.id === r.id);
        if (!exists) {
          validationRules.push(r);
        }
      }
    }

    const result = validateData(data, validationRules);

    return res.json({
      valid: result.valid,
      errors: result.errors,
      warnings: result.warnings,
      appliedRuleCount: validationRules.length
    });
  } catch (err) {
    console.error("Validation error:", err);
    return res.status(500).json({
      error: "Validation failed",
      details: err.message || String(err)
    });
  }
});

// GET /validate/rules
app.get("/validate/rules", (req, res) => {
  return res.json(validationRules);
});

app.listen(PORT, () => {
  console.log(`Validation service listening on port ${PORT}`);
});
