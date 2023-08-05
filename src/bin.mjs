#!/usr/bin/env node

import { cli, constants, lib } from '@grundstein/commons'

import { defaults } from './defaults.mjs'

import run from './index.mjs'

const { HTTP2_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN, HTTP2_HEADER_ACCESS_CONTROL_ALLOW_HEADERS } =
  constants

const {
  GAS_DIR = defaults.dir,
  GAS_HOST = defaults.host,
  GAS_PORT = defaults.port,
  GAS_CERT_DIR = defaults.certDir,
  GAS_CORS_ORIGIN = defaults.corsOrigin,
  GAS_CORS_HEADERS = defaults.corsHeaders,
  GRUNDSTEIN_CERT_DIR = defaults.certDir,
} = await lib.addEnv()

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
    '--dir': GAS_DIR,
    '--host': GAS_HOST,
    '--port': GAS_PORT,
    '--cert-dir': GAS_CERT_DIR,
    '--cors-origin': GAS_CORS_ORIGIN,
    '--cors-headers': GAS_CORS_HEADERS,
    '--cert-dir': GRUNDSTEIN_CERT_DIR,
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
