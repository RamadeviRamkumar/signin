const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const twilio = require('twilio');
const User_signup = require('../model/model.js');
const Controller = require('../controller/controllers.js');
var mongoose = require('mongoose');
var User = mongoose.model('list');

const accountSid = "AC87a8fc73b94fbe3d3c380c0848d31c77";
const authToken = "395421117a76c3276285a5d53302ad82";
const twilioPhoneNumber = "+12565677073";

const client = new twilio(accountSid, authToken);
router.use(bodyParser.urlencoded({ extended: true }));

const phoneNumbers = {};

function generateOTP() {
  let otp = Math.floor(100000 + Math.random() * 900000);
  console.log(otp);
  return otp;
}

function sendOTP(phoneNumber, otp) {
  return client.messages.create({
    body: `Your OTP is: ${otp}`,
    from: twilioPhoneNumber,
    to: phoneNumber
  });
}
router.get('/read', function (req, res) {
    res.json({
      status: 'API Works',
      message: 'Welcome to User Signin/Signup API'
    });
  });
  router.post('/signin', async (req, res) => {
    const { phoneNumber } = req.body;
  
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    const otp = generateOTP();
  
    try {
      let user = await User.findOne({ phoneNumber });
      if (!user) {
        user = new User({ phoneNumber });
      }
      
      user.otp = otp;
      await user.save();
      await sendOTP(phoneNumber, otp);
      res.json({ success: true, message: 'OTP sent successfully' });
    } catch (err){
        console.error(err);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  });
  router.post('/verifyOTP', async (req, res) => {
    const { phoneNumber, otp } = req.body;
  
    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }
  
    try {
      // Find the user by phone number and verify the OTP
      const user = await User.findOne({ phoneNumber });
  
      if (user && user.otp === otp) {
        res.json({ success: true, message: 'OTP is valid' });
      } else {
        console.log("phoneNumber", phoneNumber);
        console.log("otp", otp);
        res.status(401).json({ error: 'Invalid OTP' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  });
  
    
   router.post('/register', async (req, res) => {
    try {
      const user = new user_signup({
        userName: req.body.userName,
        phoneNumber: req.body.phoneNumber,
      });
  
      await user.save();
  
      res.json({
        message: 'New user signed up successfully',
        data: {
          userName: user.userName,
          phoneNumber: user.phoneNumber,
        },
      });
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json('User already signed up using this phone number');
      } else {
        console.log(error);
        res.status(500).json('Internal Server Error', error);
      }
    }
  });
  
  router.route('/user')
    .get(Controller.index);
  
  router.route('/user/:number')
    .get(Controller.view)
    .patch(Controller.update)
    .put(Controller.update)
    .delete(Controller.Delete);
  
  module.exports = router;
  
  