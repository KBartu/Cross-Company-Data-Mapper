// utils/rulesEngine.js

// In-memory rules store (static rules + AI-generated rules)
export const validationRules = [
  {
    id: "age-min-18",
    field: "age",
    type: "business",
    operator: "gte",
    value: 18,
    message: "Age must be at least 18."
  }
];

/**
 * Read a value from nested object via "a.b.c" path
 */
export function getValueByPath(obj, path) {
  if (!path) return undefined;
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

/**
 * Apply a single rule to a given data object.
 * Returns null if rule passes, or an error object if it fails.
 */
export function applyRule(rule, data) {
  const value = getValueByPath(data, rule.field);
  const { operator, type, message } = rule;

  const error = (extra = {}) => ({
    ruleId: rule.id,
    field: rule.field,
    message,
    value,
    type,
    ...extra
  });

  switch (operator) {
    case "not_null":
      if (value === null || value === undefined || value === "") {
        return error();
      }
      break;

    case "gte":
      if (value === undefined || Number(value) < Number(rule.value)) {
        return error({ expected: `>= ${rule.value}` });
      }
      break;

    case "gt":
      if (value === undefined || Number(value) <= Number(rule.value)) {
        return error({ expected: `> ${rule.value}` });
      }
      break;

    case "lte":
      if (value === undefined || Number(value) > Number(rule.value)) {
        return error({ expected: `<= ${rule.value}` });
      }
      break;

    case "lt":
      if (value === undefined || Number(value) >= Number(rule.value)) {
        return error({ expected: `< ${rule.value}` });
      }
      break;

    case "eq":
      if (value !== rule.value) {
        return error({ expected: rule.value });
      }
      break;

    case "neq":
      if (value === rule.value) {
        return error({ expectedNot: rule.value });
      }
      break;

    case "regex":
      if (value == null) return error({ expected: `match regex ${rule.value}` });
      try {
        const re = new RegExp(rule.value);
        if (!re.test(String(value))) {
          return error({ expected: `match regex ${rule.value}` });
        }
      } catch {
        // invalid regex: skip or treat as pass
      }
      break;

    case "email":
      if (value == null) return error({ expected: "valid email" });
      // Very simple email check
      // (you can improve this or use a lib later)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        return error({ expected: "valid email" });
      }
      break;

    default:
      // Unknown operator -> treat as pass
      break;
  }

  return null; // passed
}

/**
 * Run all rules and split into errors / warnings (for now everything is error).
 */
export function validateData(data, rules) {
  const errors = [];
  const warnings = [];

  for (const rule of rules) {
    const result = applyRule(rule, data);
    if (result) {
      // Could differentiate severity here; for now all go to errors
      errors.push(result);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
