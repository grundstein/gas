#!/usr/bin/env node

import cli from '@magic/cli'

import run from './index.mjs'

const args = {
  options: [
    ['--help', '-help', 'help', '--h', '-h'],
    // ['--watch', '-w'],
    ['--dir', '--public', '--public-dir', '-p'],
    ['--host', '-h'],
    ['--port', '-p'],
  ],
  default: {
    '--dir': 'api',
    '--host': '127.0.0.1',
    '--port': 8080,
  },
  single: ['--dir', '--host', '--port'],
  help: {
    name: 'magic api server',
    header: 'serves magic apis',
    options: {
      '--dir': 'api root directory',
      '--host': 'internal hostname to listen to, default 127.0.0.1',
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
