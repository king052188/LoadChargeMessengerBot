var express                   = require('express');
var bodyParser                = require('body-parser');
var request                   = require('request');
var cache                     = require('memory-cache');
var settings                  = require('./settings.js');
var app                       = express();

app.use(bodyParser.urlencoded({"extended": false}));
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN       = settings.PAGE_ACCESS_TOKEN; // facebook page-access-token
const VERIFY_TOKEN            = settings.VERIFY_TOKEN; // facebook verification-token
const ACCESS_TOKEN            = settings.ACCESS_TOKEN; // load4wrd aaccess-token
const API_URL                 = settings.API_URL; // load4wrd api url
const API_SMS                 = settings.API_SMS; // ptxt4wrd api url

var newCache;
var sender_fbuid;
var count                     = 0;
var timer_sleep               = 1500;

// Test
app.get('/test', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  console.log(settings);
  res.json(settings);
});

// Test
app.get('/mpin', (req, res) => {
  var cache_mpin = newCache.get('MPIN');
  var users_mpin = req.query["pin"]
  console.log("mem_cache: " + cache_mpin);
  console.log("user_pin: " + users_mpin);
  res.setHeader("Content-Type", "text/html");
  if(parseInt(cache_mpin) == parseInt(users_mpin)) {
    res.send("nice");
  }
  res.send("nope");
});

// To verify
app.get('/webhook', (req, res) => {
  if(req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

app.post('/webhook', (req, res) => {

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }

    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

function handleMessage(sender_psid, received_message) {
  let response;
  // Check if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message
    var data;
    var msg = received_message.text;

    if(msg.includes("PSREG") || msg.includes("PSReg") || msg.includes("PSreg")) {
      data = msg.split(" ");
      console.log(data);
      if(data.length > 0) {
        verify(sender_psid, data[1]);
      }
    }
    else if(msg.includes("CODE")) {
      data = msg.split(" ");
      console.log(data);
      if(data.length > 0) {
        register(sender_psid, data[1]);
      }
    }
    else if(msg.includes("LC")) {
      data = msg;
      datas = data.split(" ");
      if(datas[1].includes("LINK")) {
        link(sender_psid, datas[2]);
      }
      else {
        command(sender_psid, data);
      }
    }
    else if(msg.includes("MPIN")) {
      data = msg.split(" ");
      console.log(data);
      if(data.length > 0) {
        otp_validation(sender_psid, data[1]);
      }
    }
    else if(msg.includes("PTXT")) {
      data = msg.split(" ");
      console.log(data);
      if(data.length > 0) {
        callPTXT4wrdSMSAPI(sender_psid, data[1], data[2]);
      }
    }
    else {
      handleMessageSend(sender_psid, msg);
    }
  }
}

function handleMessageSend(sender_psid, received_message) {
  let response;
  // Create the payload for a basic text message
  response = {
    "text": `${received_message}`
  }
  // Sends the response message
  callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}


// pollystore 1020

function verify(sender_psid, mobile) {
  if(mobile.length != 11) {
    console.log("Invalid mobile number.");
    handleMessageSend(sender_psid, "Invalid mobile number 1.");
    return false;
  }

  let request_body = {
    "fb_id": sender_psid,
    "mobile": mobile
  }

  newCache = new cache.Cache();
  request({
    "uri": API_URL + "/api/v1/verify/" + ACCESS_TOKEN,
    "method": "GET",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      var status = parseInt(body['status']);
      var message = body['message'];
      if(status != 200) {
        console.log(message);
        handleMessageSend(sender_psid, message);
        return false;
      }

      var code = body['one_time_password'];
      newCache.put('CODE', code);
      newCache.put('MOBILE', mobile);
      newCache.put('FACEBOOK_ID', sender_psid);

      var summary = "We have sent confirmation code to your mobile.\r\n\r\n";
      summary += "Please type CODE<space>6-digits then press enter\r\n\r\n";
      summary += "Example: CODE 123456 then press enter";
      console.log(newCache.get('CODE'));
      handleMessageSend(sender_psid, summary);
    }
    else {
      console.error("Unable to send message:" + err);
      stringMSG = "Unable to send message:" + err;
      handleMessageSend(sender_psid, stringMSG);
    }
  });
}

function register(sender_psid, code) {
  if(code.length != 6) {
    console.log("Invalid length OTP.");
    handleMessageSend(sender_psid, "Invalid length OTP.");
    return false;
  }

  var cache_code = newCache.get('CODE');
  if(cache_code != code) {
    console.log("Invalid OTP.");
    handleMessageSend(sender_psid, "Invalid OTP.");
    return false;
  }

  var fb_id = newCache.get('FACEBOOK_ID');
  var mobile = newCache.get('MOBILE');
  let request_body = {
    "fb_id": fb_id,
    "mobile": mobile
  }

  request({
    "uri": API_URL + "/api/v1/register/" + ACCESS_TOKEN,
    "method": "GET",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      var status = parseInt(body['status']);
      var message = body['message'];
      console.log(message);

      if(status != 200) {
        handleMessageSend(sender_psid, message);
        return false;
      }
      handleMessageSend(sender_psid, message);
    }
    else {
      console.error("Unable to send message:" + err);
      stringMSG = "Unable to send message:" + err;
      handleMessageSend(sender_psid, stringMSG);
    }
  });
}

function link(sender_psid, mobile) {
  if(mobile.length != 11) {
    console.log("Invalid mobile number.");
    handleMessageSend(sender_psid, "Invalid mobile number 1.");
    return false;
  }

  let request_body = {
    "fb_id": sender_psid,
    "mobile": mobile
  }

  request({
    "uri": API_URL + "/api/v1/load/link/" + ACCESS_TOKEN,
    "method": "GET",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      var status = parseInt(body['status']);
      var message = body['message'];
      if(status != 200) {
        console.log(message);
        handleMessageSend(sender_psid, message);
        return false;
      }

      handleMessageSend(sender_psid, message);
    }
    else {
      console.error("Unable to send message:" + err);
      stringMSG = "Unable to send message:" + err;
      handleMessageSend(sender_psid, stringMSG);
    }
  });
}

