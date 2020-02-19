import { IndexedWords } from '../src/js/word.js'
import { makeArray, Stats } from './_helpers.js'

/* global performance */

export default test => {
  test('hasImages empty', t => {
    const words = new IndexedWords('xx', 'yy', [])

    t.false(words.hasImages({}))
  })

  test('hasImages one', t => {
    const words = new IndexedWords('xx', 'yy', [
      {
        lang: 'xx',
        country: 'yy',
        query: 'foo',
        images: [{}]
      }
    ])

    t.true(words.hasImages({ phrase: 'foo' }))
  })

  test('forEachImageOf few', t => {
    const words = new IndexedWords('xx', 'yy', [
      {
        lang: 'xx',
        country: 'yy',
        query: 'foo',
        images: [
          { width: 111 },
          { width: 222 },
          { width: 333 }
        ]
      }
    ])
    let count = 0

    words.forEachImageOf('foo', img => {
      ++count
      t.is(img.width, 111 * count)
    })

    t.is(count, 3)
  })

  test('forEachImageOf more', t => {
    const words = new IndexedWords('xx', 'yy', [
      {
        lang: 'xx',
        country: 'yy',
        query: 'foo',
        images: makeArray(10)(i => ({ width: 111 }))
      }
    ])
    let count = 0
    const start = performance.now()

    words.forEachImageOf('foo', img => {
      ++count
    })

    const end = performance.now()
    console.log(`forEachImageOf took ${end - start} ms`)
    t.is(count, 10)
  })

  test('forEachImageOf repeat', t => {
    const words = new IndexedWords('xx', 'yy', [
      {
        lang: 'xx',
        country: 'yy',
        query: 'foo',
        images: makeArray(10)(i => ({ width: 111 }))
      }
    ])
    const stats = Stats()
    for (let i = 0; i < 100000; ++i) {
      let count = 0
      const start = performance.now()

      words.forEachImageOf('foo', img => {
        ++count
      })

      const end = performance.now()
      stats.put(end - start)
      t.is(count, 10)
    }

    console.log(`forEachImageOf stats (ms): ${stats.toString()}`)
  })
}
