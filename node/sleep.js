// @ts-check

/**
 * Return promise that resolves after the given time.
 * @param {number} ms milliseconds to sleep
 */
export default (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms))
