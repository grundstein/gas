#!/usr/bin/env node

import cli from '@magic/cli'

import run from './index.mjs'

const args = {
  options: [
    ['--dir', '-d'],
    ['--host', '-n'],
    ['--port', '-p'],
  ],
  default: {
    '--dir': 'api',
    '--host': '127.0.0.1',
    '--port': 2323,
  },
  single: ['--dir', '--host', '--port'],
  help: {
    name: 'magic api server',
    header: 'serves prebuilt magic apis from a directory.',
    options: {
      '--dir': 'api root directory',
      '--host': 'hostname to listen to, default 127.0.0.1',
      '--port': 'port, default 8080',
    },
    example: `
# serve files in ./api:
gas

# serve files using an absolute path, custom host and port.
gas --dir /api --host grundstein --port 8080
`,
  },
}

const res = cli(args)

run(res)