function command(sender_psid, command) {
  sender_fbuid = sender_psid;
  let request_body = {
    "fb_id": sender_psid,
    "command": command
  }
  newCache = new cache.Cache();
  var url = API_URL + "/api/v1/load/command/" + ACCESS_TOKEN;
  request({
    "uri": url,
    "method": "GET",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      var status = parseInt(body['status']);
      var message = body['message'];

      console.log("status: " + status);
      console.log("message: " + message);

      if(status == 404) {
        handleMessageSend(sender_psid, message);
        return false;
      }

      var trans_num = body['reference_number'];
      var target_mobile = body['target_mobile'];
      var product_code = body['product_code'];
      var load_amount = body['load_amount'];
      var one_time_password = body['one_time_password'];

      newCache.put('trans_num', trans_num);
      newCache.put('target_mobile', target_mobile);
      newCache.put('product_code', product_code);
      newCache.put('load_amount', load_amount);
      newCache.put('one_time_password', one_time_password);

      console.log("trans_num: " + newCache.get('trans_num'));
      console.log("target_mobile: " + newCache.get('target_mobile'));
      console.log("product_code: " + newCache.get('product_code'));
      console.log("load_amount: " + newCache.get('load_amount'));
      console.log("one_time_password: " + newCache.get('one_time_password'));

      handleMessageSend(sender_psid, message);

    }
    else {
      console.error("Unable to send message:" + err);
      stringMSG = "Unable to send message:" + err;
      handleMessageSend(sender_psid, stringMSG);
    }
  });
}

function otp_validation(sender_psid, users_mpin) {
  var cache_mpin = 0;
  try{
    cache_mpin = newCache.get('one_time_password');
    if(parseInt(cache_mpin) == parseInt(users_mpin)) {
      // handleMessageSend(sender_psid, "Great. Your load is being processed.");
      command_proceed(sender_psid);
    }
    else {
      handleMessageSend(sender_psid, "Your One-Time-Password is not valid. Please check your mobile.");
    }

  } catch( err ){
    handleMessageSend(sender_psid, "You don't have any load request yet.");
  }
  console.log("cache_mpin: " + cache_mpin);
  console.log("users_mpin: " + users_mpin);
}

function command_proceed(sender_psid) {

  sender_fbuid = sender_psid;
  let request_body = {
    "fb_id": sender_psid,
    "reference": newCache.get('trans_num'),
    "target": newCache.get('target_mobile'),
    "code": newCache.get('product_code'),
    "amount": newCache.get('load_amount')
  }
  console.log(request_body);

  request({
    "uri": API_URL + "/api/v1/load/proceed/" + ACCESS_TOKEN,
    "method": "GET",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log(body);
      var status = parseInt(body['status']);
      var message = body['message'];
      console.log("status: " + status);
      console.log("message: " + message);
      if(status != 200) {
        handleMessageSend(sender_psid, message);
        return false;
      }
      handleMessageSend(sender_psid, message);
    }
    else {
      console.error("Unable to send message:" + err);
      stringMSG = "Unable to send message:" + err;
      handleMessageSend(sender_psid, stringMSG);
    }
  });
}









