const { search } = require('./scrape.js')

search('la ala', 'es', 'mx').then((images) => {
  console.table(images)
})
