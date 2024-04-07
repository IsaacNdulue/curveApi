const studentModel = require('../model/model');
const cloudinary = require('../utility/cloudinary')
const axios = require('axios'); // For making HTTP requests


exports.studentPro = async (req, res) => {
    try {
        const { fullName, stack } = req.body;
        const file = req.file.path;

        // Get user's IP address from the request
        const ipAddress = req.ip; // Assuming this gives the IP address
        console.log(ipAddress)
        // Use a service to get location based on IP address
        const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);
        const locationData = response.data;
        // https://freegeoip.app/json/{ip-address}
        // https://ipinfo.io/${ipAddress}/json
        // Extract user's exact location
        const userLocation = `${locationData.city}, ${locationData.country}`; 
     
        
        // Generate the watermark text with the current time and user's location
        const options = { timeZone: 'Africa/Lagos', hour: 'numeric', minute: 'numeric' };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const formattedTime = formatter.format(new Date());
        const watermarkText = `${formattedTime}\nLocation: ${userLocation}`;

        // Adjust mark based on current time 
        let mark = 0;
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        if (currentHour < 9 || (currentHour === 9 && currentMinute < 45)) {
            mark = 20;
        } else if (currentHour === 9 && currentMinute >= 45 && currentMinute < 60) {
            mark = 10;
        } else if (currentHour > 10 || (currentHour === 10 && currentMinute >= 0)) {
            mark = 0;
        }
        const id = req.params.id

        const student = await studentModel.findById(id);
            //This suggested score is the suggested weekly score
        let suggestedScore = 0;
        
        if (student) {
            const totalMarks = student.mark.reduce((sum, mark) => sum + mark, 0);
        
            if (totalMarks >= 60) {
                suggestedScore = 20;
            } else if (totalMarks >= 55) {
                suggestedScore = 18; 
            } else if (totalMarks >= 50) {
                suggestedScore = 15;
            } else if (totalMarks >= 40) {
                suggestedScore = 10;
            } else {
                suggestedScore = 5;
            }
        }
        
        console.log(suggestedScore); 
        // i used Transformation for the watermarking 
        const result = await cloudinary.uploader.upload(file, {
            transformation: [
                { width: 400, height: 400, gravity: "face", crop: "crop" }, // Adjust size and cropping 
                { 
                    overlay: { 
                        font_family: "Arial", 
                        font_size: 40, 
                        text: watermarkText 
                    }, 
                    gravity: "north_east", 
                    y: 10, 
                    x: 10 
                } // Watermark with current time and location
            ],
            folder: "curveApi", 
            resource_type: 'auto'
        });
            //creating the profile
        const profile = await studentModel.create({
            fullName,
            stack,
            mark,
            suggestedScore,
            profileImage: result.secure_url  
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



exports.deleteImage = async (req, res) => {
    try {
        const { imageUrl } = req.body; // Extract imageUrl from request body

        // Extract public ID from the image URL
        const publicId = imageUrl.split('/').pop().split('.')[0];

        // Delete the image from Cloudinary
        await cloudinary.uploader.destroy(publicId);

        return res.status(200).json({ message: 'Image deleted successfully from Cloudinary.' });
    } catch (error) {
        // Handle errors
        console.error('Error deleting image from Cloudinary:', error.message);
        return res.status(500).json({ message: 'Error deleting image from Cloudinary.' });
    }
};

// exports.studentPro = async (req, res) => {
//     try {
//         const { fullName, stack } = req.body;
//         const file = req.file.path;

//         // Get user's IP address from the request
//         const ipAddress = req.ip; // Assuming this gives the IP address

// // Use a service to get location based on IP address
// const locationData = await axios.get(`http://ip-api.com/json/${ipAddress}`); 
// console.log(locationData.data);
// const userLocation = `${locationData.data.city}`;

// // Generate the watermark text with the current time and user's location
// //http://ip-api.com/json/

// // Extract only the time from currentTime
// const options = { timeZone: 'Africa/Lagos', hour: 'numeric', minute: 'numeric' };
// const formatter = new Intl.DateTimeFormat('en-US', options);
// const formattedTime = formatter.format(new Date());
// const watermarkText = `${formattedTime}\nLocation: ${userLocation}`;

//    // Adjust mark based on current time
//    let mark = 0;
//    const currentHour = new Date().getHours();
//    const currentMinute = new Date().getMinutes();
//    if (currentHour < 9 || (currentHour === 9 && currentMinute < 45)) {
//        mark = 20;
//    } else if (currentHour === 9 && currentMinute >= 45 && currentMinute < 60) {
//        mark = 10;
//    } else if (currentHour > 10 || (currentHour === 10 && currentMinute >= 0)) {
//        mark = 0;
//    }

// // Upload the image to Cloudinary with watermark transformation
// const result = await cloudinary.uploader.upload(file, {
//     transformation: [
//         { width: 400, height: 400, gravity: "face", crop: "crop" }, // Adjust size and cropping as needed
//         { 
//             overlay: { 
//                 font_family: "Arial", 
//                 font_size: 40, 
//                 text: watermarkText 
//             }, 
//             gravity: "north_east", 
//             y: 10, 
//             x: 10 
//         } // Watermark with current time and location
//     ],
//     folder: "curveApi", 
//     resource_type: 'auto'
// });

     

//         // Create a student record in the database with the uploaded image URL
//         const profile = await student.create({
//             fullName,
//             stack,
//             mark,
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
