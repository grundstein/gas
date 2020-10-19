#!/usr/bin/env node

import { cli } from '@grundstein/commons'

import run from './index.mjs'

const opts = {
  options: [
    ['--dir', '-d'],
    ['--host', '--ip', '-H'],
    ['--port', '-p'],
    ['--cert-dir', '--cert', '-c'],
  ],
  default: {
    '--dir': '/var/www/api',
    '--host': '0.0.0.0',
    '--port': 2351,
    '--cert-dir': '/home/grundstein/ca',
  },
  single: ['--dir', '--host', '--port', '--cert-dir'],
  help: {
    name: 'gas: grundstein api server',
    header: 'serves prebuilt magic apis from a directory.',
    options: {
      '--dir': 'api root directory',
      '--host': 'hostname to listen to',
      '--port': 'port to listen to',
      '--cert-dir': 'ca directory',
    },
    example: `
# serve files in /var/www/api:
gas

# serve files using a local path, custom host and port.
gas --dir api --host api.grundstein.it --port 2323
`,
  },
}

const { args } = cli(opts)

run(args)
