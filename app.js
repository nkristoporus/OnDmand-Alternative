var express = require("express");
var app = express();

app.get("/", function(req, res){
	res.render("home.ejs");
});

app.get("/post", function(req, res){
	res.render("post.ejs");
});

app.listen(3000, process.env.IP);