import { toggleMenu } from './player.js';
import * as THREE from 'three';

const audioCtx = new AudioContext();
let audioSource;
let analyser;
let bufferLength;
let dataArray;
let sampleRate;
let binSize;
let bands;

// Set up the audio nodes and event listeners for the visualizer
// This function is called from player.js with the audio element
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

function getBandIndices(minHz, maxHz, binSize) {
    const start = Math.floor(minHz / binSize);
    const end = Math.floor(maxHz / binSize);
    return [start, end];
}

    // Start visualizer when the audio begins
    audioElement.addEventListener('playing', () => {
        animate(bands);
    })

    // Log when audio ends
    audioElement.addEventListener('ended', () => {
        console.log('Audio ended gang');
    });

    return audioCtx; // Return the audio context instance
}

function getAvgVolume(dataArray, [start, end]) {
    let sum = 0;
    for(let i = start; i < end; i++) {
        sum += dataArray[i];
    }
    return sum / (end - start);
}

// Animate the canvas for the visualizer
function animate(bands) {
    requestAnimationFrame(() => animate(bands)); //Request the next frame first

    if (!toggleMenu.classList.contains('active')) {
        analyser.getByteFrequencyData(dataArray); // Get the latest data

        const bassLevel = getAvgVolume(dataArray, bands.bass);
        const midLevel = getAvgVolume(dataArray, bands.mids);
        const trebleLevel = getAvgVolume(dataArray, bands.treble);
        const highLevel = getAvgVolume(dataArray, bands.highs);
        
        drawVisualizer(bassLevel); //Draw the visualizer
    }
}

function drawVisualizer(bassLevel) {
    const canvas = document.querySelector('#canvas-sound');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 1000;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 120;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const radius = 50;
    const widthSegments = 7;
    const heightSegments = 7;

    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.PointsMaterial({
        color: 'red',
        size: 1,
    });

    const points = new THREE.Points(geometry, material);
    points.scale.set(bassLevel / 100, bassLevel / 100, bassLevel / 100);
    scene.add(points);

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    function render(time) {
        time *= 0.001;

        points.rotation.x = time;
        points.rotation.y = time;

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

