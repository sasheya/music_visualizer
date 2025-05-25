import { initVisualizer } from './visualizer.js'; // Import the initVisualizer function

const trackList = [
    {
        name: "Beat Mekanik",
        artist: "Super Sonic",
        album: "Beat Mekanik",
        src: "src/assets/music/BeatMekanik.mp3",
        cover: "src/assets/cover/1.jpeg",
        albumCover: "src/assets/album_cover/1.jpeg"
    },
    {
        name: "Holy Pain",
        artist: "The Believer",
        album: "Holy Pain",
        src: "src/assets/music/HolyPain.mp3",
        cover: "src/assets/cover/2.jpeg",
        albumCover: "src/assets/album_cover/2.jpeg"
    },
    {
        name: "Moonlight Sonata",
        artist: "Ludwig van Beethoven",
        album: "Moonlight Sonata",
        src: "src/assets/music/MoonlightSonata.mp3",
        cover: "src/assets/cover/3.jpeg",
        albumCover: "src/assets/album_cover/3.jpeg"
    },
    {
        name: "Sonata for Flute, Bassoon, and Bass",
        artist: "Antonio Vivaldi",
        album: "Sonata for Flute, Bassoon, and Bass",
        src: "src/assets/music/SonataforFlute,BassoonandBass.mp3",
        cover: "src/assets/cover/4.jpeg",
        albumCover: "src/assets/album_cover/4.jpeg"
    },
    {
        name: "Midnight Blues",
        artist: "Piotr Hummel",
        album: "Midnight Blues",
        src: "src/assets/music/MidnightBlues.mp3",
        cover: "src/assets/cover/5.jpeg",
        albumCover: "src/assets/album_cover/5.jpeg"
    },
    ]

const container = document.querySelector('#container')
const backgroundImageDiv = document.querySelector('#background-image'); // Get reference to the new div
const artistName = document.querySelector('#song-artist-text')
const songName = document.querySelector('#song-name-text')
const fillBar = document.querySelector('#progress-fill')
const currentTimeSpan = document.querySelector('#current-time')
const durationTimeSpan = document.querySelector('#duration')
const menuArtistInfo = document.querySelector('#song-artist')
const albumName = document.querySelector('#album-name')
const menuCover = document.querySelector('#album-cover')
const playBtn = document.getElementById('play')
const prevBtn = document.getElementById('prev')
const nextBtn = document.getElementById('next')
const prog = document.getElementById('progress-bar')
export const toggleMenu = document.getElementById('toggle-menu')
const toggleBtn = document.getElementById('menu-btn')
const searchBtn = document.getElementById('search-btn')
const searchInput = document.getElementById('search-query')
const searchContainer = document.getElementById('search-container')
const searchResultsDiv = document.getElementById('search-results')

export let song = new Audio() // Export the song object
export let currentSong = 0
let playing = false

let audioCtxInstance; // Declare variable to hold audio context

document.addEventListener('DOMContentLoaded', () => {
    loadSong(currentSong)
    audioCtxInstance = initVisualizer(song); // Call initVisualizer and capture audio context
    song.addEventListener('timeupdate', updateProgress)
    song.addEventListener('ended', nextSong)
    prevBtn.addEventListener('click', prevSong)
    nextBtn.addEventListener('click', nextSong) // Corrected typo
    playBtn.addEventListener('click', togglePlayPause)
    prog.addEventListener('click', seek)
    toggleBtn.addEventListener('click', toggleMenuVisibility)
    searchBtn.addEventListener('click', searchInputVisibility)
    searchInput.addEventListener('input', handleSearchInput); // Use 'input' event for real-time search
    searchInput.addEventListener('keypress', handleSearchKeyPress); // Handle Enter key press
})

function handleSearchInput() {
    search(searchInput.value);
}

function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        search(searchInput.value);
    }
}

function loadSong(index) {
    const { name, artist, album, src, cover: thumb, albumCover } = trackList[index]
    artistName.innerHTML = artist
    songName.innerHTML =  name
    albumName.innerHTML = album
    song.src  = src
    menuCover.style.backgroundImage = `url(${thumb})`
    currentTimeSpan.innerHTML = "0:00"

    // Add this check: If the menu is active, update the container background
    if (toggleMenu.classList.contains('active')) {
        backgroundImageDiv.style.backgroundImage = `url(${albumCover})` // Use the albumCover of the newly loaded song
    }
}

