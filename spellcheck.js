let https = require('https')

let host = 'api.cognitive.microsoft.com'
let path = '/bing/v7.0/spellcheck/'

/* NOTE: Replace this example key with a valid subscription key (see the Prequisites section above). Also note v5 and v7 require separate subscription keys. */
let key = '97ae8b2a8ba04ac7a34504daa468d882'

// These values are used for optional headers (see below).
// let CLIENT_ID = "<Client ID from Previous Response Goes Here>";
// let CLIENT_IP = "999.999.999.999";
// let CLIENT_LOCATION = "+90.0000000000000;long: 00.0000000000000;re:100.000000000000";

const spellCheck = function (stringToCheck) {
  return new Promise((resolve, reject) => {
    let params = {
      'text': stringToCheck || 'Hollo, wrld!',
      'mode': 'proof',
      'mkt': 'en-US'
    }

    let queryString = '?'
    for (let param in params) {
      queryString += param + '=' + params[param] + '&'
    }
    queryString = encodeURI(queryString)

    let requestParams = {
      method: 'POST',
      hostname: host,
      path: path + queryString,
      headers: {
        'Ocp-Apim-Subscription-Key': key
//        'X-Search-Location' : CLIENT_LOCATION,
//        'X-MSEdge-ClientID' : CLIENT_ID,
//        'X-MSEdge-ClientIP' : CLIENT_ID,
      }
    }
    let req = https.request(requestParams, (response) => {
      let body = ''
      response.on('data', function (d) {
        body += d
      })
      response.on('error', function (e) {
        reject(e)
      })
      response.on('end', function () {
        // console.log(body)
        resolve(body)
      })
    })
    req.end()
  })
}

module.exports = spellCheck
