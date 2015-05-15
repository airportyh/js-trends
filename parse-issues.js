"use strict"
const fs = require('fs-promise')
const co = require('co')
const cheerio = require('cheerio')
const natural = require('natural')
const tokenizer = new natural.WordTokenizer()
const trends = [
  'react',
  ['react native'],
  ['es6', 'ecmascript 6'],
  ['node', 'node.js'],
  'jquery',
  'web',
  'server',
  ['backbone', 'backbone.js'],
  'html5',
  'babel',
  ['angularjs', 'angular'],
  ['ember', 'ember.js'],
  'coffeescript',
  'mobile',
  'ecmascript',
  ['es7', 'ecmascript 7'],
  'flux',
  'testing',
  ['browser', 'browsers'],
  'native',
  'client-side',
  ['frontend', 'front-end']
]

co(function*(){
  const dirEntries = yield fs.readdir('issues')
  const allWordSummary = new Map
  var issues = yield Promise.all(dirEntries.map(function(entry){
    return readIssue('issues/' + entry, allWordSummary)
  }))
  issues.sort(function(one, other){ return one.number - other.number })
  console.log(topX(allWordSummary, 400))
  let data = issues.map(function(issue){
    return {
      number: issue.number,
      date: issue.date,
      summary: mapToObject(issue.summary)
    }
  })
  yield fs.writeFile('summary.json', JSON.stringify(data, null, '  '))
  console.log('Wrote summary.json')
}).catch(function(err){
  console.log(err.stack)
})

function mapToObject(map){
  var ret = {}
  map.forEach(function(value, key){
    ret[String(key)] = value
  })
  return ret
}

function topX(summary, x){
  let entries = iterToArray(summary.entries())
  entries.sort(function(one, other){
    return other[1] - one[1]
  })
  return entries
}

function printTop10(issue){
  console.log('## Top 10 for issue', issue.number, '-', issue.date)
  console.log()
  console.log(topX(issue.summary, 10).map(function(entry){
    return `${entry[0]}: ${entry[1]}`
  }).join('\n'))
  console.log()
}

function iterToArray(iter){
  var ret = []
  var curr
  while (!(curr = iter.next()).done){
    ret.push(curr.value)
  }
  return ret
}

function summarize(text, summary){
  for (let trend of trends){
    let exp = new RegExp("[^a-zA-Z0-9](" + 
      (Array.isArray(trend) ? trend.join('|') : trend) + 
      "):?[^a-zA-Z0-9]", "g")
    let matches = text.match(exp)
    let count = matches ? matches.length : 0

    summary.set(trend, (summary.get(trend) || 0) + count)
  }
  return summary
}

function tokenize(text){
  return text.split(/\s+/)
}

function matches(pattern, token){
  if (Array.isArray(pattern)){
    return pattern.indexOf(token) !== -1
  }else if (typeof pattern === 'string'){
    return pattern === token
  }
}

function readIssue(filename, allSummary){
  return fs.readFile(filename)
    .then(function(html){
      const number = Number(filename.match(/[0-9]+/))
      const $ = cheerio.load(html)
      const issueText = $('.issue-html').text().toLowerCase()
      const date = $('.issue-html .container td table tr td.block')
        .text()
        .match(/([a-zA-Z]+\s+[0-9]+,\s+[0-9]+)/)[1]
      
      summarize(issueText, allSummary)

      return {
        number: number,
        date: date,
        text: issueText,
        summary: summarize(issueText, new Map)
      }
    })
}