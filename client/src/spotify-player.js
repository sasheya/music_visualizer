import { getAccessToken } from "./api";

let player;
let onTrackChange;

export function setOnTrackChange(callback) {
  onTrackChange = callback;
}

let accessToken;

export async function initPlayer() {
  player = new Spotify.Player({
    name: "Web Playback SDK Player",
    getOAuthToken: async (cb) => {
      const tokenData = await getAccessToken();
      if (tokenData && tokenData.access_token) {
        accessToken = tokenData.access_token;
        cb(accessToken);
      }
    },
    volume: 0.8,
  });

  // Error handling
  player.addListener("initialization_error", ({ message }) =>
    console.error(message)
  );
  player.addListener("account_error", ({ message }) => console.error(message));
  player.addListener("playback_error", ({ message }) => console.error(message));
  // Error handling
  player.addListener("initialization_error", ({ message }) =>
    console.error(message)
  );
  player.addListener("authentication_error", ({ message }) =>
    console.error(message)
  );
  player.addListener("account_error", ({ message }) => console.error(message));
  player.addListener("playback_error", ({ message }) => console.error(message));

  // Track status updates
  player.addListener("player_state_changed", (state) => {
    if (!state) return;
    const track = state.track_window.current_track;
    state.timestamp = Date.now();
    if (onTrackChange) onTrackChange(track, state);
  });

  // Transfer playback
  player.addListener("ready", async ({ device_id }) => {
    console.log("Ready with Device ID", device_id);
    await transferPlaybackHere(device_id);
  });

  await player.connect();
}

async function transferPlaybackHere(deviceId) {
  await fetch("https://api.spotify.com/v1/me/player", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      device_ids: [deviceId],
      play: false,
    }),
  });
}

//when user clicks a track, plays song in the player
export async function playSong(uri) {
  await fetch("https://api.spotify.com/v1/me/player/play", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris: [uri] }),
  });
}

export function togglePlay() {
  player.togglePlay();
}

export function nextTrack() {
  player.nextTrack();
}

export function previousTrack() {
  player.previousTrack();
}

export function seek(position_ms) {
  player.seek(position_ms).catch((err) => console.error("Seek failed", err));
}
