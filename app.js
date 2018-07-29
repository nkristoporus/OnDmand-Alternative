var express = require("express");
var app = express();
const mysql = require('mysql');
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
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

mongoose.connect('localhost/config');	// connect to database

require('./config/passport')(passport); // passport config

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());
app.use(cookieParser());

app.set('view engine', 'ejs'); // set up ejs for templating

// possport session
app.use(express.static('public'));

app.use(session({ secret: 'bobbylovestoplayballs' }));
app.use(passport.initialize());
app.use(passport.session());	// persistent login sessions
app.use(flash());	// use connect-flash

// routes =================================================
require('./app/routes.js')(app, passport, connection);


// launch =================================================
const server = app.listen(5000, process.env.IP);

//socket.io instantiation
const io = require("socket.io")(server)

//listen on every connection
io.on('connection', (socket) => {
	console.log('New user connected')

	//default username
	socket.username = "Anonymous"

    //listen on change_username
    socket.on('change_username', (data) => {
        socket.username = data.username
    })

    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
        io.sockets.emit('new_message', {message : data.message, username : socket.username});
    })

    //listen on typing
    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : socket.username})
    })
});
