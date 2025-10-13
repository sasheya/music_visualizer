# 🎵 WaveVibe - Interactive 3D Music Visualizer

Transform your music into stunning 3D visualizations. WaveVibe is a real-time music visualization platform that brings your Spotify music to life through mesmerizing 3D graphics.

## Features

- Real-time 3D visualization of music
- Seamless Spotify integration
- Dynamic beat and frequency analysis
- Responsive visual effects
- Interactive camera controls
- Cross-platform compatibility

## Live Demo

[Check out WaveVibe in action](#) _(Coming soon)_

## Tech Stack

### Frontend

- Three.js for 3D graphics
- Vite for blazing-fast development
- Vanilla JavaScript for pure performance
- Web Audio API for sound analysis

### Backend

- Django REST framework
- Spotify Web API
- SQLite for development
- Session-based authentication

## Prerequisites

Before you begin, ensure you have:

- Node.js (v14 or higher)
- Python 3.8+
- A Spotify Premium account
- Spotify Developer credentials

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/wavevibe.git
   cd wavevibe
   ```

2. **Set up the frontend**

   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Set up the backend**

   ```bash
   cd server/spotify_auth
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   ```

4. **Configure environment variables**
   Create a `.env` file in the server directory:

   ```env
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/callback/
   ```

5. **Start the development server**
   ```bash
   python manage.py runserver
   ```

## Usage

1. Visit `http://localhost:5173` in your browser
2. Click "Login with Spotify"
3. Grant the required permissions
4. Select a track to play
5. Experience your music in 3D!

<!-- ## Visualization Modes

- **Spectrum Mode**: Classic frequency visualization
- **Particle Mode**: Dynamic particle system reacting to beats
- **Terrain Mode**: Morphing landscape based on music intensity
- **Custom Mode**: Create your own visualization patterns -->

## Configuration

Customize your experience through the settings panel:

- Camera angle and distance
- Color schemes
- Visualization sensitivity
- Performance settings

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Three.js](https://threejs.org/) for 3D graphics
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for music integration
- [Django](https://www.djangoproject.com/) for backend support

---

<p align="center">
Made with ❤️ for music lovers everywhere
</p>
