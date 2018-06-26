const express = require('express')
const syncRequest = require('sync-request')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.set('port', (process.env.PORT || 5000))

const REQUIRE_AUTH = true
const AUTH_TOKEN = '888123123'
var INTENT_NAME = "";
var lineUserId  = "";
var LOGIN_ID = "";
var PASSWORD = "";
var webhookReply = "";
const PortalService_URL = "http://66.155.19.127/PortalService/api/operations/";

app.get('/', function (req, res) {
  res.send('Use the /webhook endpoint.')
})

app.get('/webhook', function (req, res) {
  res.send('You must POST your request')
})


app.post('/webhook', function (req, res) {
  console.log('post request received')
  console.log(req.body)
  
  INTENT_NAME = req.body.result.metadata.intentName;
  LOGIN_ID = req.body.result.parameters['login_id'];
  PASSWORD = req.body.result.parameters['password'];
  
  console.log('intent name: ' + INTENT_NAME)
  console.log('login id: ' + LOGIN_ID)
  console.log('password: ' + PASSWORD)
    
  if (REQUIRE_AUTH) {
    if (req.headers['auth-token'] !== AUTH_TOKEN) {
      console.log('AUTH_TOKEN is not authorized');
      return res.status(401).send('Unauthorized')
    }
  }
  
  if (!req.body || !req.body.result || !req.body.result.parameters) {
    console.log('validation failed');
    return res.status(400).send('Bad Request')
  }
  
  //webchat
  if(!req.body.originalRequest){
    console.log('Source is :' + req.body.result.source);
    console.log('Calling SignalR service.....');
    var resSR = syncRequest('POST', 
      PortalService_URL, 
      {
    	  json:{"OperationId":"6",
              "UserId":"",
              "Password":"",
              "LineId":"",
              "ActionId":2,
              "ReturnType":"str",
              "IntentKey":INTENT_NAME}
      });
    console.log('Response received');
    
    var json = resSR.getBody('utf8');
    webhookReply = json;
    
    console.log("response from SignalR: " + json);
    
    res.status(200).json({
        	source: 'webhook',
        	speech: webhookReply,
        	displayText: webhookReply
    })
  }
  
  //line
  else{
    lineUserId = req.body.originalRequest.data.data.source.userId;
    
    console.log(req.body.originalRequest.data.data);
    console.log('Source is :' + req.body.originalRequest.source);
    console.log('Calling SignalR service.....');    
    //1. CALL TO PORTAL FOR AUTHENTICATION AND AUTHORIZATION SERVICE AND GET USER PROFILE (CLIENTID)
    var resSR = syncRequest('POST', 
      PortalService_URL, 
      {
    	  json:{"OperationId":"5",
              "UserId":LOGIN_ID,
              "Password":PASSWORD,
              "LineId":lineUserId,
              "ActionId":2,
              "ReturnType":"str",
              "IntentKey":INTENT_NAME}
      });
    console.log('Response receiced');
    
    var json = resSR.getBody('utf8')
    webhookReply = json;
    
    console.log("response from SignalR: " + json);
    
    res.status(200).json({
        	source: 'webhook',
        	speech: webhookReply,
        	displayText: webhookReply
    })
    
    console.log('response of portal service: ' + json);
    
    //if(res.statusCode == 200){
    //  res.status(200).json({
    //    	source: 'webhook',
    //    	speech: webhookReply,
    //    	displayText: webhookReply
    //  })
    //}
    //else{
    //  res.status(response.statusCode).json({
    //      source: 'webhook',
    //      speech: 'Error from b2b service:' + error,
    //      displayText: 'Error from b2b service:' + error
    //  })
    //}
  }
  
  
})

app.listen(app.get('port'), function () {
  console.log('* Webhook service is listening on port:' + app.get('port'))
})
