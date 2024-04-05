const student = require('../model/model');
const cloudinary = require('../utility/cloudinary')
const axios = require('axios'); // For making HTTP requests

exports.studentPro = async (req, res) => {
    try {
        const { fullName, stack } = req.body;
        const file = req.file.path;

        // Get user's IP address from the request
        const ipAddress = req.ip; // Assuming this gives the IP address

        // Use a service to get location based on IP address
        const locationData = await axios.get(`http://ip-api.com/json/${ipAddress}`);
        console.log(locationData.data)
        const userLocation = `${locationData.data.city}, ${locationData.data.country}`;

        // Generate the watermark text with the current time and user's location
        const watermarkText = new Date().toLocaleString() + " - Location: " + userLocation;

        // Upload the image to Cloudinary with watermark transformation
        const result = await cloudinary.uploader.upload(file, {
            transformation: [
                { width: 400, height: 400, gravity: "face", crop: "crop" }, // Adjust size and cropping as needed
                { overlay: { font_family: "Arial", font_size: 40, text: watermarkText }, gravity: "north_east", y: 10, x: 10 } // Watermark with current time and location
            ],
            folder: "curveApi", 
            resource_type: 'auto'
        });

        // Create a student record in the database with the uploaded image URL
        const profile = await student.create({
            fullName,
            stack,
            profileImage: result.secure_url // Assuming 'profileImage' is the field in your student model for storing image URLs
        });

        // Send success response
        return res.status(201).json({
            message: 'Student profile created successfully',
            profile
        });
    } catch (error) {
        // Send error response if any error occurs
        return res.status(500).json({
            message: error.message
        });
    }
};



// exports.studentPro = async (req, res) => {
//     try {
//         const { fullName, stack } = req.body;
//         const file = req.file.path;
        
//         // Generate the watermark text with the current time
//         const watermarkText = new Date().toLocaleString();
        
//         // Upload the image to Cloudinary with watermark transformation
//         const result = await cloudinary.uploader.upload(file, {
//             transformation: [
//                 { width: 400, height: 400, gravity: "face", crop: "crop" }, // Adjust size and cropping as needed
//                 { overlay: { font_family: "Arial", font_size: 40, text: watermarkText }, gravity: "north_east", y: 10, x: 10 } // Watermark with current time
//             ],
//             folder: "curveApi", 
//             resource_type: 'auto'
//         });

//         // Create a student record in the database with the uploaded image URL
//         const profile = await student.create({
//             fullName,
//             stack,
//             profileImage: result.secure_url // Assuming 'profileImage' is the field in your student model for storing image URLs
//         });

//         // Send success response
//         return res.status(201).json({
//             message: 'Student profile created successfully',
//             profile
//         });
//     } catch (error) {
//         // Send error response if any error occurs
//         return res.status(500).json({
//             message: error.message
//         });
//     }
// };




// exports.studentPro = async (req, res) => {
//     try {
//         const { fullName, stack } = req.body;
//         const file = req.file.path
//         const result = await cloudinary.uploader.upload(file);
      
//         const profile = await student.create({
//             fullName,
//             stack,
//             profileImage: result.secure_url
//         });

//         // Send success response
//         return res.status(201).json({
//             message: 'Student profile created successfully',
//             profile
//         });
//     } catch (error) {
//         // Send error response if any error occurs
//         return res.status(500).json({
//             message: error.message
//         });
//     }
// };
