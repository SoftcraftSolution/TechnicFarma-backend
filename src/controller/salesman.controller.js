const cloudinary = require('cloudinary').v2;
const Salesman = require('../model/salesman.model');
const responseStructure = require('../middleware/response');
const User = require('../model/user.model');

exports.addSalesman = async (req, res) => {
    try {
      // Extract the necessary fields from the request body
      const { location } = req.body;
      const userId = req.body.userId; // Assuming userId is passed in the request body
  
      // Log the received data for debugging
      console.log('Received Data:', { location, image: req.file, userId });
  
      // Function to upload image to Cloudinary
      const uploadToCloudinary = async (filePath) => {
        try {
          const result = await cloudinary.uploader.upload(filePath);
          return result.secure_url;
        } catch (error) {
          throw new Error(`Error uploading image: ${error.message}`);
        }
      };
  
      let imageUrl; // Initialize imageUrl variable
  
      // Determine the image URL to use
      if (req.file) {
        console.log('Uploading Image:', req.file);
        imageUrl = await uploadToCloudinary(req.file.path);
      }
  
      // Create a new salesman object
      const newSalesman = new Salesman({
        userId: userId,
        location,
        image: imageUrl, // Set the image URL (either uploaded or default)
      });
  
      // Save the salesman object to the database
      const savedSalesman = await newSalesman.save();
  
      // Structure the response
      const response = responseStructure.success({
        location: savedSalesman.location,
        image: savedSalesman.image
      }, 'Salesman added successfully');
  
      // Send the response back to the client
      res.status(201).json(response);
    } catch (error) {
      // Handle errors
      console.error('Error Adding Salesman:', error);
      const errorMessage = error.message || 'Error adding salesman';
      res.status(500).json(responseStructure.error(errorMessage));
    }
  };
  
  exports.getSalesmanByUserId = async (req, res) => {
    const userId = req.query.userId; // Assuming userId is passed as a query parameter
  
    try {
      // Fetch the salesman by userId and sort by createdAt descending
      const salesman = await User.find({ userId: userId }).sort({ createdAt: -1 });
  
      // Check if salesman is found
    
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
  exports.updateSalesmanLocation = async (req, res) => {
    const { userId, location } = req.body; // Extract userId and location from request body
  
    try {
      // Validate input
      if (!userId || !location) {
        return res.status(400).json(responseStructure.error('Missing userId or location'));
      }
  
      // Find the salesman by userId and update location
      const updatedSalesman = await Salesman.findOneAndUpdate(
        { userId: userId },
        { location: location },
        { new: true } // Return the updated document
      );
  
      // Check if salesman is found and updated
      if (!updatedSalesman) {
        return res.status(404).json(responseStructure.error('Salesman not found'));
      }
  
      // Structure the response
      const response = responseStructure.success(updatedSalesman, 'Salesman location updated successfully');
  
      // Send the response back to the client
      res.status(200).json(response);
    } catch (error) {
      // Handle errors
      console.error('Error Updating Salesman Location:', error);
      const errorMessage = error.message || 'Error updating salesman location';
      res.status(500).json(responseStructure.error(errorMessage));
    }
  };
  exports.getLocationData = async (req, res) => {
    try {
      // Fetch user data with only necessary fields
      const users = await User.find({}, 'fullname phonenumber isActive  createdAt _id'); // Adjust fields as necessary
  
      // Fetch salesman data and populate user details
      const salesmen = await Salesman.find()
        .populate({
          path: 'userId',
          select: 'fullname phonenumber' // Adjust fields as necessary
        })
        .select('userId location address image lastActive isActive createdAt updatedAt'); // Include createdAt, updatedAt for date/time
  
      // Create a map of users with their salesmen
      const userMap = users.reduce((acc, user) => {
        acc[user._id.toString()] = {
          name: user.fullname,
          phone: user.phonenumber,
          isActive: user.isActive,
          salesmen: [] // Initialize empty array for salesmen
        };
        return acc;
      }, {});
  
      // Populate the salesmen data into the userMap
      salesmen.forEach(salesman => {
        const userId = salesman.userId._id.toString();
        if (userMap[userId]) {
          userMap[userId].salesmen.push({
            location: salesman.location,
            address: salesman.address,
            image: salesman.image,
          
            createdAt: salesman.createdAt,
            updatedAt: salesman.updatedAt
          });
        }
      });
  
      // Construct the response object
      const data = {
        users: Object.values(userMap) // Convert map to array
      };
  
      // Send response
      res.status(200).json(responseStructure.success(
        data,
        'Location data for users with their salesmen fetched successfully'
      ));
    } catch (error) {
      console.error('Error fetching location data:', error);
      res.status(500).json(responseStructure.error('Server error', 500));
    }
  };
  
  