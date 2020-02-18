import debug from '../src/js/debug.js'

document.body.innerHTML += `
<table id="table">
</table>
`
const tableEl = document.getElementById('table')

const setup = () => {
  tableEl.innerHTML = ''
}

export default test => {
  test('empty', t => {
    setup()

    debug('xx', 'yy', [])

    t.is(tableEl.childElementCount, 0)
  })

  test('one', t => {
    setup()

    debug('xx', 'yy', [
      { query: 'foo', lang: 'xx', country: 'yy', images: [{}] }
    ])

    t.is(tableEl.childElementCount, 1)
  })

  test('three', t => {
    setup()

    debug('xx', 'yy', [
      { query: 'foo', lang: 'xx', country: 'yy', images: [{}] },
      { query: 'bar', lang: 'xx', country: 'yy', images: [{}] },
      { query: 'baz', lang: 'xx', country: 'yy', images: [{}] }
    ])

    t.is(tableEl.childElementCount, 3)
  })
}
