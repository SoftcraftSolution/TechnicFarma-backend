const User = require('../model/user.model');
const bcrypt = require('bcryptjs');
const responseStructure = require('../middleware/response');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, fullname, gender, phonenumber, dob } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json(responseStructure.error('User already exists'));
    }

    // Create a new user
    user = new User({
      email,
      password,
      fullname,
      gender,
      phonenumber,
      dob
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user
    await user.save();

    res.status(201).json(responseStructure.success(user, 'User registered successfully'));
  } catch (err) {
    console.error(err.message);
    res.status(500).json(responseStructure.error('Server error', 500));
  }
};

// Login a user
exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if the user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json(responseStructure.error('Invalid Credentials'));
      }
  
      // Check if the password is correct
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json(responseStructure.error('Invalid Credentials'));
      }
  
      // Manually set isvalidate in the response
      const userData = {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        gender: user.gender,
        phonenumber: user.phonenumber,
        dob: user.dob,
        isadminapproved: user.isadminapproved,
        isvalidate: true, // Assuming login success means user is validated
        createdAt: user.createdAt
      };
  
      res.status(200).json(responseStructure.success(userData, 'Login successful'));
    } catch (err) {
      console.error(err.message);
      res.status(500).json(responseStructure.error('Server error', 500));
    }
  };
exports.updateIsAdminApproved = async (req, res) => {
    const userId = req.query.id;
    const { isadminapproved } = req.body;
  
    try {
      // Find the user by ID
      let user = await User.findById(userId);
      if (!user) {
        return res.status(404).json(responseStructure.error('User not found'));
      }
  
      // Update the isadminapproved field
      user.isadminapproved = isadminapproved;
      await user.save();
  
      res.status(200).json(responseStructure.success(user, 'User approval status updated successfully'));
    } catch (err) {
      console.error(err.message);
      res.status(500).json(responseStructure.error('Server error', 500));
    }
  };