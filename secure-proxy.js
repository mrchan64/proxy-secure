//var http = require('http');

//http.createServer(onRequest).listen(3000);

/*function onRequest(client_req, client_res) {
  console.log('serve: \n',client_req);

  var options = {
    hostname: 'www.google.com',
    port: 80,
    path: client_req.url,
    method: 'GET'
  };

  var proxy = http.request(options, function (res) {
    res.pipe(client_res, {
      end: true
    });
  });

  client_req.pipe(proxy, {
    end: true
  });
}*/

var http = require('http');
var https = require('https');
//var httpProxy = require('http-proxy');
var fs = require('fs');
var util = require('util');
var request = require('request');

//
// Create a proxy server with custom application logic
//
//var proxy = httpProxy.createProxyServer({});

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
var server = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  //console.log("Incoming request");

  var options = {
    'url': req.url,
    'method': req.method,
    'encoding': null,
    'headers': formatHeaders(req.rawHeaders)
  }

  var callback = function(error, response, body){
    console.log("CALLBACK")
    if(body){
      //console.log(body);
    }
    if (!error && response.statusCode == 200) {
      res.writeHead(200, response.headers);
      res.write(body);
      res.end();
      console.log("POOP")
      //console.log(response.headers, response.body);
    }else{
      console.log("no poop?")
      console.log(response.statusCode);
    }
  }

  //var proxy = request(options, callback);
  //console.log(proxy,'12345')

  /* test code */
  // res.writeHead(200, { 'Content-Type': 'text/plain' });
  // console.log("\nMESSAGE MARKER\n---------------------------------\n",JSON.stringify(req.url, true, 2))
  // //res.write('yooooooo' + '\n' + JSON.stringify(req.rawHeaders, true, 2));
  // var keys = Object.keys(req);
  // res.write(JSON.stringify(keys, true, 2));
  // //res.write(util.inspect(getValidKeys(req)))
  // res.end();
  // //proxy.web(req, res, { target: 'http://www.yahoo.com' });
  // //console.log(res);


  var fields = ['headers', 'rawHeaders', 'url', 'method'];

  var imp = {};
  fields.forEach((key)=>{
    imp[key] = req[key];
  })
  // console.log(imp);

  // res.write(JSON.stringify(imp, true, 2));
  // res.end()
  var options = {
    method: req.method,
    host: req.headers.host,
    path: req.url.replace(req.headers.host, '').replace('http://','').replace('https://',''),
    headers: req.headers
  }
  console.log({
    method: options.method,
    host: options.host,
    path: options.path,
    headers: req.headers
  })
  var proxyreq = http.get(options, (proxyresp)=>{
    proxyresp.pipe(res);
    var total = 0;
    proxyresp.on('data', (chunk)=>{
      total+= chunk.length;
    });
    proxyresp.on('end', ()=>{
      console.log(req.url, "length "+total, proxyresp.statusCode);
    })
  }).on('error', (err)=>{
    console.log('error')
    console.log(err)
  })
  console.log('\n\n===========[Request Gap]=========\n\n')
  proxyreq.end();

});

var getValidKeys = function(obj){
  var result = {};
  for(var key in obj){
    console.log(key);
    if(key.substring(0,1)!=='_'){
      result[key] = obj[key];
    }
  }
  return result;
}

var formatHeaders = function(rawHeaders){
  var headers = {};
  for(var i = 0; i<rawHeaders.length; i+=2){
    headers[rawHeaders[i]] = rawHeaders[i+1];
  }
  return headers;
}

console.log("listening on port 9000")
server.listen(9000);