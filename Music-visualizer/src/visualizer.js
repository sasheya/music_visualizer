// Create an audio context using the Web Audio API
const audioCtx = new AudioContext() 
const canvas = document.getElementById('canvas-sound')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d')
let audioSource
let analyser

// Set up the audio nodes and event listeners for the visualizer
// This function is called from player.js with the audio element
export function initVisualizer(audioElement) {
    // Setup audio nodes if not already done
    if(!audioSource) {
        audioSource = audioCtx.createMediaElementSource(audioElement) // Use the audio element
        analyser = audioCtx.createAnalyser()
        audioSource.connect(analyser)
        analyser.connect(audioCtx.destination)
        analyser.fftSize = 1024
        console.log('Audiosource:', audioSource)
    }

    // Start visualizer when the audio begins
    audioElement.addEventListener('playing', () => {
        animate()
    })

    // Log when audio ends
    audioElement.addEventListener('ended', () => {
        console.log('Audio ended gang');
    });

    return audioCtx; // Return the audio context instance
}


// Animate the canvas for the visualizer
function animate() {
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const barWidth = (canvas.width) / bufferLength
    let barHeight
    let x = 0
    requestAnimationFrame(animate) //Request the next frame first
    ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear the canvas
    analyser.getByteFrequencyData(dataArray) // Get the latest data
    drawVisualizer(bufferLength, x, barWidth, barHeight, dataArray) //Draw the visualizer
}

// Draw the visualizer on the canvas
function drawVisualizer(bufferLength, x, barWidth, barHeight, dataArray) {
    for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 2
        ctx.save()
        ctx.translate(canvas.width/2, canvas.height/2)
        ctx.rotate(i * Math.PI / 45)
        const red = i * barHeight / 20
        const green = i
        const blue = i * barHeight / 3
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`
        ctx.fillRect(0, 0, barWidth, barHeight)
        x += barWidth
        ctx.restore()
    }

    // for(let i = 0; i < bufferLength; i++) {
    //     barHeight = dataArray[i] * 2
    //     ctx.save()
    //     ctx.translate(canvas.width/2, canvas.height/2)
    //     ctx.rotate(i * Math.PI / -90)
    //     const red = i * barHeight / 20
    //     const green = i * 4
    //     const blue = barHeight / 3
    //     ctx.fillStyle = 'rgb(' + red + ',' + green + ', ' + blue + ')'
    //     ctx.fillRect(0, 0, barWidth, barHeight)
    //     x += barWidth
    //     ctx.restore()
    // }


    // for(let i = 0; i < bufferLength; i++) {
    //     barHeight = dataArray[i] * 2
    //     const red = i * barHeight / 20
    //     const green = i * 4
    //     const blue = barHeight / 3
    //     ctx.fillStyle = 'rgb(' + red + ',' + green + ', ' + blue + ')'
    //     ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
    //     x += barWidth
    // }


}
