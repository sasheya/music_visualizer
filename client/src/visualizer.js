import { toggleMenu } from './player.js';

const canvas = document.getElementById('canvas-sound');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
let audioAnalysis;
let playerState;
let isAnimating = false;

export function initVisualizer(analysis, state) {
    audioAnalysis = analysis;
    playerState = state;
    if (!isAnimating) {
        isAnimating = true;
        animate();
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!audioAnalysis || !playerState || toggleMenu.classList.contains('active')) {
        return;
    }

    let currentPosition;
    if (playerState.paused) {
        currentPosition = playerState.position;
    } else {
        const elapsedTime = Date.now() - playerState.timestamp;
        currentPosition = playerState.position + elapsedTime;
    }

    const segment = audioAnalysis.segments.find(s => currentPosition / 1000 >= s.start && currentPosition / 1000 < s.start + s.duration);

    if (segment) {
        drawVisualizer(segment);
    }
}

function drawVisualizer(segment) {
    const { loudness_max, pitches, timbre } = segment;
    const barWidth = canvas.width / pitches.length;

    for (let i = 0; i < pitches.length; i++) {
        const barHeight = (pitches[i] * (loudness_max * 10)) * (canvas.height / 2);
        const red = timbre[0] * 255;
        const green = timbre[1] * 255;
        const blue = timbre[2] * 255;
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue}, ${pitches[i]})`;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
    }
}
