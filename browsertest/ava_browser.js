/* global performance */

let failCount = 0
let testCount = 0

document.body.innerHTML += `
<style>
  .info {color: green}
  .warning {color: orange}
  .error {color: red}
</style>
<table id="log">
  <tr>
    <th>Level</th>
    <th>File</th>
    <th>Test</th>
    <th>Result</th>
    <th>Assertions</th>
    <th></th>
  </tr>
</table>
<p id="summary"></p>
`

export default (testFile) => {
  const testNameSet = {}
  return (name, callback) => {
    const logEl = document.getElementById('log')
    const summaryEl = document.getElementById('summary')
    let failed = false
    let assertionCount = 0

    const log = (level, message) => {
      logEl.innerHTML += `
      <tr class="${level}">
      <td>${level}</td>
      <td>${testFile}</td>
      <td>${name}</td>
      <td>${failed ? 'FAILED' : 'PASSED'}</td>
      <td>${assertionCount}</td>
      <td>${message}</td>
      </tr>`
      summaryEl.innerHTML = `${failCount} failures in ${testCount} tests`
    }

    if (testNameSet[name]) {
      log('error', `Duplicate test title: ${name}`)
      failed = true
    }
    testNameSet[name] = true

    const baseAssert = (shouldBeTrue, errorMessage) => {
      ++assertionCount
      if (!shouldBeTrue) {
        failed = true
        log('error', errorMessage)
      }
    }

    const assertEqual = (value, expected, message) => {
      baseAssert(value === expected, `${name}: ${message} value is not === ${expected}`)
    }

    class T {
      false (value, message = 'test failed') {
        assertEqual(false, value, message)
      }

      true (value, message = 'test failed') {
        assertEqual(true, value, message)
      }

      truthy (value, message = 'test failed') {
        baseAssert(value,
          `${message} -- value <code>${JSON.stringify(value)}</code> is not truthy`)
      }

      is (value, expected, message = 'test failed') {
        baseAssert(
          Object.is(value, expected),
          `${message} -- ${value} is not ${expected}`)
      }

      deepEqual (value, expected, message = 'test failed') {
        const valueS = JSON.stringify(value)
        const expectedS = JSON.stringify(expected)
        baseAssert(
          valueS === expectedS,
          `${message} -- <code>${valueS}</code> is not equal to <code>${expectedS}</code>`)
      }

      pass () {}
    }

    try {
      const t = new T(name)
      const start = performance.now()

      callback(t)

      const end = performance.now()
      log('info', end - start)
    } catch (e) {
      failed = true
      log('error', e)
    }
    ++testCount
    if (failed) {
      ++failCount
    }
  }
}
