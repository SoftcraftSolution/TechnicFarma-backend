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
    const savedUser = await user.save();

    console.log(savedUser); // Log the saved user to ensure it includes all fields

    res.status(201).json(responseStructure.success(savedUser, 'User registered successfully'));
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
  exports.getUser = async (req, res) => {
   // Assuming userId is passed as a query parameter
  
    try {
      // Fetch the salesman by userId and sort by createdAt descending
      const salesman = await User.find()
  
      // Check if salesman is found
      if (!salesman || salesman.length === 0) {
        return res.status(404).json(responseStructure.error('Salesman not found'));
      }
  
      // Structure the response
      const response = responseStructure.success(salesman, 'Salesman fetched successfully');
  
      // Send the response back to the client
      res.status(200).json(response);
    } catch (error) {
      // Handle errors
      console.error('Error Fetching Salesman:', error);
      const errorMessage = error.message || 'Error fetching salesman';
      res.status(500).json(responseStructure.error(errorMessage));
    }
  };
 exports.updateStatus= async (req, res) => {
    const { id } = req.query;
    const { isActive } = req.body;
  
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, runValidators: true }
      );
  
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
  
      res.send(user);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }
  exports.getActiveUsersToday = async (req, res) => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
  
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
  
      const activeUsers = await User.countDocuments({
        lastActive: { $gte: startOfDay, $lte: endOfDay },
        isActive: true,
      });
  
      res.status(200).json(responseStructure.success({ totalActiveUsers: activeUsers }, 'Total active users today fetched successfully'));
    } catch (error) {
      console.error('Error fetching active users:', error);
      res.status(500).json(responseStructure.error('Server error', 500));
    }
  };
  exports.getInactiveUsersToday = async (req, res) => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
  
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
  
      const inactiveUsers = await User.countDocuments({
        lastActive: { $gte: startOfDay, $lte: endOfDay },
        isActive: false,
      });
  
      res.status(200).json(responseStructure.success({ totalInactiveUsers: inactiveUsers }, 'Total inactive users today fetched successfully'));
    } catch (error) {
      console.error('Error fetching inactive users:', error);
      res.status(500).json(responseStructure.error('Server error', 500));
    }
  };