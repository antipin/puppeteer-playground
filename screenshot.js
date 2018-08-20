const puppeteer = require('puppeteer')
const async = require('async')

const urls = [
  'https://textkernel.careers/career/big-data-software-engineer/',
  'https://textkernel.careers/career/product-owner-data-analytics/',
  'https://textkernel.careers/career/nlp-ml-research-engineer/',
  'https://textkernel.careers/career/data-quality-with-python-skills/',
  'https://textkernel.careers/career/data-consultant/',
  'https://textkernel.careers/career/agile-coach-scrum-master/',
  'https://textkernel.careers/career/junior-business-consultant/',
  'https://textkernel.careers/career/senior-linux-system-engineer/',
  'https://textkernel.careers/career/support-engineering-team-lead/',
  'https://textkernel.careers/career/account-manager-germany/',
  'https://textkernel.careers/career/shape-the-development-of-ai-and-hr-technology-opportunities-in-engineering-product-management-consultancy-and-sales/',
  'https://textkernel.careers/career/senior-back-end-developer/',
  'https://textkernel.careers/career/account-manager/',
  'https://textkernel.careers/career/technical-consultant/',
  'https://textkernel.careers/career/senior-java-developer/',
  'https://textkernel.careers/career/software-implemention-conslutant/',
  'https://textkernel.careers/career/business-development-manager-dach/',
  'https://textkernel.careers/career/machine-learning-engineer/',
  'https://textkernel.careers/career/big-data-software-engineer/',
  'https://textkernel.careers/career/partner-manager/',
  'https://textkernel.careers/career/application-support-engineer-german/',
]

function getPageName(url) {
  return url.split('/').filter(item => item !== '').pop()
}

async function processUrl(url, browser) {
  
  const fileName = `textkernel__${getPageName(url)}.png`
  console.time(`Processing page ${fileName}`)
  const page = await browser.newPage()
  await page.setJavaScriptEnabled(false)
  await page.goto(url)
  await page.setViewport({
    width: 1024,
    height: 800,
  })
  await page.screenshot({
    path: `screenshots/${fileName}`,
    fullPage: true,
  })

  const highlights = await page.evaluate(() =>
    [...document.querySelectorAll('h3')].map(headerElem => {
      const {x, y, width, height} = headerElem.getBoundingClientRect()
      return {x, y, width, height}
    })
  )

  console.timeEnd(`Processing page ${fileName}`)
  return { fileName, highlights }
}

function processUrls(urls, browser) {
  return new Promise((resolve, reject) => {
    const results = []
    async.eachLimit(
      urls,
      4, // Limit for requests per iteration
      (url, next) => processUrl(url, browser)
        .then(result => {
          results.push(result)
          return next()
        })
        .catch(err => next(err)),
      err => {
        if (err) return reject(err)
        return resolve(results)
      }
    )
  })
}

try {
  ;(async () => {

    console.time('Launching Chrome...')
    const browser = await puppeteer.launch()
    console.timeEnd('Launching Chrome...')

    console.time('Processing URLs...')
    const results = await processUrls(urls, browser)
    console.log(JSON.stringify(results, null, 4))    
    console.timeEnd('Processing URLs...')

    console.time('Closing Chrome...')
    await browser.close()
    console.timeEnd('Closing Chrome...')

  })()

} catch (err) {

  console.log(err)
  process.exit(1)

}

