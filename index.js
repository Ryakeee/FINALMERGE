//Package Dependencies
var mongodb = require('mongodb');
var express = require('express');
var sassMiddleware = require('node-sass-middleware');
var path = require('path');
var hbs = require('express-handlebars');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var bcrypt = require('bcrypt');

//Import Models
const collegeModel = require('./models/college');
const professorModel = require('./models/professor');
const userModel = require('./models/user');
const reviewModel = require('./models/review');
const commentModel = require('./models/comment');

//Environments Configuration
app.set('view engine', 'hbs');
app.set('port', (process.env.PORT || 3000));
app.engine('hbs',hbs({
	extname: 'hbs',
	defaultView: 'main',
	layoutsDir: __dirname + '/views/layouts/',
	partialsDir: __dirname + '/views/partials/',
	helpers: {
        ifCond: function(v1, v2, options) {
		  if(v1 === v2) {
		    return options.fn(this);
		  }
		  return options.inverse(this);
		},
		json: function(context) {
    		return JSON.stringify(context);
		}
    }
}));
app.use(sassMiddleware({
    src: __dirname + '/public/scss',
    dest: __dirname + '/public/css',
    debug: true,
    outputStyle: 'compressed',
    prefix:  '/css'
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// Configuration for handling API endpoint data
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//Route Definition
app.get('/', function(req, res){
	if (req.session.loggedin){
	 	professorModel.aggregate([{ $sample: { size: 3 } }]).then(function(qvProfs) {
	 		reviewModel.find({}).populate('profRef').populate('studentRef').sort({_id:-1}).limit(10).exec(function(err,mostRecent) {
	 			collegeModel.find({}).exec(function(err, col){
					var colleges = [];
					var reviews = [];

					col.forEach(function(document){
						colleges.push(document.toObject());
					});

		 			mostRecent.forEach(function(document){
						reviews.push(document.toObject());
					});

					res.render('frontend/home',{
						session: req.session,
						colleges: colleges,
				    	data: qvProfs,
				    	review: reviews,
						title: 'Home',
						jumbotronImage: '/assets/headers/home_header.jpg',
						jumbotronHeader: 'Welcome to CommForum',
						jumbotronMessage: 'This online platform aims to address all the concerns, judgment, and comments made by the students and alumni while maintaining a healthy and non-toxic environment in which the Lasallian Core Values are portrayed.',
						jumbotronLink: '/colleges',
						jumbotronBtn: 'View Colleges'
			    	});
	 			});
			});
		});
 	} else{
 		res.redirect('/login');
 		//console.log( bcrypt.hashSync('p@ssw0rd', 10) );
 	};
});

app.get('/colleges', function(req, res){
	if (req.session.loggedin){
		collegeModel.find({}).exec(function(err, result){
			var collegeObjects = [];

			result.forEach(function(document){
				collegeObjects.push(document.toObject());
			});

		  	res.render('frontend/colleges',{
		  		session: req.session,
		  		data: collegeObjects,
				title: 'Colleges',
				jumbotronImage: '/assets/headers/college_header.jpg',
				jumbotronHeader: 'Colleges',
				jumbotronMessage: 'De La Salle University has 7 Colleges with different specializations in which aims to hone the skills of diverse individuals in their track. These Colleges are each catered to developing the interior and exterior knowledge needed by an individual to be a fully-pledged Lasallian leader.',
				jumbotronLink: '/professors',
				jumbotronBtn: 'View Professors'
			});
		});
	} else{
		res.redirect('/login')
	}
});

app.get('/colleges/:college', function(req, res){
	if (req.session.loggedin){
		const link = req.params.college.toUpperCase();

		collegeModel.findOne({shortName: link}, function(err, college) {
			if(college === null){
				res.render('frontend/error',{
					session: req.session,
					error: '404',
	  				message: "The Page can't be found"
				});
			} else{
				res.render('frontend/colpage',{
					session: req.session,
					college: college.toObject(),
					jumbotronImage: '/assets/headers/colpage_header.jpg',
					jumbotronHeader: college.longName,
					jumbotronMessage: 'The ' + college.longName +' offers different degree programs in which aim to hone the skills of each individual and help them articulate the knowledge being dealt with them while striving to apply the Lasallian Core Values, which will resemble the breeding ground for the future Lasallian leaders.',
					jumbotronLink: '/colleges/' + college.shortName + '/professors',
					jumbotronBtn: 'View ' + college.shortName + ' Professors',
					title: link
				});
			}
		});
	} else{
		res.redirect('/login');
	}
});

app.get('/colleges/:college/professors', function(req, res){
	if (req.session.loggedin){
		const link = req.params.college.toUpperCase();

		professorModel.find({college: link}).exec(function(err, result){
			var professorObject = [];

			result.forEach(function(document){
				professorObject.push(document.toObject());
			});

			if(professorObject.length === 0){
				res.render('frontend/error',{
					session: req.session,
					error: '404',
	  				message: "The Page can't be found"
				});
			}
			else{
				res.render('frontend/professors',{
					session: req.session,
					professor: professorObject,
					title: link + ' Professors',
			      	jumbotronImage: '/assets/headers/colpage_header.jpg',
					jumbotronHeader: link + ' Professors',
					jumbotronMessage: 'The College of Liberal Arts has professors that promise to share all their knowledge and tools to effectively aid students in being graduates of their desired programs while embodying the Lasallian Core Values.',
					jumbotronLink: '/',
					jumbotronBtn: 'Back to Homepage',
				});
			}
		});
	} else{
		res.redirect('/login');
	}
});

app.get('/professors', function(req, res){
	if (req.session.loggedin){
		professorModel.find({}, null, {sort: {profName: 1}}).exec(function(err, result){
			var professorObject = [];

			result.forEach(function(document){
				professorObject.push(document.toObject());
			});

			if(professorObject.length === 0){
				res.render('frontend/error',{
					session: req.session,
					error: '404',
	  				message: "The Page can't be found"
				});
			}
			else{
				res.render('frontend/professors',{
					session: req.session,
					professor: professorObject,
					title: 'Professors',
			      	jumbotronImage: '/assets/headers/colpage_header.jpg',
					jumbotronHeader: 'Professors',
					jumbotronMessage: 'The Professors of De La Salle University aims to provide all the students with the necessary learning tools in obtaining knowledge to maximize all the skills and talents one must possess before being deployed to their chosen careers.',
					jumbotronLink: '/',
					jumbotronBtn: 'Back to Homepage',
				});
			}
		});
	} else{
		res.redirect('/login');
	}
});

app.get('/professors/:id', function(req, res){
	if (req.session.loggedin){
		const link = req.params.id;

		professorModel.findOne({profNumber: link}, function(err, professor) {
			if(professor === null){
				res.render('frontend/error',{
					session: req.session,
					error: '404',
	  				message: "The Page can't be found"
				});
			}
			else{
				var profData = professor.toObject();
				reviewModel.find({profRef: profData._id}).populate('profRef').populate('studentRef').sort({_id:-1}).exec(function(err,result) {
		 			var reviews = [];

		 			result.forEach(function(document){
						reviews.push(document.toObject());
					});

					collegeModel.findOne({shortName: profData.college}, function(err,college) {
						res.render('frontend/profpage',{
							session: req.session,
							studentRef: req.session.studentRef,
							studentId: req.session.idNum,
							professor: profData,
							college: college.toObject(),
							reviews: reviews,
							jumbotronImage: '/assets/headers/profpage_header.jpg',
							jumbotronHeader: profData.profName,
							jumbotronMessage: 'An exemplary Lasallian educator who teach minds, touch hearts, and transform lives by diligently teaching ' + profData.profCourse + ' from the ' + college.longName + '.',
							jumbotronLink: '/',
							jumbotronBtn: 'Back to Homepage',
							title: profData.profName
						});
					});
	 			});
			}
		});
	} else{
		res.redirect('/login');
	}
});

app.get('/reviews/:id', function(req,res){
	const link = req.params.id;

	reviewModel.findOne({_id: link}).populate('profRef').populate('studentRef').exec(function(err, review){

		if(review === null){
			res.render('frontend/error',{
				title: '404',
	  			status: '404'
			});
		}
		else{
			collegeModel.findOne({shortName: review.profRef.college}, function(err,college) {
				commentModel.find({reviewRef: review._id}).populate("reviewRef").populate("studentRef").exec(function(err, result){
					
					if(err){
						console.log(err);
					}
					else{
						//console.log(result);
						var comments = [];
						result.forEach(function(document){
							comments.push(document.toObject());
						});
						res.render('frontend/revpage', {
							college: college.toObject(),
							review: review.toObject(),
							comments: comments,
							session: req.session,
							title: "Review on " + review.profRef.profName,
							jumbotronImage: '/assets/headers/profpage_header.jpg',
							jumbotronHeader: review.profRef.profName,
							jumbotronMessage: 'An exemplary Lasallian educator who teach minds, touch hearts, and transform lives by diligently teaching ' + review.profRef.profCourse + ' from the ' + college.longName + '.',
							jumbotronLink: '/',
							jumbotronBtn: 'Back to Homepage'
						});	
					}
				});
			});
		}
	}); 
});

app.get('/profile', function(req, res){
	if (req.session.loggedin){
		reviewModel.find({studentId: req.session.idNum}).populate('profRef').populate('studentRef').sort({_id:-1}).exec(function(err,result) {
		 	var reviews = [];
		 	var comments = [];

			result.forEach(function(document){
				reviews.push(document.toObject());
			});

			var current_id = reviews[0].studentRef._id;

			commentModel.find({studentRef: current_id}).populate({path: 'reviewRef', model: 'review', populate: { path: 'profRef', model: 'professor'}}).populate('studentRef').sort({_id:-1}).exec(function(err, docs) {

				//console.log(docs[0].reviewRef.profRef.toObject());

				var comment;

				docs.forEach(function(document){
					comment = document.toObject();
					comment['profDetails'] = document.reviewRef.profRef.toObject();
					comments.push(comment);
				})

				//console.log(comments);

				res.render('frontend/profile',{
					session: req.session,
					reviews: reviews,
					comments: comments,
					title: 'Profile',
					session: req.session,
					jumbotronImage: '/assets/headers/user_header.jpg',
					jumbotronHeader: 'Hello ' + req.session.nickname + ',',
					jumbotronMessage: "This page shows your most recent contribution to the DLSU Community Forum. You may also change your password through the form below.",
					jumbotronBtn: 'Back to Homepage',
					jumbotronLink: '/'
				});
			});

		});
	} else{
		res.redirect('/login');
	}
});

app.get('/login', function(req,res) {
	if (req.session.loggedin) {
		res.render('frontend/error',{
			session: req.session,
			error: '403',
	  		message: "The Page is forbidden"
		});
	}
	else {
		res.render('login',{
			title: 'Log In',
			layout: 'authenticate'
		});
	}
});

app.get('/logout', function(req,res) {
	req.session.destroy();
	res.render('login',{
		title: 'Log In',
		layout: 'authenticate'
	});
	console.log('You have succesfully logged out.');
});

//Logical GET Methods
app.get('/getCourseByCollege', function(req, res) {
	var selectedCollege = req._parsedUrl.query;
		
	professorModel.find({ college: selectedCollege }).distinct('profCourse', function(err, result) {
		res.send(result);
	});
});
	
app.get('/getProfByCourse', function(req, res) {
	var selectedCourse = req._parsedUrl.query;
	
	professorModel.find({ profCourse: selectedCourse }).select('profName profNumber _id').exec(function(err, result) {
		res.send(result);
	});
});

app.get('/getProfDetails', function(req, res) {
	var data = req.query;
	
	professorModel.findOne({ profCourse: data.profCourse, profName: data.profName }).select('_id profNumber').exec(function(err, result) {
		res.send(result);
	});
});

//Backend Routes
app.get('/cf-admin', function(req,res) {
	if (req.session.loggedin) {
		if (req.session.admin) {
			collegeModel.countDocuments({}, function(err, collegeCount){
				reviewModel.countDocuments({}, function(err, reviewCount){
					professorModel.countDocuments({}, function(err, professorCount){
						userModel.countDocuments({}, function(err, userCount){
							res.render('backend/admin',{
								session: req.session,
								title: 'Dashboard',
								layout: 'backend',
								collegeCount: collegeCount,
								reviewCount: reviewCount,
								professorCount: professorCount,
								userCount: userCount,
								jumbotronImage: '/assets/headers/admin_header.jpg',
								jumbotronHeader: 'Welcome, Admin!',
								jumbotronMessage: 'Thank you for taking part in maintaining peace and order within our online platform. This is the backend of the website which has the ultimate power to moderate the contents and features of our Community Forum.',
								jumbotronLink: '/',
								jumbotronBtn: 'View Frontend'
							});
						});
					});
				});
			});
		} else {
			res.render('frontend/error',{
				session: req.session,
				error: '403',
	  			message: "Forbidden Access"
			});
		}
	} else{
		res.redirect('/login');
	}
});

app.get('/cf-admin/colleges', async function(req,res) {
	if (req.session.loggedin) {
		if (req.session.admin) {
			const collegeRes = await collegeModel.find({}).lean().exec(); //.exec() returns a Promise, so you can `await` it.
			const resultPromises = collegeRes.map(async college => { //arrow function is equivalent to function in this context
				const professorCount = await professorModel.countDocuments({ college: college.shortName });
				college.count = professorCount;
				return college;
			  });
			  const collegeObject = await Promise.all(resultPromises);

			res.render('backend/colleges',{
				session: req.session,
				data: collegeObject,
				title: 'College Panel',
				layout: 'backend',
				jumbotronImage: '/assets/headers/admin_header.jpg',
				jumbotronHeader: 'College Panel',
				jumbotronMessage: 'Welcome to the college panel. This page has the ultimate power to add, edit, and delete any college page found inside the Community Forum.',
				jumbotronLink: '/cf-admin',
				jumbotronBtn: 'Back to Dashboard'
			});
		} else{
			res.render('frontend/error',{
				session: req.session,
				error: '403',
				  message: "Forbidden Access"
			});
		}
	} else{
		res.redirect('/login');
	}
});

app.get('/cf-admin/reviews', async function(req,res) {
	if (req.session.loggedin) {
		if (req.session.admin) {
			const reviewRes = await reviewModel.find({}).populate('profRef').populate('studentRef').sort({_id:-1}).lean().exec(); //.exec() returns a Promise, so you can `await` it.
			const resultPromises = reviewRes.map(async review => { //arrow function is equivalent to function in this context
		    	const commentCount = await commentModel.countDocuments({ reviewRef: review._id }).populate('reviewRef').populate('studentRef');
		    	review.count = commentCount;
		    	return review;
		  	});
		  	const reviewObject = await Promise.all(resultPromises);

		  	commentModel.find({}).populate('reviewRef').populate('studentRef').exec(function(err, comments){
		  		var commentObject = [];

		 		comments.forEach(function(document){
					commentObject.push(document.toObject());
				});

		  		res.render('backend/reviews',{
					session: req.session,
					review: reviewObject,
					comment: commentObject,
					title: 'Review Panel',
					layout: 'backend',
					jumbotronImage: '/assets/headers/admin_header.jpg',
					jumbotronHeader: 'Review Panel',
					jumbotronMessage: 'Welcome to the Review’s Panel. This page has the capacity to edit any review and also delete certain reviews located in the DLSU Community Forum.',
					jumbotronLink: '/cf-admin',
					jumbotronBtn: 'Back to Dashboard'
				});
		  	});
		} else{
			res.render('frontend/error',{
				session: req.session,
				error: '403',
	  			message: "Forbidden Access"
			});
		}
	} else{
		res.redirect('/login');
	}
});

app.get('/cf-admin/professors', async function(req,res) {
	if (req.session.loggedin) {
		if (req.session.admin) {
			const professorRes = await professorModel.find({}).lean().sort({_id:1}).exec(); //.exec() returns a Promise, so you can `await` it.
			const resultPromises = professorRes.map(async professor => { //arrow function is equivalent to function in this context
		    	const reviewCount = await reviewModel.countDocuments({ profRef: professor._id });
		    	professor.count = reviewCount;
		    	return professor;
		  	});
		  	const professorObject = await Promise.all(resultPromises);

			res.render('backend/professors',{
				session: req.session,
				professor: professorObject,
				title: 'Professor Panel',
				layout: 'backend',
				jumbotronImage: '/assets/headers/admin_header.jpg',
				jumbotronHeader: 'Professor Panel',
				jumbotronMessage: 'Welcome to the Professor Panel. This page is not only for adding and deleting a professor but it also has the capability to edit the professor’s information and the course that they are currently teaching.',
				jumbotronLink: '/cf-admin',
				jumbotronBtn: 'Back to Dashboard'
			});
		} else{
			res.render('frontend/error',{
				session: req.session,
				error: '403',
	  			message: "Forbidden Access"
			});
		}
	} else{
		res.redirect('/login');
	}
});

app.get('/cf-admin/users', async function(req,res) {
	if (req.session.loggedin){
		if (req.session.admin){
			const userRes = await userModel.find({}).lean().sort({_id:1}).exec(); //.exec() returns a Promise, so you can `await` it.
			const resultPromises = userRes.map(async user => { //arrow function is equivalent to function in this context
		    	const reviewCount = await reviewModel.countDocuments({ studentId: user.studentId });
		    	user.count = reviewCount;
		    	return user;
		  	});
		  	const userObject = await Promise.all(resultPromises);

			res.render('backend/users',{
				session: req.session,
				user: userObject,
				title: 'User Panel',
				layout: 'backend',
				jumbotronImage: '/assets/headers/admin_header.jpg',
				jumbotronHeader: 'User Panel',
				jumbotronMessage: 'Welcome to the User Panel. This page has the ability to add, ban and delete a user participating inside the community forum while also having the freedom to update the user information.',
				jumbotronLink: '/cf-admin',
				jumbotronBtn: 'Back to Dashboard'
			});
		} else{
			res.render('frontend/error',{
				session: req.session,
				error: '403',
	  			message: "Forbidden Access"
			});
		}
	} else{
		res.redirect('/login');
	}
});

//Logical GET Methods
app.get('/getCourseByCollege', function(req, res) {
	var selectedCollege = req._parsedUrl.query;
		
	professorModel.find({ college: selectedCollege }).distinct('profCourse', function(err, result) {
		res.send(result);
	});
});
	
app.get('/getProfByCourse', function(req, res) {
	var selectedCourse = req._parsedUrl.query;
	
	professorModel.find({ profCourse: selectedCourse }).select('profName profNumber _id').exec(function(err, result) {
		res.send(result);
	});
});

app.get('/getProfDetails', function(req, res) {
	var data = req.query;
	
	professorModel.findOne({ profCourse: data.profCourse, profName: data.profName }).select('_id profNumber').exec(function(err, result) {
		res.send(result);
	});
});

//POST Methods
app.post('/auth', function(req,res) {
	var user = {
    	studentId: req.body.studentId,
    	password: req.body.password,
	};

	userModel.findOne({studentId: user.studentId}, function(err, userQuery){
		if (err) {
			console.log(err.errors);
	    	result = { success: false, message: "Error in DB validation!" }
	    	res.send(result);
		}
		if (userQuery){
			console.log('User found!');

			//console.log("password:" + user.password);
			//console.log("hash: " + userQuery);

			if(bcrypt.compareSync(user.password, userQuery.password)) {
				req.session.nickname = userQuery.studentName.substr(0, userQuery.studentName.indexOf(' '));
				req.session.fullname = userQuery.studentName;
				req.session.studentRef = userQuery._id;
				req.session.idNum = userQuery.studentId;
				req.session.admin = userQuery.isAdmin;
				req.session.banned = userQuery.isBanned;
				req.session.loggedin = true;
				result = { status: 1, success: true, message: "Log In Succesfull! Redirecting you to homepage..." }
				res.send(result);
			} else {
				result = { status: 0, success: false, message: "Password incorrect! Please try again." }
				res.send(result);
			} 
		} else {
			result = { status: -1, success: false, message: "Username not found! Please try again." }
			res.send(result);
		}
	});
});

app.post('/addUser', function(req, res) {
	var newUser = new userModel({
  		studentName: req.body.studentName,
    	studentId: req.body.studentId,
    	password: req.body.password,
    	isAdmin: req.body.isAdmin
	});

	userModel.findOne({studentId: newUser.studentId}, function(err1, userQuery){
		if (err1) {
			console.log(err1.errors);
	    	result = { success: false, message: "Error in DB validation!" }
	    	res.send(result);
		}
		if (userQuery){
			console.log('User found!');
			result = { success: false, message: "User already exists! Please sign in!" }
	    	res.send(result);
		} else{
			newUser.save(function(err2, user) {
				if (err2) {
					console.log(err2.errors);
	    			result = { success: false, message: "User was not registered!" }
	    			res.send(result);
				} else {
					console.log("Successfully registered user!");
	    			console.log(user);
	    			result = { success: true, message: "User has succesfully registered!" }
	    			res.send(result);
				}
			});
		}
	});
});

app.post('/addReview', function(req, res) {
	if (req.session.banned){
		var result;
		result = { success: false, message: "Your account is BANNED!" }
		res.send(result);
	} else{
		var newReview = new reviewModel({
		  	profRef: req.body.profRef,
		    profNumber: req.body.profNumber,
		    profCourse: req.body.profCourse,
		    studentRef: req.body.studentRef,
		    studentId: req.body.studentId,
		    reviewContent: req.body.reviewContent,
	  	});

	  	newReview.save(function(err, review) {
			var result;
			if (err) {
		    	console.log(err.errors);
		    	result = { success: false, message: "Error in adding review!" }
		    	res.send(result);
		    } else {
		    	//console.log(review);
		    	result = { success: true, message: "Successfully added review!" }
		    	res.send(result);
		    }
		});
	}
});

app.post('/addComment', function(req, res) {

	var newComment = new commentModel({
		reviewRef: req.body.reviewRef,
	 	 studentRef: req.body.studentRef,
	  	commentContent: req.body.commentContent,
	});
  
	newComment.save(function(err, comment) {
	  var result;
  
	  if (err) {
		console.log(err.errors);
  
		result = { success: false, message: "Comment was not posted!" }
		res.send(result);
	  } else {
		console.log("Successfully added comment!");
		//console.log(comment);
  
		result = { success: true, message: "Comment posted!" }
  
		res.send(result);
	  }
  
	});
  });

app.post('/savePost', function(req, res) {

	var id = req.body.id;
	var content = req.body.content;

	reviewModel.findOne({_id: id}, function(err, doc){
		var result;

		if(err){
			console.log(err.errors);
  
			result = { success: false, message: "Review was not successfully saved!" }
			res.send(result);

		}
		else{
			doc.reviewContent = content;
			doc.save();

			console.log("Successfully saved review!");
			//console.log(doc);
  
			result = { success: true, message: "Review saved!" }
			res.send(result);
		}
	});
  });

app.post('/saveComment', function(req, res) {

	var id = req.body.id;
	var content = req.body.content;

	commentModel.findOne({_id: id}, function(err, doc){
		var result;

		if(err){
			console.log(err.errors);
  
			result = { success: false, message: "Comment was not successfully saved!" }
			res.send(result);
		}
		else{
			doc.commentContent = content;
			doc.save();

			console.log("Successfully saved comment!");
			//console.log(doc);
  
			result = { success: true, message: "Comment saved!" }
			res.send(result);
		}
	});
  });

app.post('/deletePost', function(req, res) {

	var id = req.body.id;

	commentModel.deleteMany({ reviewRef: id}, function (err) {
  		if(err){
  			console.log(err);
  		}
  		else{
  			reviewModel.deleteOne({ _id: id }, function (err) {
			 
				if(err){
					console.log(err.errors);
	  
					result = { success: false, message: "Review was not successfully deleted!" }
					res.send(result);
				} else {
					console.log("Successfully deleted review!");
			
					result = { success: true, message: "Review deleted!" }
					res.send(result);
				}
			});
  		}
	});
  });

app.post('/deleteComment', function (req, res) {

	var id = req.body.id;

	commentModel.deleteOne({ _id: id }, function (err) {

		if (err) {
			console.log(err.errors);

			result = {
				success: false,
				message: "Comment was not successfully deleted!"
			}
			res.send(result);
		} else {
			console.log("Successfully deleted comment!");

			result = {
				success: true,
				message: "Comment deleted!"
			}
			res.send(result);
		}
	});
});

//HTTP Status Routes
app.use(function (req, res, next) {
  res.status(404).render('frontend/error',{
  	session: req.session,
  	error: '404',
  	message: "The Page can't be found"
  });
});

app.use(function (req, res, next) {
  res.status(500).render('frontend/error',{
  	session: req.session,
  	error: '500',
  	message: 'Internal Server Error'
  });
});

app.listen(app.get('port'), function(){
	console.log('Server started on port ' + app.get('port'));
});

//Testers

/*
app.get('/professors/addOne', function(req, res){
	var prof = new professorModel({
		college: "CLA",
		gender: "Male",
		profAge: "Mark Anthony Dacela",
		profCourse: "GEETHIC"
  	});

  	prof.save(function(err, res) {
    	console.log(prof);
	});
});
*/

/*
app.get('/professors/testSort', function(req,res){
	userModel.find({}, null, {sort: {_id: -1}}).exec(function(err,result){
		console.log(result);
	});
});
*/

/*
app.get('/testCount', async function(req, res) { // note the async keyword
	const collegeRes = await collegeModel.find({}).lean().exec() // .exec() returns a Promise, so you can `await` it.
	const resultPromises = collegeRes.map(async college => { // arrow function is equivalent to function in this context
    	const professorCount = await professorModel.countDocuments({ college: college.shortName });
    	college.count = professorCount;
    	return college;
  	});
  	const collegeObject = await Promise.all(resultPromises);
  	console.log(collegeObject);
});
*/