#! /usr/bin/env node

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const { spawn } = require('child_process')

async function main() {
    const packageJsonFile = await readFile(resolve('./package.json'), {
        encoding: 'utf-8'
    })
    const packageJson = JSON.parse(packageJsonFile)

    const dependencies = Object.keys(packageJson.dependencies ?? {})
    const devDependencies = Object.keys(packageJson.devDependencies ?? {})

    await execPromise('npm i ' + dependencies.map(n => n + '@latest').join(' '))
    await execPromise('npm i -D ' + devDependencies.map(n => n + '@latest').join(' '))
}

async function execPromise(command) {
    const exec = command.split(' ')[0]
    const args = command.split(' ').slice(1)
    return new Promise((resolve) => {
        const proc = spawn(exec, args)
        proc.stdout.pipe(process.stdout)
        proc.stderr.pipe(process.stderr)
        proc.on('exit', () => {
            resolve()
        })
    })
}

main()
