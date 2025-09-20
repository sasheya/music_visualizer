import { toggleMenu } from "./player.js";
import * as THREE from "three";
import vertexShader from "./shaders/ripple.vert?raw";
import fragmentShader from "./shaders/ripple.frag?raw";
import { GUI } from "dat.gui";

const audioCtx = new AudioContext();
let audioSource;
let analyser;
let bufferLength;
let dataArray;
let sampleRate;
let binSize;
let bands;
let uniforms; // Declare uniforms globally
let lastTriggerTime = 0.0; // Declare lastTriggerTime globally

// Three.js global variables
let renderer, camera, scene, mesh, material, gui, settings;

// Set up the audio nodes and event listeners for the visualizer
// This function is called from player.js with the audio element
export function initVisualizer(audioElement) {
  // Setup audio nodes if not already done
  if (!audioSource) {
    audioSource = audioCtx.createMediaElementSource(audioElement); // Use the audio element
    analyser = audioCtx.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 1024;
    console.log("Audiosource:", audioSource);
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    sampleRate = audioCtx.sampleRate;
    binSize = sampleRate / 2 / bufferLength;

    bands = {
      bass: getBandIndices(20, 250, binSize),
      mids: getBandIndices(250, 2000, binSize),
      treble: getBandIndices(2000, 6000, binSize),
      highs: getBandIndices(6000, 20000, binSize),
    };
  }

  setupThreeScene(); // Initialize Three.js scene

  function getBandIndices(minHz, maxHz, binSize) {
    const start = Math.floor(minHz / binSize);
    const end = Math.floor(maxHz / binSize);
    return [start, end];
  }

  // Start visualizer when the audio begins
  audioElement.addEventListener("playing", () => {
    animate(bands);
  });

  // Log when audio ends
  audioElement.addEventListener("ended", () => {
    console.log("Audio ended gang");
  });

  return audioCtx; // Return the audio context instance
}

function getAvgVolume(dataArray, [start, end]) {
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += dataArray[i];
  }
  return sum / (end - start);
}

// Setup Three.js scene and objects
function setupThreeScene() {
  const canvas = document.querySelector("#canvas-sound");
  const context = canvas.getContext("webgl2", {
    powerPreference: "high-performance",
    resetNotificationStrategy: "lose-context",
  });
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    context,
  });

  // Set canvas dimensions
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const fov = 75;
  const aspect = window.innerWidth / window.innerHeight; // Use actual aspect ratio
  const near = 0.1;
  const far = 1000;

  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 120;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  uniforms = {
    rippleColor: { value: new THREE.Color(0x00aaff) },
    rippleCenter: { value: new THREE.Vector2(0.5, 0.5) },
    rippleSize: { value: 1.0 }, // Placeholder, gets updated per frame
    rippleSpeed: { value: 1.0 },
    rippleStartTime: { value: 0.0 },
    time: { value: 0.0 },
    resolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
  };

  const geometry = new THREE.PlaneGeometry(2, 2);
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
  });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  gui = new GUI();

  // Control rippleColor directly
  gui
    .addColor(uniforms.rippleColor, "value")
    .name("Ripple Color")
    .onChange((val) => {
      uniforms.rippleColor.value.set(val);
    });

  // Control rippleSize directly
  gui.add(uniforms.rippleSize, "value", 0.1, 5.0).name("Ripple Size");

  // Control rippleSpeed directly
  gui.add(uniforms.rippleSpeed, "value", 0.1, 10.0).name("Ripple Speed");

  // Handle window resizing
  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    uniforms.resolution.value.set(width, height);
  });
}

// Animate the canvas for the visualizer
function animate(bands) {
  requestAnimationFrame(() => animate(bands)); //Request the next frame first

  uniforms.time.value += 0.01; // Update time uniform
  renderer.render(scene, camera); // Render the scene

  if (!toggleMenu.classList.contains("active")) {
    analyser.getByteFrequencyData(dataArray); // Get the latest data

    const bassLevel = getAvgVolume(dataArray, bands.bass);
    const midLevel = getAvgVolume(dataArray, bands.mids);
    const trebleLevel = getAvgVolume(dataArray, bands.treble);
    const highLevel = getAvgVolume(dataArray, bands.highs);

    const normBass = bassLevel / 255;
    const normMids = midLevel / 255;
    const normTreble = trebleLevel / 255;
    const normHigh = highLevel / 255;

    uniforms.rippleSize.value = normMids * 2.0; // Scale if needed
    uniforms.rippleSpeed.value = normTreble * 5.0; // Make it visually obvious

    const now = performance.now();
    if (normBass > 0.6 && now - lastTriggerTime > 300 - normBass * 200) {
      lastTriggerTime = now;
      uniforms.rippleStartTime.value = 0.0; // reset ripple
    }
  }
}
