var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var Host = require('../models/host');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
 



// user registration
router.post('/signup', function (req, res, next) {
    var host = new Host({
        fullname: req.body.fullname,
        password: bcrypt.hashSync(req.body.password, 10),
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location,
        pincode: req.body.pincode,
        isUser: req.body.isUser,
        isHost: req.body.isHost
    });

// save user to db
    host.save((err) => {
        // Check if error occured
        if (err) {
          // Check if error is an error indicating duplicate account
          if (err.code === 11000) {
            res.status(401).json({ success: false, message: 'Username or e-mail already exists' }); // Return error
          } 
          else {
            var token = jwt.sign({host: host}, 'secret', {expiresIn: 7200});
            res.status(200).json({
              success:true,
              message: 'Successfully logged in',
              token: token,
              hostId: host._id
           }); // Return success
        }
      } 
        
    });

 });



// host Login

router.post('/login', (req, res) => {
    // Check if email was provided
    if (!req.body.email) {
      res.status(401).json({ success: false, message: 'No email was provided' }); // Return error
    } else {
      // Check if password was provided
      if (!req.body.password) {
        res.status(401).json({ success: false, message: 'No password was provided.' }); // Return error
      } else {
        // Check if username exists in database
        Host.findOne({ email: req.body.email }, (err, host) => {
          // Check if error was found
          if (err) {
            res.status(500).json({ success: false, message: 'Invalid Credentials' }); // Return error
          } 
          if (!host) {
            res.json({ success: false, message: 'user not found.' }); // Return error
          }
          else {
            
              const validPassword = bcrypt.compareSync(req.body.password, host.password); // Compare password provided to password in database
              // Check if password is a match
              if (!validPassword) {
                res.status(401).json({ success: false, message: 'Password invalid' }); // Return error
              }
               else {
                var token = jwt.sign({host: host}, 'secret', {expiresIn: 7200});
                res.status(200).json({
                    success: true,
                    message: 'Successfully logged in',
                    token: token,
                    hostId: host._id
            });  // Return success and token to frontend
              }
            }

        });
      }
    }
  });

  router.use((req, res, next) => {
    const token = req.headers['token']; // Create token found in headers
    // Check if token was found in headers
    if (!token) {
      res.json({ success: false, message: 'No token provided' }); // Return error
    } else {
      // Verify the token is valid
      jwt.verify(token, config.secret, (err, decoded) => {
        // Check if error is expired or invalid
        if (err) {
          res.json({ success: false, message: 'Token invalid: ' + err }); // Return error for token validation
        } else {
          req.decoded = decoded; // Create global variable to use in any request beyond
          next(); // Exit middleware
        }
      });
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






module.exports = router;
