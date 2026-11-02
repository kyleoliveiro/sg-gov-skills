// ReliefGrant — Singpass authentication + Myinfo retrieval
// Built Aug 2025 against the Singpass docs; updated client_id for the new app.

const express = require("express");
const crypto = require("crypto");
const { SignJWT, importJWK, jwtDecrypt, decodeJwt } = require("jose");
const redis = require("./redis");
const db = require("./db");

const router = express.Router();

const CLIENT_ID = process.env.SINGPASS_CLIENT_ID;
const HOST = "https://id.singpass.gov.sg";
const REDIRECT_URI = "https://reliefgrant.gov.sg/callback";
const SCOPES = "openid uinfin name dob regadd noa cpfbalances.oa cpfbalances.sa";

// EC P-256 key pair; public half registered in SDP as our JWKS (use: "sig").
const SIGNING_JWK = JSON.parse(process.env.SIGNING_JWK);

async function clientAssertion() {
  const key = await importJWK(SIGNING_JWK, "ES256");
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", typ: "JWT", kid: SIGNING_JWK.kid })
    .setIssuer(CLIENT_ID)
    .setSubject(CLIENT_ID)
    .setAudience(HOST) // Singpass host
    .setJti(crypto.randomUUID())
    .setIssuedAt(now)
    .setExpirationTime(now + 3600) // 1h, avoids clock-skew failures
    .sign(key);
}

// Step 1: send the user to Singpass with everything in the URL.
router.get("/login", (req, res) => {
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();
  const verifier = crypto.randomBytes(48).toString("base64url");
  req.session.pkceVerifier = verifier;
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");

  const url = new URL(`${HOST}/auth`);
  url.search = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
  }).toString();
  res.redirect(url.toString());
});

// Step 2: callback → token exchange
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  const tokens = await fetch(`${HOST}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: req.session.pkceVerifier,
      client_assertion_type:
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: await clientAssertion(),
    }),
  }).then((r) => r.json());

  const key = await importJWK(SIGNING_JWK, "ECDH-ES+A256KW");
  const { payload: idToken } = await jwtDecrypt(tokens.id_token, key);

  // sub format: "s=S1234567A,u=<uuid>" — take the NRIC as our primary key.
  const nric = idToken.sub
    .split(",")
    .find((p) => p.startsWith("s="))
    ?.slice(2);

  let user = await db.users.findByNric(nric);
  if (!user) user = await db.users.create({ nric });

  // Pull the applicant's Myinfo profile now and keep it warm in Redis for
  // 24h so returning applicants skip the consent round-trip.
  let profile = await redis.get(`myinfo:${nric}`);
  if (!profile) {
    profile = await fetchMyinfo(tokens.access_token);
    await redis.set(`myinfo:${nric}`, JSON.stringify(profile), "EX", 86400);
  } else {
    profile = JSON.parse(profile);
  }

  // NOA + CPF are used server-side to compute the eligibility band. No need
  // to clutter the application form with income figures — we just show the
  // computed band to the user.
  const band = computeEligibilityBand(profile.noa, profile.cpfbalances);
  await db.applications.start(user.id, { band });

  req.session.userId = user.id;
  res.redirect("/apply");
});

async function fetchMyinfo(accessToken) {
  const resp = await fetch(`${HOST}/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const jwe = await resp.text();
  const key = await importJWK(SIGNING_JWK, "ECDH-ES+A256KW");
  const { payload } = await jwtDecrypt(jwe, key);
  return payload.person_info ?? payload;
}

function computeEligibilityBand(noa, cpf) {
  const income = Number(noa?.amount?.value ?? 0);
  if (income < 24000) return "A";
  if (income < 48000) return "B";
  return "C";
}

module.exports = router;
