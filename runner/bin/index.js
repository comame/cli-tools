#! /usr/bin/node

const { resolve } = require('node:path')
const { spawn } = require('node:child_process')
const { argv, stdin, stdout, stderr } = require('node:process')
const { readFileSync } = require('node:fs')

const commands = _readCommands()

const subcommand = argv[2]

switch (subcommand) {
    case 'install':
        install()
        break
    case 'update':
        install()
        break
    case 'uninstall':
        uninstall()
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
    const zipUrl = 'https://github.com/comame/cli-tools/archive/refs/heads/main.zip'
    const tmpCwd = '/tmp/cli-tools'
    const downloadFile = tmpCwd + '/c-runner-download.zip'
    const extractedDir = 'cli-tools-main'

    await _execWithoutStdio(`mkdir -p ${tmpCwd}`)
    await _execWithoutStdio(`curl -sSLf -o ${downloadFile} ${zipUrl}`)
    await _execWithoutStdio(`unzip -o ${downloadFile} 1>/dev/null`, { cwd: tmpCwd })
    await _execWithoutStdio(`rm -rf /usr/local/lib/cli-tools`)
    await _execWithoutStdio(`mv -f ${tmpCwd}/${extractedDir} /usr/local/lib/cli-tools`)
    await _execWithoutStdio(`rm -f /usr/local/bin/c`)
    await _execWithoutStdio(`ln -s /usr/local/lib/cli-tools/runner/bin/index.js /usr/local/bin/c`)

    await _execWithoutStdio(`chown root:root /usr/local/bin/c`)
    await _execWithoutStdio(`chown -R root:root /usr/local/lib/cli-tools`)

    for (const command of Object.keys(commands)) {
        const path = '/usr/local/lib/cli-tools/' + commands[command]
        await _execWithoutStdio(`chmod +x ${path}`)
    }
}

async function uninstall() {
    await _execWithoutStdio(`rm -rf /usr/local/lib/cli-tools`)
    await _execWithoutStdio(`rm /usr/local/bin/c`)
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
        return {}
    }
}

async function _exec(command, opt = undefined) {
    const proc = spawn('/bin/bash', [ '-c', command ], opt)

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
    const proc = spawn('/bin/bash', [ '-c', command ], opt)
    return new Promise((resolve) => {
        proc.on('exit', () => {
            resolve()
        })
    })
}
