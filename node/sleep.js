// @ts-check

/**
 * @param {number} ms milliseconds to sleep
 * @returns {Promise} promise that resolves after the given time.
 */
export default (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms))
