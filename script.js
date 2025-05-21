// const button1 = document.getElementById('button1')
const audioFile = document.getElementById('audio-input')
const audioPlayer = document.getElementById('audio-player')
let audioURL = null

const audioCtx = new AudioContext()

const container = document.getElementById('container')
const canvas = document.getElementById('canvas-sound')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d')
let audioSource
let analyser


audioFile.addEventListener('change', (event) => {
    const file = event.target.files[0]
    if (!file) return 

    if(audioURL) {
        URL.revokeObjectURL(audioURL)
    }

    audioURL = URL.createObjectURL(file)
        audioPlayer.src = audioURL
})

// button1.addEventListener('click', () => {
//     if (audioPlayer.src) {
//         audioPlayer.play().catch(e => console.error('Error playing audio:', e))
//         audioPlayer.addEventListener('playing', function() {
//             console.log('Audio is playing')
//         })
//         audioPlayer.addEventListener('ended', function() {
//             console.log('Audio has ended')
//         })
//     }
//     else {
//         console.alert('Upload an audio file first')
//     }
        
// })

container.addEventListener('click', () => {
    audioPlayer.play()
    audioSource = audioCtx.createMediaElementSource(audioPlayer)
    analyser = audioCtx.createAnalyser()
    audioSource.connect(analyser)
    analyser.connect(audioCtx.destination)
    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const barWidth = canvas.width/bufferLength
    let barHeight
    let x

    function animate() {
        x = 0
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        analyser.getByteFrequencyData(dataArray) 
        for(let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i]
            ctx.fillStlye = 'white'
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
            x += barWidth
        }
        requestAnimationFrame(animate)
    }
    animate()
})


