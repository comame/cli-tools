#! /usr/bin/env node

const { readFile, writeFile ,rm } = require('fs/promises')
const { resolve } = require('path')
const { spawn } = require('child_process')

async function main() {
    const packageJsonFile = await readFile(resolve('./package.json'), {
        encoding: 'utf-8'
    })
    const packageJson = JSON.parse(packageJsonFile)

    const dependencies = { ...packageJson.dependencies }
    const devDependencies = { ...packageJson.devDependencies }

    await rm(resolve('./node_modules'), {
        force: true,
        recursive: true
    })
    await rm(resolve('./package.json'))
    await rm(resolve('./package-lock.json'), {
        force: true
    })

    delete packageJson.dependencies
    delete packageJson.devDependencies

    await writeFile(
        resolve('./package.json'),
        JSON.stringify(packageJson, undefined, 4),
        { encoding: 'utf-8' }
    )

    await execPromise('npm i ' + Object.keys(dependencies).join(' '))
    await execPromise('npm i -D ' + Object.keys(devDependencies).join(' '))
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
