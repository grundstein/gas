import path from 'node:path'

import { constants } from '@grundstein/commons'

const { HTTP2_HEADER_ORIGIN, HTTP2_HEADER_CONTENT_TYPE, HTTP2_HEADER_ACCEPT } = constants

export const defaults = {
  dir: '/var/www/api',
  host: '0.0.0.0',
  port: 2351,
  certDir: '/home/grundstein/certs',
  corsOrigin: '*',
  corsHeaders: `${HTTP2_HEADER_ORIGIN}, x-requested-with, ${HTTP2_HEADER_CONTENT_TYPE}, ${HTTP2_HEADER_ACCEPT}`,
}
