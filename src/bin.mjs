#!/usr/bin/env node

import cli from '@magic/cli'

import run from './index.mjs'

const opts = {
  options: [
    ['--dir', '-d'],
    ['--host', '-n'],
    ['--port', '-p'],
  ],
  default: {
    '--dir': 'api',
    '--host': '0.0.0.0',
    '--port': 2351,
  },
  single: ['--dir', '--host', '--port'],
  help: {
    name: 'gas: grundstein api server',
    header: 'serves prebuilt magic apis from a directory.',
    options: {
      '--dir': 'api root directory',
      '--host': 'hostname to listen to, default 0.0.0.0 - all interfaces',
      '--port': 'port, default 2351',
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
