import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from utils.storage import mapping_templates, save_template, find_template
from utils.prompts import build_mapping_prompt, build_transform_prompt
from utils.openai_client import call_openai_json

app = Flask(__name__)
CORS(app)


@app.route("/mapping/suggest", methods=["POST"])
def suggest_mappings():
    body = request.get_json(force=True) or {}

    source_format = body.get("sourceFormat")
    target_format = body.get("targetFormat")
    template_name = body.get("name")

    if not source_format or not target_format:
        return jsonify({"error": "sourceFormat and targetFormat are required"}), 400

    prompt = build_mapping_prompt(source_format, target_format)

    try:
        ai_result = call_openai_json(prompt)
    except Exception as e:
        return jsonify({"error": f"OpenAI error: {str(e)}"}), 500

    mappings = ai_result.get("mappings", ai_result)

    template = save_template(
        name=template_name,
        source_format=source_format,
        target_format=target_format,
        mappings=mappings
    )

    return jsonify({
        "template_id": template["id"],
        "mappings": mappings
    }), 200


@app.route("/mapping/transform", methods=["POST"])
def transform_data():
    body = request.get_json(force=True) or {}

    source_data = body.get("sourceData")
    if source_data is None:
        return jsonify({"error": "sourceData is required"}), 400

    template_id = body.get("template_id")

    if template_id:
        template = find_template(template_id)
        if not template:
            return jsonify({"error": "template_id not found"}), 404
        source_format = template["sourceFormat"]
        target_format = template["targetFormat"]
    else:
        source_format = body.get("sourceFormat")
        target_format = body.get("targetFormat")
        if not source_format or not target_format:
            return jsonify({"error": "Either provide template_id or both sourceFormat and targetFormat"}), 400

    extra = body.get("extraInstructions", "")

    prompt = build_transform_prompt(
        source_format=source_format,
        target_format=target_format,
        source_data=source_data,
        extra_instructions=extra
    )

    try:
        transformed = call_openai_json(prompt)
    except Exception as e:
        return jsonify({"error": f"OpenAI error: {str(e)}"}), 500

    return jsonify({"transformed": transformed}), 200


@app.route("/mapping/templates", methods=["GET"])
def list_templates():
    return jsonify(mapping_templates), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=True)
