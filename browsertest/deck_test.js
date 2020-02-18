import deck from '../src/js/deck.js'

document.body.innerHTML += `
<main>
  <ol id="deck"></ol>
</main>
`
export default (test) => {
  test('empty', t => {
    deck('xx', 'yy', [])

    t.pass()
  })
}
