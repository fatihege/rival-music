require('dotenv').config()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, context) => {
    if(process.env.NEXT_WEBPACK_USEPOLLING) {
      config.watchOptions = {
        poll: 500,
        aggregateTimeout: 300
      }
    }
    return config
  },
  env: {
    API_URL: process.env.API_URL,
  },
}

module.exports = nextConfig
