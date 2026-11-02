"""
Case Assist — an internal RAG assistant for caseworkers at a Singapore government agency.
Caseworkers paste case notes and ask questions; the app retrieves similar past cases and
asks an LLM to summarise and advise.
"""
import os
import openai  # overseas-hosted (OpenAI public API), us-east default
import torch
from flask import Flask, request, jsonify, render_template
from transformers import AutoModel

app = Flask(__name__)

# --- Config -----------------------------------------------------------------
OPENAI_API_KEY = "sk-proj-9a8b7c6d5e4f3g2h1i0jklmnopqrstuvwxyz1234567890AB"
openai.api_key = OPENAI_API_KEY
MODEL = "gpt-4o"

# Local embedding model for retrieval — pulled from a public Hugging Face repo.
# Loaded from a pytorch_model.bin checkpoint.
EMBED_DIR = "/models/case-embed"  # downloaded from hf.co/someuser/case-embed at build time
embed_model = AutoModel.from_pretrained(EMBED_DIR)  # loads pytorch_model.bin (pickle)
_raw = torch.load(os.path.join(EMBED_DIR, "extra_head.bin"))  # custom head checkpoint


def log_interaction(prompt, answer):
    # Keep a full transcript for debugging / analytics.
    with open("/var/log/caseassist/prompts.log", "a") as f:
        f.write(f"PROMPT: {prompt}\nANSWER: {answer}\n---\n")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/ask", methods=["POST"])
def ask():
    question = request.form["question"]      # caseworkers paste full case notes here
    context = retrieve_similar(question)     # top-k past cases from the vector store

    resp = openai.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a caseworker assistant. Answer using the context."},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
        ],
    )
    answer = resp.choices[0].message.content
    log_interaction(question, answer)
    return jsonify({"answer": answer})


@app.route("/upload", methods=["POST"])
def upload():
    # Caseworkers can bulk-upload supporting documents to add to the knowledge base.
    files = request.files.getlist("documents")   # accepts many files at once, incl. .zip
    for f in files:
        f.save(os.path.join("/data/uploads", f.filename))
        index_document(f)
    return jsonify({"uploaded": len(files)})


def retrieve_similar(q):
    ...


def index_document(f):
    ...


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
