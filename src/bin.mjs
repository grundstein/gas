#!/usr/bin/env node

import http2 from 'node:http2'

import { cli } from '@grundstein/commons'

import run from './index.mjs'

const {
  HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN,
  HTTP2_HEADER_ACCESS_CONTROL_ALLOW_HEADERS,
  HTTP2_HEADER_ORIGIN,
  HTTP2_HEADER_CONTENT_TYPE,
  HTTP2_HEADER_ACCEPT,
} = http2.constants

const opts = {
  options: [
    ['--dir', '-d'],
    ['--host', '--ip', '-H'],
    ['--port', '-p'],
    ['--cert-dir', '--cert', '-c'],
    '--cors-origin',
    '--cors-headers',
  ],
  default: {
    '--dir': '/var/www/api',
    '--host': '0.0.0.0',
    '--port': 2351,
    '--cert-dir': '/home/grundstein/ca',
    '--cors-origin': '*',
    '--cors-headers': `${HTTP2_HEADER_ORIGIN}, x-requested-with, ${HTTP2_HEADER_CONTENT_TYPE}, ${HTTP2_HEADER_ACCEPT}`,
  },
  single: ['--dir', '--host', '--port', '--cert-dir', '--cors-origin', '--cors-headers'],
  help: {
    name: 'gas: grundstein api server',
    header: 'serves prebuilt magic apis from a directory.',
    options: {
      '--dir': 'api root directory',
      '--host': 'hostname to listen to',
      '--port': 'port to listen to',
      '--cert-dir': 'ca directory',
      '--cors-origin': `value of the ${HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN} http header`,
      '--cors-headers': `value of the ${HTTP2_HEADER_ACCESS_CONTROL_ALLOW_HEADERS} http header`,
    },
    example: `
# serve files in /var/www/api:
gas

# serve files using a local path, custom host and port.
gas --dir api --host api.grundstein.it --port 2323 --cert-dir node_modules/@grundstein/commons/src/certificates
`,
  },
}

const { args } = cli(opts)

run(args)
