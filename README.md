## @grundstein/gas

### WIP. NOT IN PRODUCTION, TESTED AND/OR BENCHMARKED YET!

## gas: grundstein api service

### features:

#### api

serves a magic api from a magic api dir.

#### installation

```bash
npm i @grundstein/gas
```

#### usage

```bash
// show full help
gas --help

// serve the ./docs directory as api
gas

// serve specific directory
gas --dir local/directory/path

// serve on specific host and port
gas --host grundstein.it --port 2323
```

#### changelog

##### v0.0.4 - unreleased

##### v0.0.3

- big refactor. add types, add tests.
- update dependencies

##### v0.0.2

use url.pathToFileURL to make windows await import api files correctly

##### v0.0.1

first release
