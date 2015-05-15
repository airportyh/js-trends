'use strict'
const cheerio = require('cheerio')
const request = require('request-promise')
const co = require('co')
const fs = require('fs-promise')

co(function*(){
  const reply = yield request.get('http://javascriptweekly.com/issues')
  const $ = cheerio.load(reply)
  let hrefs = []
  $('li.issue a').each(function(){
    hrefs.push($(this).attr('href'))
  })
  yield fs.writeFile('issues.json', JSON.stringify(hrefs))
  console.log('Wrote issues.json')
})