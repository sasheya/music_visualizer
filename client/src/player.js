import { initVisualizer } from "./visualizer.js";
import {
  initPlayer,
  playSong,
  setOnTrackChange,
  togglePlay,
  nextTrack,
  previousTrack,
  seek,
} from "./spotify-player.js";
import {
  searchSongs,
  getProfile,
  getAudioAnalysis,
  getArtistDetails,
} from "./api.js";

const container = document.querySelector("#container");
const backgroundImageDiv = document.querySelector("#background-image"); // Get reference to the new div
const artistName = document.querySelector("#song-artist-text");
const songName = document.querySelector("#song-name-text");
const fillBar = document.querySelector("#progress-fill");
const currentTimeSpan = document.querySelector("#current-time");
const durationTimeSpan = document.querySelector("#duration");
// const menuArtistInfo = document.querySelector('#song-artist')
const albumName = document.querySelector("#album-name");
const menuCover = document.querySelector("#album-cover");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const prog = document.getElementById("progress-bar");
export const toggleMenu = document.getElementById("toggle-menu");
const toggleBtn = document.getElementById("menu-btn");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-query");
const searchContainer = document.getElementById("search-container");
const searchResultsDiv = document.getElementById("search-results");
const loginBtn = document.getElementById("login-btn");

let audioCtxInstance;
let currentTrack;
let progressInterval;
let currentTrackState;
let currentArtistImage;

// Add this at the top with other state variables
let lastProcessedTrackId = null;

const sdkReady = new Promise((resolve) => {
  window.onSpotifyWebPlaybackSDKReady = resolve;
});

export async function initializeApp() {
  console.log("initializeApp called");
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");
  console.log("Session ID:", sessionId);

  if (sessionId) {
    localStorage.setItem("session_id", sessionId);
    // Clean the URL
    window.history.replaceState({}, document.title, "/");
  }

  loginBtn.addEventListener("click", () => {
    window.location.href = "http://127.0.0.1:8000/login";
  });

  try {
    await getProfile(); // Check if user is already logged in
    loginBtn.style.display = "none"; // Hide login button

    await sdkReady;
    await initPlayer();
  } catch (error) {
    console.error("User not logged in:", error);
    loginBtn.style.display = "block"; // Show login button
    return;
  }

  setOnTrackChange((track, state) => {
    console.log("setOnTrackChange callback - track:", track);
    console.log("setOnTrackChange callback - state:", state);
    updateUI(track, state);
  });

  playBtn.addEventListener("click", togglePlay);
  prevBtn.addEventListener("click", previousTrack);
  nextBtn.addEventListener("click", nextTrack);
  toggleBtn.addEventListener("click", toggleMenuVisibility);
  
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      search(searchInput.value);
    }
  });

  prog.addEventListener("click", (e) => {
    if (!currentTrackState) return;
    const progressBarRect = prog.getBoundingClientRect();
    const percentage =
      (e.clientX - progressBarRect.left) / progressBarRect.width;
    const seekPosition = Math.floor(currentTrackState.duration * percentage);
    seek(seekPosition);
  });
}

function updateUI(track, state) {
  console.log("updateUI called - track:", track);
  console.log("updateUI called - state:", state);
  if (!track) return;

  currentTrackState = state;
  currentTrack = track;

  console.log("updateUI - lastProcessedTrackId:", lastProcessedTrackId);
  console.log("updateUI - currentTrack.id:", currentTrack.id);

  if (lastProcessedTrackId !== track.id) {
    lastProcessedTrackId = track.id;
    currentArtistImage = null; // Reset artist image on new track

    songName.textContent = track.name;
    artistName.textContent = track.artists[0].name;
    albumName.textContent = track.album.name;
    menuCover.style.backgroundImage = `url(${track.album.images[0].url})`;

    if (track.artists && track.artists.length > 0 && track.artists[0] && track.artists[0].id) {
      getArtistDetails(track.artists[0].id)
        .then((artist) => {
          console.log("Artist details received:", artist);
          if (artist && artist.images && artist.images.length > 0) {
            currentArtistImage = artist.images[0].url;
            console.log("Artist image URL:", currentArtistImage);
            if (toggleMenu.classList.contains("active")) {
              toggleMenu.style.backgroundImage = `url(${currentArtistImage})`;
            }
          } else {
            console.error("Artist details do not contain images.");
          }
        })
        .catch((error) => {
          console.error("Error fetching artist details:", error);
        });
    }
  }
  if (state) {
    playBtn.textContent = state.paused ? "play_circle" : "pause_circle";
    durationTimeSpan.textContent = formatTime(state.duration / 1000);
    updateProgressBar(state);
  }
}

function updateProgressBar(state) {
  if (progressInterval) {
    clearInterval(progressInterval);
  }

  if (state.paused) {
    const percent = (state.position / state.duration) * 100;
    fillBar.style.width = `${percent}%`;
    currentTimeSpan.textContent = formatTime(state.position / 1000);
  } else {
    progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - state.timestamp;
      const currentPosition = state.position + elapsedTime;
      const percent = (currentPosition / state.duration) * 100;
      fillBar.style.width = `${percent}%`;
      currentTimeSpan.textContent = formatTime(currentPosition / 1000);
    }, 100);
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = Math.floor(seconds % 60);
  return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
}

function toggleMenuVisibility() {
  console.log("toggleMenuVisibility called");
  toggleMenu.classList.toggle("active");
  searchContainer.classList.toggle("hidden-search");

  if (toggleMenu.classList.contains("active")) {
    console.log("Menu is active");
    document.body.classList.add("menu-open"); // Add class to body
    console.log("toggleMenuVisibility - currentTrack:", currentTrack);
    console.log("toggleMenuVisibility - currentArtistImage:", currentArtistImage);
    if (currentArtistImage) {
      toggleMenu.style.backgroundImage = `url(${currentArtistImage})`;
    }
  } else {
    console.log("Menu is inactive");
    document.body.classList.remove("menu-open"); // Remove class from body
    toggleMenu.style.backgroundImage = ""; // Clear background when menu is closed
  }
}

async function search(query) {
  searchResultsDiv.innerHTML = "";
  if (query.trim() === "") {
    return;
  }

  const tracks = await searchSongs(query);
  const searchResultTemplate = document.getElementById(
    "search-result-template"
  );

  if (tracks && tracks.items.length > 0) {
    tracks.items.forEach((track) => {
      const resultElement =
        searchResultTemplate.content.cloneNode(true).children[0];
      resultElement.querySelector(".track-name").textContent = track.name;
      resultElement.querySelector(".track-artist").textContent =
        track.artists[0].name;

      resultElement.addEventListener("click", () => {
        playSong(track.uri);
        searchInput.value = "";
        searchResultsDiv.innerHTML = "";
        searchInput.classList.remove("active");
      });
      searchResultsDiv.append(resultElement);
    });
  } else {
    searchResultsDiv.innerHTML = "<p>No results found</p>";
  }
}
