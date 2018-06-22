const express = require('express')
const syncRequest = require('sync-request')


const app = express()

app.set('port', (process.env.PORT || 5000))

const REQUIRE_AUTH = true
const AUTH_TOKEN = '888123123'
var INTENT_NAME = "";
var lineUserId  = "";

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
  console.log('intent name: ' + INTENT_NAME)
  
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
  
  if(!req.body.originalRequest){//webchat
    console.log('Source is :' + req.body.result.source);
  }
  
  else{//line
    lineUserId = req.body.originalRequest.data.data.source.userId;
    
    console.log(req.body.originalRequest.data.data);
    console.log('Source is :' + req.body.originalRequest.source);
    console.log('UserId :' + lineUserId);
    
    //1. CALL TO PORTAL FOR AUTHENTICATION AND AUTHORIZATION SERVICE AND GET USER PROFILE (CLIENTID)
    var res = syncRequest('POST', 
                         'http://66.155.19.127/PortalService/api/operations/', 
                          {
    	                          //json:{"OperationId":"5",
                                //      "UserId":"Hammad123",
                                //      "Password":"pwd123",
                                //      "LineId":"9999999999",
                                //      "ActionId":2,
                                //      "ReturnType":"json",
                                //      "IntentKey":"check.collection.outstanding"}
      
                                json:{"OperationId": "1",
                                      "UserId":"Hammad123",
                                      "Password":"pwd123",
    	                                "ReturnType":"json"}
                           });
    console.log('response of portal service: ' + res.getBody('utf8'));
    console.log('user id: ' + lineUserId + ' authenticated = ' + JSON.parse(JSON.parse(res.getBody('utf8'))).Success);
    
  }
  
  
})
