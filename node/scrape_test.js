import search from './scrape.js'

search('la ala', 'es', 'mx', 1).then((images) => {
  console.table(images)
})
