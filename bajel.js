import bajelfile from './bajelfile.js'
import fs from 'fs'

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

/**
 * @param {string} indent prefix for log messages
 * @param {string} target being built
 * @returns {number} timestamp in ms of latest file change
 * */
const recurse = async (indent, target) => {
  const targetTime = await timestamp(target)
  const task = bajelfile[target] || {}
  if (!task.exec && !task.deps && targetTime === 0) {
    console.warn(indent, `No target "${target}"`)
    return
  }
  if (task.exec || task.deps) {
    console.log(indent, target, ago(targetTime))
  }
  const lastDepsTime = task.deps
    ? task.deps.reduce(
      async (latest, dep) => Math.max(latest, await recurse(indent + `${target}|`, dep)),
      0)
    : 0
  if (task.exec) {
    if (targetTime > 0 && lastDepsTime < targetTime) {
      console.log(indent, 'UP TO DATE')
    } else {
      console.log(indent, '+', task.exec({ target }))
    }
  }
  const updatedTime = Math.max(lastDepsTime, await timestamp(target))
  console.log(indent, 'updated time', ago(targetTime))
  return updatedTime
}

recurse('|', start)
