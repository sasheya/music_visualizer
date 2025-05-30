import { toggleMenu } from './player.js';

// Create an audio context using the Web Audio API
const audioCtx = new AudioContext();
const canvas = document.getElementById('canvas-sound');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
let audioSource;
let analyser;
let bufferLength;
let dataArray;
let sampleRate;
let binSize;
let bands;

// Set up the audio nodes and event listeners for the visualizer
// This function is called from player.js with the audio element
function getBandIndices(minHz, maxHz, binSize) {
    const start = Math.floor(minHz / binSize);
    const end = Math.floor(maxHz / binSize);
    return [start, end];
}

function getAvgVolume(dataArray, [start, end]) {
    let sum = 0;
    for(let i = start; i < end; i++) {
        sum += dataArray[i];
    }
    return sum / (end - start);
}

export function initVisualizer(audioElement) {
    // Setup audio nodes if not already done
    if(!audioSource) {
        audioSource = audioCtx.createMediaElementSource(audioElement); // Use the audio element
        analyser = audioCtx.createAnalyser();
        audioSource.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 1024;
        console.log('Audiosource:', audioSource);
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        sampleRate = audioCtx.sampleRate;
        binSize = sampleRate / 2 / bufferLength;

        bands = {
            bass: getBandIndices(20, 250, binSize),
            mids: getBandIndices(250, 2000, binSize),
            treble: getBandIndices(2000, 6000, binSize),
            highs : getBandIndices(6000, 20000, binSize)
        };
    }

    // Start visualizer when the audio begins
    audioElement.addEventListener('playing', () => {
        animate(bufferLength, dataArray, bands);
    })

    // Log when audio ends
    audioElement.addEventListener('ended', () => {
        console.log('Audio ended gang');
    });

    return audioCtx; // Return the audio context instance
}

// Animate the canvas for the visualizer
function animate(bufferLength, dataArray, bands) {
    const barWidth = (canvas.width) / (canvas.width-bufferLength);
    let barHeight;
    let x = 0;
    requestAnimationFrame(() => animate(bufferLength, dataArray, bands)); //Request the next frame first
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    if (!toggleMenu.classList.contains('active')) {
        analyser.getByteFrequencyData(dataArray); // Get the latest data

        const bassLevel = getAvgVolume(dataArray, bands.bass);
        const midLevel = getAvgVolume(dataArray, bands.mids);
        const trebleLevel = getAvgVolume(dataArray, bands.treble);
        const highLevel = getAvgVolume(dataArray, bands.highs);
        
        drawVisualizer(bassLevel); //Draw the visualizer
    }
}

// Draw the visualizer on the canvas
function drawVisualizer(bassLevel) {
    // The existing canvas drawing code uses bufferLength, dataArray, barWidth, barHeight, and x
    // which are not passed to this function anymore.
    // I need to re-introduce these variables or adapt the drawing logic.
    // Given the user wants "Canvas-based visualizer with frequency analysis",
    // I will assume the original canvas drawing logic should be used,
    // and bassLevel should influence it.

    // Re-introducing necessary variables for the canvas drawing
    const barWidth = (canvas.width) / (canvas.width - bufferLength);
    let barHeight;
    let x = 0;

    for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 1.4 * (1 + bassLevel / 255); // Scale by bassLevel
        let y = 2;
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(i * Math.PI / 45);
        const red = 220;
        const green = 210;
        const blue = 220;
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue}, 28%)`;
        ctx.fillRect(0, 0, barWidth, barHeight);
        x += barWidth;
        ctx.restore();
    }

    for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 1.4 * (1 + bassLevel / 255); // Scale by bassLevel
        let y = 8;
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(i * Math.PI / 33);
        const red = 255;
        const green = 250;
        const blue = 230;
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue}, 100%)`;
        ctx.fillRect(barWidth+y, barHeight+y, 1, 1);
        x += barWidth;
        ctx.restore();
    }
}



 // for(let i = 0; i < bufferLength; i++) {
    //     barHeight = dataArray[i] * 2;
    //     ctx.save();
    //     ctx.translate(canvas.width/2, canvas.height/2);
    //     ctx.rotate(i * Math.PI / -90);
    //     const red = i * barHeight / 20;
    //     const green = i;
    //     const blue = i * barHeight / 3;
    //     ctx.fillStyle = 'rgb(' + red + ',' + green + ', ' + blue + ')';
    //     ctx.fillRect(0, 0, barWidth, barHeight);
    //     x += barWidth;
    //     ctx.restore();
    // }

    // for(let i = 0; i < bufferLength; i++) {
    //     barHeight = dataArray[i] * 2;
    //     const red = i * barHeight / 20;
    //     const green = i * 4;
    //     const blue = barHeight / 3;
    //     ctx.fillStyle = 'rgb(' + red + ',' + green + ', ' + blue + ')';
    //     ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    //     x += barWidth;
    // }