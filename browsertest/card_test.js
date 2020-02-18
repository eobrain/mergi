import { merge } from '../src/js/card.js'
import { IndexedWords } from '../src/js/word.js'

const noImages = [
  { foo: 'one', bar: 111 },
  { foo: 'two', bar: 222 },
  { foo: 'three', bar: 333 },
  { foo: 'four', bar: 444 },
  { foo: 'five', bar: 555 }
]

export default (test) => {
  test('merge empty', t => {
    const words = new IndexedWords('xx', 'yy', [])
    t.truthy(words)

    const actual = merge(words, [], [])

    t.deepEqual([], actual)
  })

  test('merge no images', t => {
    const words = new IndexedWords('xx', 'yy', [])
    t.truthy(words)

    const left = merge(words, noImages, [])
    const right = merge(words, [], noImages)
    const both = merge(words, noImages, noImages)

    t.deepEqual([], left)
    t.deepEqual([], right)
    t.deepEqual([], both)
  })

  test('merge one', t => {
    const words = new IndexedWords('xx', 'yy', [
      { query: 'foo', lang: 'xx', country: 'yy', images: [{}] }
    ])
    t.truthy(words)

    const actual = merge(words, [
      { phrase: 'foo' }
    ], [])

    const expected = [
      { phrase: 'foo' }
    ]
    t.is(actual.length, 1)
    t.deepEqual(actual, expected)
  })

  test('merge multiple cards', t => {
    const words = new IndexedWords('xx', 'yy', [
      { query: 'foo', lang: 'xx', country: 'yy', images: [{}] },
      { query: 'bar', lang: 'xx', country: 'yy', images: [{}] },
      { query: 'baz', lang: 'xx', country: 'yy', images: [{}] }
    ])
    t.truthy(words)

    const actual = merge(words, [
      { phrase: 'foo' },
      { phrase: 'bar' }
    ], [
      { phrase: 'baz' }
    ])

    t.is(actual.length, 3)
  })
}
