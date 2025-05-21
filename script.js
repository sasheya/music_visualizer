    const button1 = document.getElementById('button1')
    const audioFile = document.getElementById('audio-input')
    const audioPlayer = document.getElementById('audio-player')
    const audioCtx = new AudioContext()
    console.log(audioCtx)

    const container = document.getElementById('canvas-container')
    const canvas = document.getElementById('canvas-sound')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')
    let  audioSource
    let analyser
    let audioURL = null

    audioFile.addEventListener('change', (event) => {
        const file = event.target.files[0]
        if (!file) return 

        if(audioURL) {
            URL.revokeObjectURL(audioURL)
        }

        audioURL = URL.createObjectURL(file)
        audioPlayer.src = audioURL
    })

    button1.addEventListener('click', () => {
        if (audioPlayer.src) {
            audioPlayer.play().catch(e => console.error('Error playing audio:', e))
            audioPlayer.addEventListener('playing', function() {
                console.log('Audio is playing')
            })
            audioPlayer.addEventListener('ended', function() {
                console.log('Audio has ended')
            })
        }
        else {
            console.alert('Upload an audio file first')
        }
        
    })




    