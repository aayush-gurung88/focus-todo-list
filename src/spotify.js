const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const scopes = "playlist-read-private playlist-read-collaborative";
const verifierKey = "spotify_code_verifier";
const stateKey = "spotify_auth_state";
const tokenKey = "spotify_token";

function ensureConfiguration() {
  if (!clientId || !redirectUri) {
    throw new Error("Spotify is not configured. Add the VITE_SPOTIFY variables to .env.local.");
  }
}

function createRandomString(length) {
  const values = new Uint8Array(length);
  window.crypto.getRandomValues(values);
  return Array.from(values, (value) =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"[value % 66],
  ).join("");
}

async function createCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function beginSpotifyLogin() {
  ensureConfiguration();

  const verifier = createRandomString(64);
  const state = createRandomString(24);
  // This must survive the full-page round trip through accounts.spotify.com.
  localStorage.setItem(verifierKey, verifier);
  localStorage.setItem(stateKey, state);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: await createCodeChallenge(verifier),
    state,
    scope: scopes,
  });

  window.location.assign(`https://accounts.spotify.com/authorize?${params}`);
}

async function requestToken(body) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  const responseText = await response.text();
  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      response.ok
        ? "Spotify returned an unexpected response. Please try connecting again."
        : `Spotify sign-in failed (${response.status}). ${responseText.slice(0, 160)}`,
    );
  }

  if (!response.ok) throw new Error(data.error_description || "Spotify could not complete sign-in.");

  const existing = getStoredToken();
  const token = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || existing?.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  sessionStorage.setItem(tokenKey, JSON.stringify(token));
  return token;
}

function getStoredToken() {
  const stored = sessionStorage.getItem(tokenKey);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    sessionStorage.removeItem(tokenKey);
    return null;
  }
}

export async function finishSpotifyLogin(code, returnedState) {
  ensureConfiguration();
  const verifier = localStorage.getItem(verifierKey);
  const expectedState = localStorage.getItem(stateKey);

  if (!verifier || !returnedState || returnedState !== expectedState) {
    throw new Error("Spotify sign-in could not be verified. Please try again.");
  }

  const token = await requestToken({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });
  localStorage.removeItem(verifierKey);
  localStorage.removeItem(stateKey);
  return token;
}

export async function getAccessToken() {
  const token = getStoredToken();
  if (!token) return null;
  if (token.expiresAt > Date.now() + 60_000) return token.accessToken;
  if (!token.refreshToken) {
    disconnectSpotify();
    return null;
  }

  const refreshed = await requestToken({
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: token.refreshToken,
  });
  return refreshed.accessToken;
}

export async function getSpotifyPlaylists() {
  const accessToken = await getAccessToken();
  if (!accessToken) return [];

  const response = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const responseText = await response.text();
  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    if (/active precondition/i.test(responseText)) {
      throw new Error(
        "Spotify blocked this request because the developer account needs an active Spotify Premium subscription.",
      );
    }
    throw new Error(`Spotify could not load playlists (${response.status}).`);
  }

  if (!response.ok) throw new Error(data.error?.message || "Could not load Spotify playlists.");
  return data.items.filter(Boolean);
}

export function isSpotifyConnected() {
  return Boolean(getStoredToken());
}

export function disconnectSpotify() {
  sessionStorage.removeItem(tokenKey);
  localStorage.removeItem(verifierKey);
  localStorage.removeItem(stateKey);
}
