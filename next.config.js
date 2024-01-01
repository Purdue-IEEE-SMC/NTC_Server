/** @type {import('next').NextConfig} */
const path = require('path');
const { withPayload } = require('@payloadcms/next-payload');

const nextConfig = {};

module.exports = withPayload(nextConfig, {
  configPath: path.resolve(__dirname, './payload/payload.config.ts'),
});
