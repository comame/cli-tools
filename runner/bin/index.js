#! /usr/bin/node

const { resolve } = require('node:path')
const { spawn } = require('node:child_process')
const { argv, stdin, stdout, stderr } = require('node:process')
const { readFileSync } = require('node:fs')
const commands = require('../../commands.json')

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

    await _exec(`mkdir -p ${tmpCwd}`)
    await _exec(`curl -sSLf -o ${downloadFile} ${zipUrl}`)
    await _exec(`unzip -o ${downloadFile} 1>/dev/null`, { cwd: tmpCwd })
    await _exec(`rm -rf /usr/local/lib/cli-tools`)
    await _exec(`mv -f ${tmpCwd}/${extractedDir} /usr/local/lib/cli-tools`)
    await _exec(`rm -f /usr/local/bin/c`)
    await _exec(`ln -s /usr/local/lib/cli-tools/runner/bin/index.js /usr/local/bin/c`)

    await _exec(`chown root:root /usr/local/bin/c`)
    await _exec(`chown -R root:root /usr/local/lib/cli-tools`)

    for (const command of Object.keys(commands)) {
        const path = '/usr/local/lib/cli-tools/' + commands[command]
        await _exec(`chmod +x ${path}`)
    }
}

async function uninstall() {
    await _exec(`rm -rf /usr/local/lib/cli-tools`)
    await _exec(`rm /usr/local/bin/c`)
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
