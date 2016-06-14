//simple GET/POST requests

//client makes request

//server should respond

//on locahost

//finished steps 1-2 of instagram authentication
//3 next request access token through post request
var express = require('express');
var app = express();

var clientID = "5648166b11ba4f2ebf1d0c35e99d51d4";
var clientSecret = "0c38865cbd06460a9f0c16e079975541";
var redirectURL = "http://localhost:8081/instagram/index.html";
//what does this do?
app.use(express.static('public'));

app.get('/index.html', function(req, res){
	// res.sendFile(__dirname + "/" + "index.html");
	res.redirect("https://api.instagram.com/oauth/authorize/?client_id="+clientID+"&redirect_uri="+redirectURL+"&response_type=code");
});

app.get('/process_get', function(req, res){
	//prepare output in JSON
	response = {
		first_name:req.query.first_name,
		last_name:req.query.last_name
	};
	console.log(response);
	res.end(JSON.stringify(response));
});

app.get('/instagram/index.html', function(req, res){
	res.sendFile(__dirname + "/" + "index.html");
});

//Post
app.post('/', function(req, res){
	console.log("Got a POST request for the homepage");
	res.send('Hello POST');
});

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});

