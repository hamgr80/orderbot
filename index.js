const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()
app.use(bodyParser.json())
app.set('port', (process.env.PORT || 5000))

const REQUIRE_AUTH = true
const AUTH_TOKEN = '888123123'

app.get('/', function (req, res) {
  res.send('Use the /webhook endpoint.')
})
app.get('/webhook', function (req, res) {
  res.send('You must POST your request')
})

app.post('/webhook', function (req, res) {
  // we expect to receive JSON data from api.ai here.
  // the payload is stored on req.body
  console.log(req.body)

  // we have a simple authentication
  if (REQUIRE_AUTH) {
    if (req.headers['auth-token'] !== AUTH_TOKEN) {
      return res.status(401).send('Unauthorized')
    }
  }

  // and some validation too
  if (!req.body || !req.body.result || !req.body.result.parameters) {
    return res.status(400).send('Bad Request')
  }

  // the value of Action from api.ai is stored in req.body.result.action
  console.log('* Received action -- %s', req.body.result.action)

  // parameters are stored in req.body.result.parameters
  var userName = req.body.result.parameters['given-name']
  var webhookReply = 'Hello ' + userName + '! Welcome from the local3 webhook.'
  let webhookReply2 = '';

  // calling b2b rest service
  console.log('requesting post request to b2b');
  request.post({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     'http://169.50.64.42/SignalR/messagebroadcast/PushToSpecificClient/?requester=abc&query=select%20*%20from%20distributor&clientid=aaa',
  body:   'this is body'
  }, function(error, response, body){
    console.log('error:', error); 
    console.log('statusCode:', response && response.statusCode);
    console.log('body:', body);
    var json = JSON.parse(body);
    var data = JSON.parse(json);
    console.log('data:', data);
    console.log('dataError:', data[0].Error);
    webhookReply2 = data[0].Error;
    
    console.log('webhookReply:', webhookReply);
    console.log('webhookReply2:', webhookReply2);
  });
  
  
  // the most basic response
  res.status(200).json({
    source: 'webhook',
    speech: webhookReply,
    displayText: webhookReply
  })
})

app.listen(app.get('port'), function () {
  console.log('* Webhook service is listening on port:' + app.get('port'))
})
