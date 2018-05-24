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
  var requester = 'abc';
  var query = 'select%20*%20from%20distributor';
  var clientid = '98038001';
  var webhookReply = 'Hello ' + userName + '! Welcome from the local3 webhook.'
  let webhookReply2 = '';

  // calling b2b rest service
  console.log('requesting post request to b2b');
  request.post({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:   'http://66.228.117.22/B2B_Integration%20with%20OSDP/messagebroadcast/PushToSpecificClient/?requester='+requester+'&query='+query+'&clientid=' + clientid,
  body:  'this is body'
  }, function(error, response, body) {
      if(!error && response.statusCode == 200) {
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
        console.log('requester:', requester);
        console.log('query:', query);
        console.log('clientid:', clientid);
        
        var json = JSON.parse(body);
        var data = JSON.parse(json);
        
        var firstElement = getFirstJSONElement(data);
        
        if(firstElement == 'Error'){
          console.log('data:', data);
          webhookReply2 = data[0].Error;
        }
        else{
          console.log('data:', data);
          webhookReply2 = data[0];
        }
        
        // the most basic success response
        res.status(200).json({
        source: 'webhook',
        speech: webhookReply2,
        displayText: webhookReply2
        })
      }
      else{
        console.log('error:', error); 
        console.log('statusCode:', response && response.statusCode);
        console.log('requester:', requester);
        console.log('query:', query);
        console.log('clientid:', clientid);
        
        // the most basic error response
        res.status(response.statusCode).json({
          source: 'webhook',
          speech: 'Error from b2b service:' + error,
          displayText: 'Error from b2b service:' + error
        })
      }
  });
})

app.listen(app.get('port'), function () {
  console.log('* Webhook service is listening on port:' + app.get('port'))
})

function getFirstJSONElement(json){
  if (json.length > 0){ 
  var columnsIn = json[0]; 
  for(var key in columnsIn){
      return key;
      break;
    } 
  }
  else{
    return 'No Columns';
  }
}
