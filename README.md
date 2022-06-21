## @grundstein/gas

### WIP. NOT IN PRODUCTION, TESTED AND/OR BENCHMARKED YET!

## gas: grundstein api service

### features:

#### api

serves a magic api from a pregenerated magic api bundle.

#### installation
```bash
npm i @grundstein/gas
```

#### usage
```bash
// show full help
gas --help

// serve the ./public directory
gas

// serve specific directory
gas --dir local/directory/path

// serve on specific host and port
gas --host grundstein.it --port 2323
```

#### v0.0.1
first release

#### v0.0.2
use url.pathToFileURL to make windows await import api files correctly
