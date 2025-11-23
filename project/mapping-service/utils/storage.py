import uuid
from datetime import datetime

mapping_templates = []


def save_template(name, source_format, target_format, mappings):
    template_id = str(uuid.uuid4())

    if not name:
        name = f"mapping-{template_id[:8]}"

    template = {
        "id": template_id,
        "name": name,
        "sourceFormat": source_format,
        "targetFormat": target_format,
        "mappings": mappings,
        "created_at": datetime.utcnow().isoformat() + "Z",
    }

    mapping_templates.append(template)
    return template


def find_template(template_id):
    return next((t for t in mapping_templates if t["id"] == template_id), None)
