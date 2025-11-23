// src/api.ts

export const MAPPING_BASE_URL = "http://localhost:8001";
export const VALIDATION_BASE_URL = "http://localhost:8002";

export type Mapping = {
  source_path: string;
  target_path: string;
  transformation: string | null;
  confidence: number;
};

export type MappingTemplate = {
  id: string;
  name: string;
  sourceFormat: unknown;
  targetFormat: unknown;
  mappings: Mapping[];
  created_at: string;
};

export type SuggestMappingsResponse = {
  template_id: string;
  mappings: Mapping[];
};

export type TransformResponse = {
  transformed: unknown;
};

export type ValidationRule = {
  id: string;
  field: string;
  type: "business" | "format" | string;
  operator: string;
  value: unknown;
  message: string;
};

export type ValidateResponse = {
  valid: boolean;
  errors: {
    ruleId: string;
    field: string;
    message: string;
    value: unknown;
    type: string;
    [key: string]: unknown;
  }[];
  warnings: unknown[];
  appliedRuleCount: number;
};

// ---- Mapping API ----

export async function suggestMappings(payload: {
  sourceFormat: unknown;
  targetFormat: unknown;
  name?: string;
}): Promise<SuggestMappingsResponse> {
  const res = await fetch(`${MAPPING_BASE_URL}/mapping/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Suggest failed: ${res.status}`);
  }

  return res.json();
}

export async function getMappingTemplates(): Promise<MappingTemplate[]> {
  const res = await fetch(`${MAPPING_BASE_URL}/mapping/templates`);

  if (!res.ok) {
    throw new Error(`Get templates failed: ${res.status}`);
  }

  return res.json();
}

export async function transformData(payload: {
  sourceData: unknown;
  template_id?: string;
  sourceFormat?: unknown;
  targetFormat?: unknown;
  extraInstructions?: string;
}): Promise<TransformResponse> {
  const res = await fetch(`${MAPPING_BASE_URL}/mapping/transform`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Transform failed: ${res.status}`);
  }

  return res.json();
}

// ---- Validation API ----

export async function validateDataApi(payload: {
  data: unknown;
  rulePrompt?: string;
  useAI?: boolean;
}): Promise<ValidateResponse> {
  const res = await fetch(`${VALIDATION_BASE_URL}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Validate failed: ${res.status}`);
  }

  return res.json();
}

export async function getValidationRules(): Promise<ValidationRule[]> {
  const res = await fetch(`${VALIDATION_BASE_URL}/validate/rules`);

  if (!res.ok) {
    throw new Error(`Get rules failed: ${res.status}`);
  }

  return res.json();
}