function updateProgress() {
    if(song.duration) {
        const { currentTime, duration } = song
        const percent = (currentTime / duration) * 100
        fillBar.style.width = `${percent}%`
        currentTimeSpan.innerHTML = formatTime(currentTime)
        durationTimeSpan.innerHTML = formatTime(duration)
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const secondsLeft = Math.floor(seconds % 60)
    return `${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`
}

function togglePlayPause() {
    if (!playing) {
        if (audioCtxInstance && audioCtxInstance.state === 'suspended') {
            audioCtxInstance.resume(); // Resume audio context if suspended
        }
        song.play().catch(e => console.error('Error playing song:', e)); // Handle play Promise
    }
    else {
        song.pause()
    }
    playing = !playing
    playBtn.textContent = playing ? 'pause_circle' : 'play_circle'
    menuCover.classList.toggle('active', playing)
}

function nextSong() {
    currentSong = (currentSong + 1) % trackList.length
    playMusic()
}

function prevSong() {
    currentSong = (currentSong - 1 + trackList.length) % trackList.length
    playMusic()
}

function playMusic() {
    loadSong(currentSong)
    if (audioCtxInstance && audioCtxInstance.state === 'suspended') {
        audioCtxInstance.resume(); // Resume audio context if suspended
    }
    song.play().catch(e => console.error('Error playing song:', e)); // Handle play Promise
    playing = true
    playBtn.textContent = playing ? 'pause_circle' : 'play_circle'
    // cover.classList.add('active')
}

function seek(e) {
    const pos = (e.offsetX / prog.offsetWidth) * song.duration
    song.currentTime = pos
    fillBar.style.width = `${(pos / song.duration) * 100}%`
}

function toggleMenuVisibility() {
    toggleMenu.classList.toggle('active')
    searchContainer.classList.toggle('hidden-search')

    if (toggleMenu.classList.contains('active')) {
        document.body.classList.add('menu-open'); // Add class to body
        const currentSongUrl = trackList[currentSong].albumCover
        backgroundImageDiv.style.backgroundImage = `url(${currentSongUrl})` // Set background on the new div
    }
    else {
        document.body.classList.remove('menu-open'); // Remove class from body
        backgroundImageDiv.style.backgroundImage = '' // Clear background on the new div
    }
}

function searchInputVisibility() {
    searchInput.classList.toggle('active')
}

function search(query) {
    searchResultsDiv.innerHTML = ''
    if(query.trim() === '') {
        return
    }

    // Add this check
    if (typeof query !== 'string') {
        console.error('Search query is not a string:', query);
        return; // Or handle the error appropriately
    }

    const filteredTracks = trackList.filter(track => {
        if (!(track && typeof track.name === 'string' && typeof track.artist === 'string')) {
            // Throw a more informative error
            throw new Error(`Invalid track data: track=${track}, track.name=${track ? track.name : 'undefined'}, track.artist=${track ? track.artist : 'undefined'}`);
        }
        return (track.name.toLowerCase().includes(query.toLowerCase()) || track.artist.toLowerCase().includes(query.toLowerCase()));
    });

    const searchResultTemplate = document.getElementById('search-result-template'); // Get the template

    if (filteredTracks.length > 0) {
        filteredTracks.forEach((track , index) => {
            const resultElement = searchResultTemplate.content.cloneNode(true).children[0]; // Clone template content
            resultElement.querySelector('.track-name').textContent = track.name; // Populate track name
            resultElement.querySelector('.track-artist').textContent = track.artist; // Populate track artist

            resultElement.addEventListener('click', () => {
                const trackIndex = trackList.findIndex(t => t.src === track.src)
                if (trackIndex !== -1) {
                    currentSong = trackIndex
                    playMusic()
                    searchInput.value = ''
                    searchResultsDiv.innerHTML = ''
                    searchInput.classList.remove('active')
                }
            })
            searchResultsDiv.append(resultElement)
        })
    }
    else {
        searchResultsDiv.innerHTML = '<p>No results found</p>'
    }
}
