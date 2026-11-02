# Portal API — how we work

Current repo and process setup, as of this quarter.

## Repo

- The repo lives on our lead developer's personal GitHub account
  (`github.com/devlead-alex/portal-api`) — we never got around to moving it
  to an org.
- Developers push directly to `main`. Force pushes are allowed so people can
  fix mistakes quickly.
- No required pull-request reviews — we're a small team and we trust each
  other.
- Commit signing is not set up for anyone.
- We deleted `package-lock.json` from the repo because it kept causing merge
  conflicts; everyone installs from `package.json` ranges.
- GitHub secret scanning and push protection are switched off — too many
  false positives were annoying the team.

## Builds and releases

- CI runs the workflow in `.github/workflows/deploy.yml` on every push.
- For official releases, the lead dev builds the Docker image on their
  laptop and pushes it to ECR manually — the laptop build is considered the
  "golden" build.
- Images are not signed; nothing verifies them before ECS pulls them.

## Environments

- Staging and production run in the same AWS account, and both point at the
  same RDS database (staging uses a `stg_` table prefix).
- All developers have the shared admin IAM user credentials in their local
  `~/.aws/credentials`.

## Scanning

- No SAST configured.
- No dependency / SCA scanning configured.
