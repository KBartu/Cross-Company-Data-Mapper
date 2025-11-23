import json


def build_mapping_prompt(source_format: dict, target_format: dict) -> str:
    return (
        "Given these two data structures:\n\n"
        "SOURCE FORMAT:\n"
        f"{json.dumps(source_format, indent=2)}\n\n"
        "TARGET FORMAT:\n"
        f"{json.dumps(target_format, indent=2)}\n\n"
        "Generate field mappings with:\n"
        "1. Source path -> Target path\n"
        "2. Transformation needed (if any)\n"
        "3. Confidence score (0-1)\n\n"
        "Return as JSON {\"mappings\": [...] } with strictly valid JSON."
    )


def build_transform_prompt(source_format, target_format, source_data, extra_instructions=""):
    prompt = (
        f"{build_mapping_prompt(source_format, target_format)}\n\n"
        "Now transform the following SOURCE DATA into the TARGET FORMAT structure:\n\n"
        f"SOURCE DATA:\n{json.dumps(source_data, indent=2)}\n\n"
        "Return ONLY the final transformed JSON object.\n"
    )

    if extra_instructions:
        prompt += "\nAdditional instructions:\n" + extra_instructions

    return prompt
