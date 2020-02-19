/**
 * Shuffles array in place. (From https://stackoverflow.com/a/6274381/978525)
 * @param {Array} a items An array containing the items.
 * @return {void}
 */
export const shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const x = a[i]
    a[i] = a[j]
    a[j] = x
  }
}

/** Make an array of given size initialized with elements x(i)
 * @param n size of array to create
 * @returns {(x:(number)=>void) => Array}
 */
export const makeArray = n => x => [...Array(n)].map((_, i) => x(i))

/** Make a stats object
 * @returns {{put: (number)=>void, toString: ()=>string}}
*/
export const Stats = () => {
  let n = 0
  let sum = 0
  let sumSq = 0

  const put = x => {
    ++n
    sum += x
    sumSq += x * x
  }

  const toString = () =>
      `mean=${sum / n} stdev=${Math.sqrt(sumSq / (n - 1))}`

  return { put, toString }
}
