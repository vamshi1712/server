var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var User = require('../models/user');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
 
// // Connection URL
// const url = 'mongodb://localhost:27017/twdb';
 
// // Database Name
// const dbName = 'twdb';


// user registration
router.post('/signup', function (req, res, next) {
    var user = new User({
        fullname: req.body.fullname,
        password: bcrypt.hashSync(req.body.password, 10),
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location,
        pincode: req.body.pincode,
        isMarried: req.body.isMarried,
        isUser: req.body.isUser,
        isHost: req.body.isHost
    });

// save user to db
    user.save((err) => {
        // Check if error occured
        if (err) {
          // Check if error is an error indicating duplicate account
          if (err.code === 11000) {
            res.status(401).json({ success: false, message: 'Username or e-mail already exists' }); // Return error
          } 
          else {
            var token = jwt.sign({user: user}, 'secret', {expiresIn: 7200});
            res.status(200).json({
              success:true,
              message: 'Successfully logged in',
              token: token,
              userId: user._id              
            }); // Return success
        }
      } 
        
    });


    

  });



// user Login

router.post('/login', (req, res) => {
    // Check if username was provided
    if (!req.body.email) {
      res.status(401).json({ success: false, message: 'No email was provided' }); // Return error
    } else {
      // Check if password was provided
      if (!req.body.password) {
        res.status(401).json({ success: false, message: 'No password was provided.' }); // Return error
      } else {
        // Check if username exists in database
        User.findOne({ email: req.body.email }, (err, user) => {
          // Check if error was found
          if (err) {
            res.status(500).json({ success: false, message: 'Invalid Credentials' }); // Return error
          } 
          if (!user) {
            res.status(401).json({ success: false,title: 'failed', message: 'user not found.' }); // Return error
          }


          else {
            
              const validPassword = bcrypt.compareSync(req.body.password, user.password); // Compare password provided to password in database
              // Check if password is a match
              if (!validPassword) {
                res.status(401).json({ success: false, message: 'Password invalid' }); // Return error
              }
               else {
                var token = jwt.sign({user: user}, 'secret', {expiresIn: 7200});
                res.status(200).json({
                    success: true,
                    message: 'Successfully logged in',
                    token: token,
                    userId: user._id
            });  // Return success and token to frontend
              }
            }

        });
      }
    }
  });


  router.get('/profile', (req, res) => {
    // Search for user in database
    User.findOne({ _id: req.decoded.userId }).select('username email').exec((err, user) => {
      // Check if error connecting
      if (err) {
        res.json({ success: false, message: err }); // Return error
      } else {
        // Check if user was found in database
        if (!user) {
          res.json({ success: false, message: 'User not found' }); // Return error, user was not found in db
        } else {
          res.json({ success: true, user: user }); // Return success, send user object to frontend for profile
        }
      }
    });
  });




  router.post('/edit', function(req, res, next) {
    MongoClient.connect(dburl, function(err, db) {
      if(err) { throw err;  }
      var collection = db.collection('careers');
      //var careers = {'job_title': req.body.job_title, 'role': req.body.role, 'location': req.body.location, 'experience': req.body.experience, 'salary': req.body.salary, 'job_type': req.body.job_type, 'skills': req.body.skills, 'job_description': req.body.job_description};
      collection.update({'_id':new mongodb.ObjectID(req.body.id)}, {$set:{'job_title': req.body.job_title, 'role': req.body.role, 'location': req.body.location, 'experience': req.body.experience,'salary': req.body.salary,'job_type': req.body.job_type,'skills': req.body.skills, 'job_description': req.body.job_description }}, function(err, result) {
      if(err) { throw err; }
        db.close();
        res.redirect('/adminlogin');
       });
    });
  });



// router.post('/login', function(req, res, next) {
//     User.findOne({email: req.body.email}, function(err, user) {
//         if (err) {
//             return res.status(500).json({
//                 title: 'An error occurred',
//                 error: err
//             });
//         }
//         if (!user) {
//             return res.status(401).json({
//                 title: 'Login failed',
//                 error: {message: 'Invalid login credentials'}
//             });
//         }
//         if (!bcrypt.compareSync(req.body.password, user.password)) {
//             return res.status(401).json({
//                 title: 'Login failed',
//                 error: {message: 'Invalid login credentials'}
//             });
//         }
//         var token = jwt.sign({user: user}, 'secret', {expiresIn: 7200});
//         res.status(200).json({
//             message: 'Successfully logged in',
//             token: token,
//             userId: user._id
//         });
//     });
// });

module.exports = router;
