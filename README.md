# Rival Music (Development)

This application is a web application that allows users to search, play, and share music of different genres. This application is currently under development.

**Note:** The application's API (`server` folder) and client-side contexts (`client/src/contexts` folder) are no longer open source.

## Technologies

This application is built using MERN (MongoDB, Express.js, React.js, Node.js) stack and a Server Side Rendering (SSR) framework such as Next.js. Additionally, Redis is used for caching and improving performance.

* **MongoDB** - NoSQL database is used.
* **Express.js** - Server-side web application framework is used.
* **React.js** - Used for building user interfaces.
* **Node.js** - Used for running server-side logic.
* **Next.js** - Used for server-side rendering.
* **Redis** - In-memory data store used for caching.
* **MiniSearch** - Used for full-text search capabilities.

## Installation

### Manual Installation

To run this application on your local machine, follow the below steps:

1. Clone this repository: `git clone https://github.com/fatihege/rival-music.git`
2. Navigate to the project directory: `cd rival-music/server` for server-side, `cd rival-music/client` for client-side
3. Update NPM config: `npm config set legacy-peer-deps true`
4. Install the required dependencies: `npm install`
5. To start the development server: `npm run dev`

The application will be running at `localhost:3000`.

### Docker Installation

To run this application on your local machine using Docker, follow the below steps:

1. Clone this repository: `git clone https://github.com/fatihege/rival-music.git`
2. Navigate to the project directory: `cd rival-music`
3. Build the Docker image: `docker compose build`
4. Run the Docker container: `docker compose up`

The application will be running at `localhost:3000`.

## User Endpoints

| Endpoint               | Description                                    | Finished |
|------------------------|------------------------------------------------|:--------:|
| GET /                  | Home page                                      |    ✅    |
| GET /explore           | Explore music genres and search for everything |    ✅    |
| GET /genre/:genre      | A genre with the given tag                     |    ✅    |
| GET /library           | User's library of saved songs and playlists    |    ✅    |
| GET /library/playlists | User's liked and created playlists             |    ✅    |
| GET /library/tracks    | User's liked tracks                            |    ✅    |
| GET /library/albums    | User's liked albums                            |    ✅    |
| GET /playlist/:id      | A playlist with the given ID                   |    ✅    |
| GET /artist/:id        | An artist with the given ID                    |    ✅    |
| GET /album/:id         | Album page with the given ID                   |    ✅    |
| GET /profile           | Users profile                                  |    ✅    |

## Support
You can support this project by starring ⭐, sharing 📲, and contributing 👩‍💻

And also you can support me by buying me a coffee ☕️

[![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/fatihege)

## License

This project is licensed under the [MIT License](LICENSE).

