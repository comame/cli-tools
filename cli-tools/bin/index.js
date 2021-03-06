#! /usr/bin/node

const { resolve } = require('node:path')
const { spawn } = require('node:child_process')
const { argv, stdin, stdout, stderr, exit } = require('node:process')
const { readFileSync } = require('node:fs')

const commands = _readCommands()

const subcommand = argv[2]

switch (subcommand) {
    case 'install':
        install()
        break
    case 'update':
        setupLibDir()
        break
    case 'uninstall':
        uninstall()
        break
    case 'alias':
        alias(argv[3])
        break
    case 'rm':
        unalias(argv[3])
        break
    case 'help':
        help()
        break
    default:
        const path = commands[subcommand]
        if (!path) {
            help()
        } else {
            run(path)
        }
}

function run(path) {
    const cmd = [ resolve(__dirname, '../../', path), ...argv.slice(3)]
        .map(it => `"${it}"`).join(' ')
    _exec(cmd)
}

async function help() {
    console.log(readFileSync(resolve(__dirname, '../docs/help.txt'), { encoding: 'utf8' }))
}

async function install() {
    await uninstall()
    await setupLibDir()
    await alias('cli-tools')
}

async function uninstall() {
    await _execWithoutStdio(`rm -rf ~/.local/lib/cli-tools`)
    for (const command of Object.keys(commands)) {
        await unalias(command)
    }
}

async function setupLibDir() {
    const zipUrl = 'https://github.com/comame/cli-tools/archive/refs/heads/main.zip'
    const tmpCwd = '~/.cli-tools-tmp'
    const downloadFile = tmpCwd + '/c-runner-download.zip'
    const extractedDir = 'cli-tools-main'

    await _execWithoutStdio(`rm -rf ~/.local/lib/cli-tools`)

    await _execWithoutStdio(`mkdir -p ${tmpCwd}`)
    const fetchExitCode = await _execWithoutStdio(`curl -sSLf -o ${downloadFile} ${zipUrl}`)

    if (fetchExitCode !== 0) {
        console.error('failed to fetch')
        exit(1)
    }

    await _execWithoutStdio(`unzip -o ${downloadFile} -d ${tmpCwd} 1>/dev/null`)
    await _execWithoutStdio(`mkdir -p ~/.local/lib`)
    await _execWithoutStdio(`mkdir -p ~/.local/bin`)
    await _execWithoutStdio(`mv -f ${tmpCwd}/${extractedDir} ~/.local/lib/cli-tools`)
    await _execWithoutStdio(`chown -R root:root ~/.local/lib/cli-tools`)

    for (const command of Object.keys(commands)) {
        const path = '~/.local/lib/cli-tools/' + commands[command]
        await _execWithoutStdio(`chmod +x ${path}`)
    }

    await _execWithoutStdio(`rm -rf ${tmpCwd}`)
}

async function alias(command) {
    const path = commands[command]
    if (!path) {
        console.error('subcomment not found')
        exit(1)
    }

    const code = await _execWithoutStdio(`ln -s ~/.local/lib/cli-tools/${path} ~/.local/bin/${command}`)
    await _execWithoutStdio(`chown root:root ~/.local/bin/${command}`)

    if (code !== 0) {
        console.error('permission denied')
        exit(1)
    }
}

async function unalias(command) {
    if (!commands[command]) {
        return
    }

    await _execWithoutStdio(`rm ~/.local/bin/${command}`)
}

function _readCommands() {
    try {
        const commandsFile = readFileSync(
            resolve(__dirname, '../../commands.json'),
            { encoding: 'utf8' }
        )
        const commands = JSON.parse(commandsFile)
        return commands
    } catch {
        return {
            'cli-tools': 'cli-tools/bin/index.js' // Required for initial installation
        }
    }
}

async function _exec(command, opt = undefined) {
    const proc = spawn('bash', [ '-c', command ], opt)

    stdin.pipe(proc.stdin)
    proc.stdout.pipe(stdout)
    proc.stderr.pipe(stderr)

    return new Promise((resolve) => {
        proc.on('exit', () => {
            resolve()
        })
    })
}

async function _execWithoutStdio(command, opt = undefined) {
    const proc = spawn('bash', [ '-c', command ], opt)
    return new Promise((resolve) => {
        proc.on('exit', (code) => {
            resolve(code)
        })
    })
}
