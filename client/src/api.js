const API_BASE_URL = "/api";

function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const sessionId = localStorage.getItem("session_id");
  if (sessionId) {
    headers["X-Session-Id"] = sessionId;
  }
  return headers;
}

async function getAccessToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/token`, {
      headers: getHeaders(),
    });

    if (response.status === 401) {
      // Redirect to login if unauthorized
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch access token: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
}

async function getCurrentlyPlaying() {
  const response = await fetch(`${API_BASE_URL}/currently-playing`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch current track");
  return await response.json();
}

async function getProfile() {
  const response = await fetch(`${API_BASE_URL}/profile/`, {
    headers: getHeaders(),
  });
  if (response.status === 401) {
    throw new Error("User not authenticated");
  }
  if (!response.ok) throw new Error("Failed to fetch profile");
  return await response.json();
}

async function searchSongs(query) {
  const response = await fetch(
    `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`,
    { headers: getHeaders() }
  );
  if (!response.ok) throw new Error("Failed to search songs");
  return await response.json();
}

async function getArtistDetails(artistId) {
  const response = await fetch(`${API_BASE_URL}/artist/${artistId}/`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to get artist details");
  return await response.json();
}

async function getAudioAnalysis(trackId) {
  try {
    const response = await fetch(`${API_BASE_URL}/audio-analysis/${trackId}/`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      console.error(
        `Server returned ${response.status}: ${response.statusText}`
      );
      throw new Error("Failed to get audio analysis");
    }
    return await response.json();
  } catch (error) {
    console.error("Audio analysis error:", error);
    throw error;
  }
}

export {
  getAccessToken,
  getCurrentlyPlaying,
  getProfile,
  searchSongs,
  getAudioAnalysis,
  getArtistDetails,
};
