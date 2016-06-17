//simple GET/POST requests

//client makes request

//server should respond

//on locahost

//finished steps 1-2 of instagram authentication
//3 next request access token through post request
var express = require('express');
var https = require('https');
var url = require('url');
var app = express();
var querystring = require('querystring');

// Create application/x-www-form-urlencoded parser
// var bodyParser = require('body-parser');
// var urlencodedParser = bodyParser.urlencoded({ extended: false })

var clientID = "5648166b11ba4f2ebf1d0c35e99d51d4";
var clientSecret = "0c38865cbd06460a9f0c16e079975541";
var redirectURL = "http://localhost:8081/instagram/index.html";
var access_code_url = "https://api.instagram.com";
var path_endpoint = "/oauth/access_token";
var access_token = "24349635.1677ed0.6bac278693a2406e94e3ab182d1dba5f";
//what does this do?
app.use(express.static('public'));

app.get('/index.html', function(req, res){
	res.sendFile(__dirname + "/" + "index.html");
});

app.get('/connect_with_instagram', function(req, res){
	res.redirect("https://api.instagram.com/oauth/authorize/?client_id="+clientID+"&redirect_uri="+redirectURL+"&response_type=code&scope=public_content");
});

function getToken(code, response){
	var page_res = response;
	//path
	var post_data = querystring.stringify({
		'client_id': clientID,
		'client_secret': clientSecret,
		'grant_type': 'authorization_code',
		'redirect_uri': redirectURL,
		'code': code
	});

	//options
	var post_options = {
		hostname: url.parse(access_code_url).hostname,
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
			console.log(res.statusCode +": " + res.statusMessage);
			body += chunk; 
		});
		res.on('end', function(){
			console.log(res.statusCode +": " + res.statusMessage);
			result = JSON.parse(body);
			access_token = result.access_token;
			page_res.sendFile(__dirname + "/instagram/" + "index.html");
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
});
function convertDateToSeconds(date){
	var date = new Date(date);
	return date.getTime()/1000;
}
function filterInstagramsByDate(startDate, endDate, data){
	var filteredPics = [];
	console.log(startDate);
	console.log(endDate);
	for(var i = 0; i< data.length; i++){
			console.log(data[i].created_time);
		if(data[i].created_time >= startDate && data[i].created_time <= endDate){
			filteredPics.push(data[i]);
		}
	}
	return filteredPics;
}
function makeRequestByTag(query_submission, response){
	var tagResponse = response;
	//date for GET request
	var get_data = querystring.stringify({
		access_token: access_token
	});
	//options for GET request
	var get_options = {
		hostname: url.parse(access_code_url).hostname,
		port: 443,
		method: 'GET',
		path: "/v1/tags/"+query_submission.tag+"/media/recent?"+get_data
	};
	//mkae the request
	var get_req = https.request(get_options, function(res){
		res.setEncoding('utf8');
		var body = '';
		res.on('data', function(chunk){
			console.log(res.statusCode +": " + res.statusMessage);
			body += chunk;
		});
		res.on('end', function(){
			console.log(res.statusCode +": " + res.statusMessage);
			var result = JSON.parse(body);
			var data = result.data;
			var filteredPics = filterInstagramsByDate(
				convertDateToSeconds(query_submission.start_date), 
				convertDateToSeconds(query_submission.end_date),
				data);
			tagResponse.end(JSON.stringify(filteredPics));
		});
		res.on('error', function(err) {
        	console.log(err);
     	 });
	});
	get_req.end();
}
app.get('/process_get', function(req, res){

   // Prepare output in JSON format
   query_submission = {
       tag:req.query.tag,
       start_date:req.query.start_date,
       end_date:req.query.end_date,
   };
   console.log(query_submission);
   makeRequestByTag(query_submission, res);
});

var server = app.listen(8081, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port)

});

