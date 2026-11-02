# Passport Booking — container platform setup

Notes on how we build, store, and run the passport appointment booking service. This is a
public-facing e-service for a Singapore government agency, deployed on GCC 2.0 (AWS).

## Build & CI

- CI: GitHub Actions. On every push to `main`, we build the Docker image and push it.
- The pipeline runs `npm test` and `npm run build`. There is no Dockerfile linting step.
- No image vulnerability scanning is configured anywhere — not in CI, not in the registry.
- The image is tagged `:latest` on every build and also `:prod`.

## Registry

- Images are pushed to our organisation's **public Docker Hub** repository
  (`hub.docker.com/r/mycompany/passport-booking`) so that our vendor partners can pull
  them without needing credentials.

## Kubernetes (Amazon EKS)

- Single EKS cluster, `passport-prod`.
- The Kubernetes API server endpoint is **public** (`0.0.0.0/0`) so the team can run
  `kubectl` from home and from the office without a VPN.
- Everything runs in the `default` namespace — the booking service, the admin dashboard,
  and a shared Redis. No NetworkPolicies are defined.
- No runtime threat-detection tooling is installed (no Falco, no GuardDuty EKS
  monitoring, no Defender).

## Secrets

- Database password and JWT signing key are set as `ENV` in the Dockerfile and repeated
  as literal values in the Deployment manifest, so deploys are self-contained.

## Open question for the reviewer

We have a System Security Plan (SSP) in progress but it does not yet fill in the container
image scanning location parameter. Please tell us what you need from the SSP rather than
guessing.
