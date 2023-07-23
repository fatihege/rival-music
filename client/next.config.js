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
    IMAGE_CDN: `${process.env.API_URL}/image`,
    PP_FILETYPES: ['image/png', 'image/jpg', 'image/jpeg'],
    PP_MAXSIZE: 5000000,
    SHOW_ADMIN_BADGE: true,
  },
}

module.exports = nextConfig
