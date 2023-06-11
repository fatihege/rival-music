require('dotenv').config()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpackDevMiddleware: config => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
  env: {
    API_URL: process.env.API_URL || 'https://rival-music-api.fatxh.repl.co',
  },
}

module.exports = nextConfig
