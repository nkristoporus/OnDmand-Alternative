var express = require("express");
var app = express();
const mysql = require('mysql');
const bodyParser = require("body-parser");

const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const configDB = require('./config/database.js');

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
app.use(cookieParser());

app.set('view engine', 'ejs'); // set up ejs for templating

// possport session
app.use(session({ secret: 'bobbylovestoplayballs' }));
app.use(passport.initialize());
app.use(passport.session());	// persistent login sessions
app.use(flash());	// use connect-flash

// routes =================================================
require('./app/routes.js')(app, passport, connection);


// launch =================================================
app.listen(5000, process.env.IP);
