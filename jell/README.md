# jell

Minimal JavaScript shell inspired by google/zx.

```
#! /usr/bin/env/jell

await $`echo "Hello, world!"`
```

```
$ jell -e "$\`echo Hello, world\`"
$ jell -e "return 'Hello, world'"
```

## Installation

```
sudo curl -sSf -o /usr/local/bin/jell https://raw.githubusercontent.com/comame/jell/main/jell

sudo chmod 755 /usr/local/bin/jell
```

## Usage

### ``$`command` ``

Executes command asynchronously. Resolves stdout.

```
const ls = await $`ls`
```

### `path`

Node.js `path` module.

### `env`

Represents environment variables.

```
env.FOO = 'bar'
await $`echo $FOO`
```

### `cd(path)`

Changes working directory.

```
cd('~/foo')
await $`pwd` // -> /home/user/foo
```

### `args()`

Returns command-line arguments.

```
// $ jell path/to/script foo bar
args() // -> [ 'foo', 'bar' ]
```

### `async stdin()`

Reads stdin as string.

```
const input = await stdin()
```

### `silent(bool = true)`

By calling `silent()`, `$` stops write its output to stdout. `silent(false)` reverts this behavior.

```
await $`echo Hello`
silent()
await $`echo Hello`
silent(false)
await $`echo Hello`
```
