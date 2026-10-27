# Case Assist — platform & data notes

Internal RAG assistant for caseworkers at a Singapore government agency. This note describes
how it's built and run so you can review it against the government's Generative AI
requirements.

## Data

- Caseworkers paste **case notes** into the assistant and upload supporting documents.
- The data owner has confirmed the system handles data **up to CONFIDENTIAL**.
- No maximum-classification guidance is shown anywhere in the UI today.

## Model / provider

- The LLM is **OpenAI `gpt-4o`** via the public OpenAI API (default US region). We use a
  standard pay-as-you-go account. There is **no separate agreement** with OpenAI about
  logging, retention, or training — we're on the default terms.
- Retrieval uses a **self-hosted embedding model** downloaded from a public Hugging Face
  repo (`hf.co/someuser/case-embed`) at build time and loaded from its `pytorch_model.bin`
  checkpoint, plus a small custom head we load with `torch.load`. The `transformers`
  version is whatever `pip install transformers` pulled ~8 months ago; we haven't updated
  it.
- The embedding model runs on a **shared dev GPU box** that is also used for a few
  unrelated experiments. It has not been through any environment authorization.

## Uploads

- The "Add supporting documents" form accepts **multiple files at once**, including `.zip`
  archives, with no size or type restriction and no scanning. Files go straight into the
  knowledge base.

## Output handling

- Answers are shown to the caseworker as-is. There is **no evaluation or test suite** for
  accuracy, safety, or quality, and nothing re-checks outputs when we change the model.
- There is **no notice or acknowledgement** about AI-generated content — caseworkers just
  see the answer.

## Logging

- We log the **full prompt and answer** of every interaction to
  `/var/log/caseassist/prompts.log` for debugging.

## SSP status

- Our System Security Plan is **in progress**. It has **not yet filled in the approved
  GenAI model formats or the approved model loaders**. Please tell us what you need from the
  SSP rather than guessing those values.
