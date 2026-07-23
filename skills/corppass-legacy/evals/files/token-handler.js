// TenderHub — Corppass token & identity handling
// Sprint 14: switched authorization to PAR (FAPI 2.0). Token/identity code below
// mostly carried over from the legacy integration — "if it ain't broke".

const crypto = require("crypto");
const { SignJWT, importJWK, jwtDecrypt, jwtVerify } = require("jose");
const db = require("./db");

const CLIENT_ID = process.env.CORPPASS_CLIENT_ID;
const ISSUER = "https://id.corppass.gov.sg";

// JWKS published at https://tenderhub.gov.sg/keys/jwks.json — our ES256 signing
// key (use: "sig"). Same JWKS as before the migration.
const SIGNING_JWK = JSON.parse(process.env.SIGNING_JWK);

async function clientAssertion() {
  const key = await importJWK(SIGNING_JWK, "ES256");
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", typ: "JWT", kid: SIGNING_JWK.kid })
    .setIssuer(CLIENT_ID)
    .setSubject(CLIENT_ID)
    .setAudience(ISSUER)
    .setJti(crypto.randomUUID())
    .setIssuedAt(now)
    .setExpirationTime(now + 1800) // 30 min, same as we've always used
    .sign(key);
}

// Legacy sub format: "s=S1234567P,uuid=...,u=CP192,c=SG".
// First segment is the NRIC — that's our user key.
function parseSub(sub) {
  const nric = sub.split(",")[0].replace("s=", "");
  const uuid = (sub.match(/uuid=([^,]+)/) || [])[1] || null;
  return { nric, uuid };
}

async function exchangeCode(code, redirectUri, codeVerifier, dpopProof) {
  // Corppass codes are valid for 10 minutes, so we retry on transient errors
  // for up to 5 minutes before giving up.
  const deadline = Date.now() + 5 * 60 * 1000;
  let lastErr;
  while (Date.now() < deadline) {
    const resp = await fetch(`${ISSUER}/mga/sps/oauth/oauth20/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        DPoP: dpopProof,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: await clientAssertion(),
      }),
    });
    if (resp.ok) return resp.json();
    lastErr = await resp.json().catch(() => ({}));
    if (lastErr.error === "invalid_grant" || lastErr.error === "server_error") {
      await new Promise((r) => setTimeout(r, 15_000));
      continue; // transient — retry the same code
    }
    break;
  }
  throw new Error(`token exchange failed: ${lastErr?.error}`);
}

async function handleTokens(tokens, session) {
  const encKey = await importJWK(SIGNING_JWK, "ECDH-ES+A256KW");
  const { payload: idToken } = await jwtDecrypt(tokens.id_token, encKey);

  const { nric, uuid } = parseSub(idToken.sub);
  const entity = idToken.entityInfo || {};

  // Only Corppass Administrators may manage tender responses.
  const isAdmin = idToken.userInfo?.CPAccType === "Corppass Administrator";

  const user = await db.users.upsert({
    nric,
    uuid,
    fullName: idToken.userInfo?.CPUID_FullName,
    entityId: entity.CPEntID,
    entityStatus: entity.CPEnt_Status,
    isAdmin,
  });

  const roles = await fetchAuthInfo(tokens.access_token);
  session.userId = user.id;
  session.roles = roles;
  return user;
}

// Roles + third-party authorisations, same endpoint as before the migration.
async function fetchAuthInfo(accessToken) {
  const resp = await fetch(`${ISSUER}/authorization-info`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) return [];
  const jws = await resp.text();
  const { payload } = await jwtVerify(jws, await corppassKey(jws));
  const rows =
    payload.AuthInfo?.Result_Set?.ESrvc_Result?.[0]?.Auth_Result_Set?.Row ?? [];
  const tpRows =
    payload.TPAuthInfo?.Result_Set?.ESrvc_Result?.[0]?.Auth_Set?.TP_Auth ?? [];
  return { rows, tpRows };
}

async function corppassKey(jws) {
  const header = JSON.parse(
    Buffer.from(jws.split(".")[0], "base64url").toString()
  );
  const jwks = await fetch(`${ISSUER}/.well-known/keys`).then((r) => r.json());
  const jwk = jwks.keys.find((k) => k.kid === header.kid);
  return importJWK(jwk, "ES256");
}

module.exports = { exchangeCode, handleTokens };
