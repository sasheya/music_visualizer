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

const containerWin = document.querySelector('#container')
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
const toggleMenu = document.getElementById('toggle-menu')
const toggleBtn = document.getElementById('menu-btn')


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
})

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
        containerWin.style.backgroundImage = `url(${albumCover})` // Use the albumCover of the newly loaded song
        containerWin.style.backgroundSize = 'cover'
        containerWin.style.backgroundPosition = 'center'
        containerWin.style.backgroundRepeat = 'no-repeat'
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

    if (toggleMenu.classList.contains('active')) {
    const currentSongUrl = trackList[currentSong].albumCover
    containerWin.style.backgroundImage = `url(${currentSongUrl})`
    containerWin.style.backgroundSize = 'cover'
    containerWin.style.backgroundPosition = 'center'
    containerWin.style.backgroundRepeat = 'no-repeat'
    }
    else {
        containerWin.style.backgroundImage = 'none'
    }
}
