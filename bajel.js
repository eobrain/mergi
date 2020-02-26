import bajelfile from './bajelfile.js'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const timestamp = path =>
  fs.promises.stat(path)
    .then(s => s.mtimeMs)
    .catch(e => 0)

const start = process.argv.length > 2
  ? process.argv[2]
  : Object.keys(bajelfile)[0]

const now = Date.now()
const ago = (t) => {
  if (t === 0) {
    return 'missing'
  }
  const ms = now - t
  if (ms < 1000) {
    return `${ms}ms ago`
  }
  const s = ms / 1000
  if (s < 60) {
    return `${s}s ago`
  }
  const min = s / 60
  if (min < 60) {
    return `${min} min ago`
  }
  const hour = min / 60
  if (hour < 24) {
    return `${hour} hours ago`
  }
  const day = hour / 24
  return `${day} days ago`
}

const shellTrim = cmd => cmd.split('\n').map(s => s.trim()).join('\n')

const printAndExec = (indent, cmd) => new Promise(resolve => {
  const trimmed = shellTrim(cmd)

  console.log(indent, '+', trimmed)
  const process = spawn(trimmed, [], { shell: true })
  process.stdout.on('data', data => { console.log(data.toString()) })
  process.stderr.on('data', data => { console.error(data.toString()) })
  process.on('exit', code => {
    if (code !== 0) {
      console.error(indent, `FAILED with code ${code}: \n${trimmed}\n`)
    }
    resolve(code === 0)
  })
})

/**
 * @param {string} indent prefix for log messages
 * @param {string} target being built
 * @returns {[succeeded, number]} whether succeeded and timestamp in ms of latest file change
 * */
const recurse = async (indent, target) => {
  const targetTime = await timestamp(target)
  const task = bajelfile[target] || {}
  if (!task.exec && !task.deps && targetTime === 0) {
    console.warn(indent, `No target "${target}"`)
    return [false]
  }
  /* if (task.exec || task.deps) {
    console.log(indent, target, ago(targetTime))
  } */
  const deps = task.deps || []
  let lastDepsTime = 0
  for (let i = 0; i < deps.length; ++i) {
    const [depSuccess, depTime] = await recurse(indent + `${target}|`, deps[i])
    if (!depSuccess) {
      return [depSuccess]
    }
    if (depTime > lastDepsTime) {
      lastDepsTime = depTime
    }
  }
  if (task.exec) {
    if (targetTime > 0 && lastDepsTime < targetTime) {
      // console.log(indent, 'UP TO DATE')
    } else {
      const source = deps.length > 0 ? deps[0] : '***no-source***'
      const success = await printAndExec(indent, task.exec({ source, target }))
      if (!success) {
        console.error(indent, 'FAILED', task)
        return [success]
      }
    }
  }
  const updatedTime = Math.max(lastDepsTime, await timestamp(target))
  // console.log(indent, 'SUCCESS, Updated time', ago(targetTime))
  return [true, updatedTime]
}

// shoutout https://medium.com/@allenhwkim/nodejs-walk-directory-f30a2d8f038f
const walkDir = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f)
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback)
    } else {
      callback(path.join(dir, f))
    }
  })
}

const expandDeps = () => {
  const files = []
  walkDir('.', f => { files.push(f) })
  const toAdd = {}
  const toRemove = []
  for (const target in bajelfile) {
    const task = bajelfile[target]
    const deps = task.deps || []
    let expanded = false
    for (const dep of deps) {
      if ((typeof dep) === 'object') { // regexp
        for (const file of files) {
          const match = file.match(dep)
          if (match) {
            expanded = true
            const group = match[1]
            const expand = s => s.replace('$1', group)
            const expandedTarget = expand(target)
            toAdd[expandedTarget] = {
              deps: deps.map(d => d === dep ? file : d),
              exec: c => expand(task.exec(c))
            }
          }
        }
      }
    }
    if (expanded) {
      toRemove.push(target)
    }
  }
  toRemove.forEach(target => { delete bajelfile[target] })
  for (const target in toAdd) {
    bajelfile[target] = toAdd[target]
  }
}

const main = async () => {
  expandDeps()
  const [success, timestamp] = await recurse('|', start)
  if (success) {
    console.log('Execution succeeded. Latest file:', ago(timestamp))
  } else {
    console.error('Execution failed.')
  }
}

main()
