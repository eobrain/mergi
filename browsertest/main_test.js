import main from '../src/js/main.js'

document.body.innerHTML += `
<main id="card" class="initial">
  <section id="front" class="unflpped">
    <nav></nav>
    <div class="content-container"></div>
  </section>
  <section id="back" class="unflpped">
    <nav>
        <svg id="wrong"></svg>
        <svg id="meh"></svg>
        <svg id="correct"></svg>
    </nav>
    <div class="content-container"></div>
  </section>
</main>
`

export default test => {
  test('empty', t => {
    main('xx', 'yy', [])

    t.pass()
  })
}
