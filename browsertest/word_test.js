import { IndexedWords } from '../src/js/word.js'
import { makeArray } from './_helpers.js'

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

  test('imagesOf few', t => {
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
    t.deepEqual(words.imagesOf('foo'), [
      { width: 111 },
      { width: 222 },
      { width: 333 }
    ])
  })

  test('imagesOf more', t => {
    const words = new IndexedWords('xx', 'yy', [
      {
        lang: 'xx',
        country: 'yy',
        query: 'foo',
        images: makeArray(10)(i => ({ width: 111 }))
      }
    ])
    t.is(words.imagesOf('foo').length, 10)
  })
}
