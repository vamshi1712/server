var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');

var Event = require('../../models/event');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');



// user registration
// router.post('/addEvent', function (req, res, next) {
//     var event = new Event({
//         title: req.body.title,
//         phone: req.body.phone,
//         location: req.body.location,
//         address: req.body.address,
//         description: req.body.description,
//         isHost: req.body.isHost,
//         email: req.body.email,
//         pincode: req.body.pincode
//     });
// // save user to db
//     event.save((err) => {
//         // Check if error occured
//         if (err) {
//           // Check if error is an error indicating duplicate account
//           if (err.code === 11000) {
//             res.status(401).json({ success: false, message: 'Username or e-mail already exists' }); // Return error
//           } 
//           else {
//                   res.status(200).json({
//                     success : true,
//                     message : 'Successfully added '
//             }); // Return success
//         }
//     } 
        
// });
// });



router.post('/newEvent', (req, res) => {
    // var event = new Event({
    //             title: req.body.title,
    //             phone: req.body.phone,
    //             location: req.body.location,
    //             address: req.body.address,
    //             description: req.body.description,
    //             isHost: req.body.isHost,
    //             email: req.body.email,
    //             pincode: req.body.pincode
    //         });
    // Check if blog title was provided
    if (!req.body.title) {
      res.json({ success: false, message: 'Event title is required.' }); // Return error message
    } else {
      // Check if blog body was provided
      if (!req.body.body) {
        res.json({ success: false, message: 'Event body is required.' }); // Return error message
      } else {
        // Check if blog's creator was provided
        if (!req.body.isHost) {
          res.json({ success: false, message: 'Blog creator is required.' }); // Return error
        } else {
          // Create the blog object for insertion into database
          const event = new Event({
            title: req.body.title, // Title field
            description: req.body.description, // Body field
            isHost: req.body.isHost // CreatedBy field
          });
          // Save blog into database
          event.save((err) => {
            // Check if error
            if (err) {
              // Check if error is a validation error
              if (err.errors) {
                // Check if validation error is in the title field
                if (err.errors.title) {
                  res.json({ success: false, message: err.errors.title.message }); // Return error message
                } else {
                  // Check if validation error is in the body field
                  if (err.errors.body) {
                    res.json({ success: false, message: err.errors.body.message }); // Return error message
                  } else {
                    res.json({ success: false, message: err }); // Return general error message
                  }
                }
              } else {
                res.json({ success: false, message: err }); // Return general error message
              }
            } else {
              res.json({ success: true, message: 'Event saved!' }); // Return success message
            }
          });
        }
      }
    }
  });


  router.get('/events', (req, res) => {
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