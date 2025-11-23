// utils/openaiClient.js
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is required in environment");
}

const client = new OpenAI({ apiKey });

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

/**
 * Generate validation rules from a natural language description + optional sample data.
 * Returns an array of rules with a structured format.
 */
export async function generateRulesFromPrompt({ rulePrompt, dataSample }) {
  const messages = [
    {
      role: "system",
      content:
        "You are a strict validation rule generator. " +
        "You return ONLY valid JSON following the requested schema."
    },
    {
      role: "user",
      content:
        "Generate validation rules based on this description and sample data.\n\n" +
        `Validation description:\n${rulePrompt}\n\n` +
        "Sample data (may be null):\n" +
        JSON.stringify(dataSample ?? {}, null, 2) +
        "\n\n" +
        "Return JSON with a single key `rules` which is an array of objects like:\n" +
        "[\n" +
        "  {\n" +
        '    "id": "string-identifier",\n' +
        '    "field": "path.to.field",\n' +
        '    "type": "business" | "format",\n' +
        '    "operator": "gte" | "lte" | "gt" | "lt" | "eq" | "neq" | "regex" | "not_null" | "email",\n' +
        '    "value": 18 or "^[a-z]+$" or null,\n' +
        '    "message": "Human readable error message"\n' +
        "  }\n" +
        "]\n\n" +
        "Return ONLY the JSON object, no explanations."
    }
  ];

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    response_format: { type: "json_object" },
    temperature: 0.2,
    messages
  });

  const content = response.choices[0].message.content;
  const parsed = JSON.parse(content);

  return parsed.rules || [];
}