function command_verify(sender_psid) {
  sender_fbuid = sender_psid;
  let request_body = {
    "fb_id": sender_psid,
    "network": "SMART",
    "transaction": newCache.get('topup_id'),
    "mobile": newCache.get('mobile'),
    "amount": newCache.get('amount')
  }
  console.log(request_body);

  request({
    "uri": API_URL + "/api/v1/load/verify",
    "method": "GET",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log(body);
      var status = parseInt(body['status']);
      var message = body['message'];
      console.log("status: " + status);
      console.log("message: " + message);
      if(status == 201) {
        setTimeout(reverify_load_command, 2000);
        return false;
      }
      if(status != 200) {
        handleMessageSend(sender_psid, message);
        return false;
      }
      handleMessageSend(sender_psid, message);
    }
    else {
      console.error("Unable to send message:" + err);
      stringMSG = "Unable to send message:" + err;
      handleMessageSend(sender_psid, stringMSG);
    }
  });
}

function reverify_load_command() {
  console.log(`arg was => ${sender_fbuid}`);
  command_verify(sender_fbuid);
}



// ptxt4wrd

function callSendPtxt4wrdAPI(sender_psid, mobile, command) {
  // Construct the message body
  let request_body = {
    "mobile": mobile,
    "command": command.replace("-", " ")
  }

  newCache = new cache.Cache();
  var stringMSG = null;
  // Send the HTTP request to the Messenger Platform
  request({
    "uri": API_URL + "/command/execute/v2",
    "method": "GET",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      var mpin_verify = body['MPIN'];
      newCache.put('CODE', mpin_verify);
      newCache.put('MOBILE', mobile);
      newCache.put('COMMAND', command);

      var summary = "We have sent OTP to your mobile";
      summary += "Please type CODE<space>6 digits then press enter";

      console.log(summary);
      console.log(newCache.get('CODE'));
      handleMessageSend(sender_psid, summary);
    }
    else {
      console.error("Unable to send message:" + err);
      stringMSG = "Unable to send message:" + err;
      handleMessageSend(sender_psid, stringMSG);
    }
  });
  return stringMSG;
}

function callSendLoad4wrdAPI(sender_psid, mobile, command) {
  // Construct the message body

  let request_body = {
    "mobile": mobile,
    "command": command.replace("-", " ")
  }

  newCache = new cache.Cache();
  var stringMSG = null;
  // Send the HTTP request to the Messenger Platform
  request({
    "uri": API_URL + "/command/process/v2",
    "method": "GET",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      var status = parseInt(body['Status']);
      var msg = "Something went wrong, please try again.";
      if(status == 200) {
        msg = "Your request is being processed.";
      }
      console.error(msg);
      handleMessageSend(sender_psid, msg);
    }
    else {
      console.error("Unable to send message:" + err);
      stringMSG = "Unable to send message:" + err;

      handleMessageSend(sender_psid, stringMSG);
    }
  });

  return stringMSG;
}

function mpinVerify(sender_psid, users_mpin) {
  var cache_mpin = 0;
  try{
    cache_mpin = newCache.get('CODE');
    cache_mobile = newCache.get('MOBILE');
    cache_command = newCache.get('COMMAND');

    if(parseInt(cache_mpin) == parseInt(users_mpin)) {
      callSendLoad4wrdAPI(sender_psid, cache_mobile, cache_command);
    }
    else {
      handleMessageSend(sender_psid, "Invalid OTP");
    }

  } catch( err ){
    handleMessageSend(sender_psid, "No OTP set.");
  }
  console.log("mem_cache: " + cache_mpin);
  console.log("user_pin: " + users_mpin);
}

function callPTXT4wrdSMSAPI(sender_psid, mobile, message) {
  // Construct the message body

  let request_body = {
    "mobile": mobile,
    "message": message
  }

  newCache = new cache.Cache();
  var stringMSG = null;
  // Send the HTTP request to the Messenger Platform
  request({
    "uri": API_URL + "/command/ptxt",
    "method": "GET",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      var status = parseInt(body['Status']);
      var msg = "Something went wrong, please try again.";
      if(status == 200) {
        msg = "Your message is being sent.";
      }
      if(status == 201) {
        msg = "Your message is being sent.";
      }
      console.error(msg);
      handleMessageSend(sender_psid, msg);
    }
    else {
      console.error("Unable to send message:" + err);
      stringMSG = "Unable to send message:" + err;
      handleMessageSend(sender_psid, stringMSG);
    }
  });

  return stringMSG;
}


app.listen(3200);

// app.listen(process.env.PORT);
