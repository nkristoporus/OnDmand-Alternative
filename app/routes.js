const { check, validationResult } = require('express-validator/check');

module.exports = (app, passport, connection) => {

  // order date ASCENDING
  app.get("/orderDate", (req, res) => {
  	connection.query(`SELECT * FROM jobsDB ORDER BY date ASC`, (err, result) => {
  		//console.log(result);
  		if (err) throw err;
  		res.render("home.ejs", { jobList: result });
  	});
  });

  // order the table by filter
  app.get("/orderBy/:filter", (req, res) => {
  	connection.query(`SELECT * FROM jobsDB ORDER BY ${req.params.filter}`, (err, result) => {
  		//console.log(result);
  		if (err) throw err;
  		res.render("home.ejs", { jobList: result });
  	});
  });

  // HOME PAGE
  app.get("/", function(req, res){
  	connection.query("SELECT * FROM jobsDB", (err, result) => {
  		if (err) throw err;
  		res.render("home.ejs", { jobList: result });
  	});
  });

  // LOGIN PAGE
  app.get('/login', (req, res) => {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // SIGN UP PAGE
  app.get('/signup', (req, res) => {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  app.get("/post", (req, res) => {
  	res.render("post.ejs");
  });

  app.post("/search", (req, res) => {
  	let jobTitle = req.body.search;
  	console.log(jobTitle);

  	let sql = `SELECT * FROM jobsDB WHERE title LIKE "%${jobTitle}%"`;
  	let query = connection.query(sql, (err, result) => {
  		if (err) throw err;
  		console.log(result);
  		res.render("home.ejs", {jobList: result});
  		// res.send('Post fetched..');
  	});
  });

  connection.connect(err => {
  	if (err) {
  		console.error('error connecting: ' + err.stack);
  		return;
  	}

  	console.log("connected as id " + connection.threadId);
  });

  // create DB
  app.get('/createDB', (req, res) => {
  	let sql = 'CREATE DATABASE jobsDB';
  	connection.query(sql, (err, result) => {
  		if (err) throw err;
  		console.log(result);
  		res.send("Created DB");
  	})
  })

  // Create TABLE
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

  // Get by Title
  app.get('/getJobsByTitle/:title', (req, res) => {
  	let jobTitle = req.params.title;
  	let sql = `SELECT * FROM jobsDB WHERE title = "${jobTitle}"`;
  	let query = connection.query(sql, (err, result) => {
  		if (err) throw err;
  		console.log(result);
  		res.send('Post fetched..');
  	});
  });

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
  		res.redirect('/');
  	});
  });

  // get all
  app.get("/jobList", (req, res) => {
  	connection.query("SELECT * FROM jobsDB", (err, result) => {
  		if (err) throw err;
  		console.log(result);
  		res.end('Fetched...');
  	});
  });

// signup page
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // profile
    failureRedirect: '/signup',
    failureFlash: true
  }));

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true  // allow flash messages
  }))

  // POST to Database,
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
};

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();  // carry on

  res.redirect('/');  // not isAuthenticated
}
