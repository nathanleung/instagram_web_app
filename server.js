//simple GET/POST requests

//client makes request

//server should respond

//on locahost

//finished steps 1-2 of instagram authentication
//3 next request access token through post request
var express = require('express');
// var http = require('http');
var https = require('https');
var parseURL = require('url').parse;
var app = express();
var bodyParser = require('body-parser');
var querystring = require('querystring');

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var clientID = "5648166b11ba4f2ebf1d0c35e99d51d4";
var clientSecret = "0c38865cbd06460a9f0c16e079975541";
var redirectURL = "http://localhost:8081/instagram/index.html";
var access_code_url = "https://api.instagram.com";
var path_endpoint = "/oauth/access_token";
var access_token = "24349635.1677ed0.6bac278693a2406e94e3ab182d1dba5f";
//what does this do?
app.use(express.static('public'));

app.get('/index.html', function(req, res){
	// res.sendFile(__dirname + "/" + "index.html");
	res.redirect("https://api.instagram.com/oauth/authorize/?client_id="+clientID+"&redirect_uri="+redirectURL+"&response_type=code&scope=public_content");
});

function getToken(code, instaResponse){
	var instaR = instaResponse;
	var post_data = querystring.stringify({
		'client_id': clientID,
		'client_secret': clientSecret,
		'grant_type': 'authorization_code',
		'redirect_uri': redirectURL,
		'code': code
	});


	var post_options = {
		hostname: parseURL(access_code_url).hostname,
		port: 443,
		method: 'POST',
		path: path_endpoint+"?"+post_data,
		headers: {},
	};
    post_options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    post_options.headers['Content-Length'] = post_data.length;

	var post_req = https.request(post_options, function(res){
		var body = '';
		res.setEncoding('utf8');
		res.on('data', function(chunk){
			console.log(res);
			console.log(res.statusCode +": " + res.statusMessage);
			body += chunk; 
		});
		res.on('end', function(){
			console.log(res.statusCode +": " + res.statusMessage);
			// res.write(body);
			// console.log(body);
			result = JSON.parse(body);
			access_token = result.access_token;
			instaR.sendFile(__dirname + "/instagram/" + "index.html");
		});
		res.on('error', function(err) {
        	console.log(err);
     	 });
	});

	post_req.write(post_data);
	post_req.end();
}

app.get('/instagram/index.html', function(req, res){
	//if successful get then post
	var code = req.query.code;
	var result = getToken(code, res);
	//go to home
	// res.sendFile(__dirname + "/" + "index.html");
});

function makeRequestByTag(tagName, response){
	var instaR = response;
	var rightNow = Date.now();
	var minusTwoDays = -(2*24*60*60*1000);
	var twoDaysAgo = rightNow+minusTwoDays;
	var get_data = querystring.stringify({
		access_token: access_token,
		// min_tag_id: twoDaysAgo,
		// max_tag_id: rightNow
	});
	var get_options = {
		hostname: parseURL(access_code_url).hostname,
		port: 443,
		method: 'GET',
		path: "/v1/tags/"+tagName+"/media/recent?"+get_data
	};
	var get_req = https.request(get_options, function(res){
		res.setEncoding('utf8');
		var body = '';
		console.log(res.statusCode +": " + res.statusMessage);
		res.on('data', function(chunk){
			console.log(res.statusCode +": " + res.statusMessage);
			console.log(chunk);
			body += chunk;
		});
		res.on('end', function(){
			console.log(res.statusCode +": " + res.statusMessage);
			console.log(body);
			instaR.end(body);
		});
	});
	get_req.end();
}
app.get('/process_get', function(req, res){

   // Prepare output in JSON format
   response = {
       tag:req.query.tag,
       date:req.query.date
   };
   console.log(response);
   makeRequestByTag(response.tag, res);
   // res.end(JSON.stringify(response));
});

var server = app.listen(8081, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port)

});

