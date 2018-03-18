var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var Admin = require('../models/admin');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
 



// user registration
router.post('/signup', function (req, res, next) {
    var admin = new Admin({
        fullname: req.body.fullname,
        password: bcrypt.hashSync(req.body.password, 10),
        email: req.body.email,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin
    });

// save user to db
    admin.save((err) => {
        // Check if error occured
        if (err) {
          // Check if error is an error indicating duplicate account
          if (err.code === 11000) {
            res.status(401).json({ success: false, message: 'Username or e-mail already exists' }); // Return error
          } 
          else {
            var token = jwt.sign({admin: admin}, 'secret', {expiresIn: 7200});
                              res.status(200).json({
                                  success:true,
                                  message: 'Successfully logged in',
                                  token: token,
                                  adminId: admin._id
                          }); // Return success
        }
        } 
        
      });

  });



// admin Login

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
        Admin.findOne({ email: req.body.email }, (err, admin) => {
          // Check if error was found
          if (err) {
            res.status(500).json({ success: false, message: 'Invalid Credentials' }); // Return error
          } 
          if (!admin) {
            res.json({ success: false, message: 'user not found.' }); // Return error
          }


          else {
            
              const validPassword = bcrypt.compareSync(req.body.password, admin.password); // Compare password provided to password in database
              // Check if password is a match
              if (!validPassword) {
                res.status(401).json({ success: false, message: 'Password invalid' }); // Return error
              }
               else {
                var token = jwt.sign({admin: admin}, 'secret', {expiresIn: 7200});
                res.status(200).json({
                    success: true,
                    message: 'Successfully logged in',
                    token: token,
                    adminId: admin._id
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






module.exports = router;
