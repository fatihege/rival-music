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
    APP_NAME: 'Rival Music',
    SEPARATOR: '—',
    ACCENT_COLOR: '#00ff78',
    API_URL: process.env.API_URL,
    IMAGE_CDN: `${process.env.API_URL}/uploads`,
    APP_URL: process.env.APP_URL,
    PP_FILETYPES: ['image/png', 'image/jpg', 'image/jpeg'],
    PP_MAXSIZE: 5000000,
    SHOW_ADMIN_BADGE: true,
    IS_DEV_BADGE: true,
  },
}

module.exports = nextConfig
