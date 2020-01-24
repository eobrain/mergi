// @ts-check

/* global Promise */

/**
 * @param {number} ms milliseconds to sleep
 * @return {Promise} promise that resolves after the given time.
 */
export default (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));
