var express = require("express");
var app = express();
const mysql = require('mysql');
const bodyParser = require("body-parser");
const { check, validationResult } = require('express-validator/check');

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'jobsDB'
});

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());

app.get("/", function(req, res){
	connection.query("SELECT * FROM jobsDB", (err, result) => {
		if (err) throw err;
		res.render("home.ejs", {jobList: result});
		//res.end('Fetched...');
	});
});

app.get("/post", function(req, res){
	res.render("post.ejs");
});

app.get("/search", function(req,res){
	connection.query("SELECT * FROM jobsDB", (err, result) => {
		if (err) throw err;
		res.render("home.ejs", {jobList: result, searchTerm: req.body.search});
		//res.end('Fetched...');
	});
});

connection.connect(err => {
	if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	}

	console.log("connected as id " + connection.threadId);
});

// Create DB
app.get('/createJobTable', (req, res) => {
let sql = 'CREATE TABLE jobsDB(id int AUTO_INCREMENT, title VARCHAR(255), location VARCHAR(255), date DATE, wage INTEGER, description VARCHAR(1000), PRIMARY KEY (id))';
	connection.query(sql, (err, result) => {
		if (err) throw err;
		console.log(result);
		res.send('jobsDB table created');
	});
});

// Single Post
app.get('/getJobsbyID/:id', (req, res) => {
	let sql = `SELECT * FROM jobsDB WHERE id = ${req.params.id}`;
	let query = connection.query(sql, (err, result) => {
		if (err) throw err;
		console.log(result);
		res.send('Post fetched..');
	});
});

app.get('/getJobsByTitle/:title', (req, res) => {
	let jobTitle = req.params.title;
	let sql = `SELECT * FROM jobsDB WHERE title = "${jobTitle}"`;
	let query = connection.query(sql, (err, result) => {
		if (err) throw err;
		console.log(result);
		res.send('Post fetched..');
	})
})

// Update
app.get('/updatepost/:id', (req, res) => {
	let newTitle = "Updated Title";
	let sql = `UPDATE jobsDB SET title = "${newTitle}" WHERE id = ${req.params.id}`;
	let query = connection.query(sql, (err, result) => {
		if (err) throw err;
		console.log(result);
		res.send("Post updated...")
	})
});

app.get('/deletepost/:id', (req, res) => {
	let sql = `DELETE FROM jobsDB WHERE id = ${req.params.id}`;
	let query = connection.query(sql, (err, result) => {
		if (err) throw err;
		console.log(result);
		res.send("Post deleted");
	})
})

app.get("/jobList", (req, res) => {
	connection.query("SELECT * FROM jobsDB", (err, result) => {
		if (err) throw err;
		console.log(result);
		res.end('Fetched...');
	});
});

app.post("/post/validate", [
	check("jobTitle").exists(),
	check("jobLocation").exists(),
	check("jobDate").exists(),
	check("jobPay").exists(),
	check("jobDescription").exists(),
], (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.send("There are blank entries, please fill up the form correctly");
	}

	let post = {
		title: req.body.jobTitle,
		location: req.body.jobLocation,
		date: req.body.jobDate,
		wage: req.body.jobPay,
		description: req.body.jobDescription
	}

	let sql = 'INSERT INTO jobsDB SET ?';
	let query = connection.query(sql, post, (err, result) => {
		if (err) throw err;
		console.log(result);
		res.redirect('/');
	});

});

app.listen(3000, process.env.IP);
