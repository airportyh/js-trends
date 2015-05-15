"use strict"
const fs = require('fs-promise')
const request = require('request-promise')
const co = require('co')
const issueHrefs = require('./issues.json')
const baseUrl = 'http://javascriptweekly.com/'
co(function*(){
  for (let href of issueHrefs){
    const reply = yield request(baseUrl + href)
    const filename = href + '.html'
    yield fs.writeFile(filename, reply)
    console.log(`Wrote ${filename}`)
  }
})