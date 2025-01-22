const User = require('../database/models/user');
const argon2 = require('argon2');
const slugify = require('slugify');

module.exports.userProfile = async (req, res, next) => {
    try {
        // const token = req.header('Authorization').replace('Bearer ', '');
        // const decoded = jwt.verify(token, process.env.secret); // Replace 'your-secret-key' with your actual secret key
        const userId = req.userId;
        const user = await User.findById(userId).populate('posts');

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User record not found."
            });
        } else {
            return res.status(200).json({
                status: true,
                user: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    id: user._id,
                    _id: user._id,
                    apartment: user.apartment,
                    city: user.city,
                    country: user.country,
                    zip: user.zip,
                    street: user.street,
                    posts: user.posts
                }
            });
        }
    } catch (err) {
        return res.status(401).json({
            status: false,
            message: "Unauthorized. Please provide a valid token."
        });
    }
}

exports.getUsers = async (req,res)=>{
    const users = await User.find().sort({date:-1}).select('-passwordHash');
    if(!users) return res.status(404).json('No Users found');
    res.status(200).json(users);
}

// module.exports.userProfile = async (req, res, next) => {
//     try {
//         // Get the JWT token from the request headers, assuming it's in the 'Authorization' header
//         const token = req.header('Authorization').replace('Bearer ', '');
  
//         // Verify and decode the token
//         const decoded = jwt.verify(token, process.env.secret); // Replace 'your-secret-key' with your actual secret key
  
//         // The 'decoded' object should now contain the user's ID
//         const userId = decoded.userId;
  
//         // Use the user ID to query the user's profile
//         const user = await User.findById(userId).populate('posts');
  
//         if (!user) {
//             return res.status(404).json({
//                 status: false,
//                 message: "User record not found."
//             });
//         } else {
//             return res.status(200).json({
//                 status: true,
//                 user: _.pick(user, ["name", "email", "phone", "id", "apartment", "city","country","zip","street", "posts"])
//             });
//         }
//     } catch (err) {
//         // Handle errors here, such as invalid tokens or token expiration
//         return res.status(401).json({
//             status: false,
//             message: "Unauthorized. Please provide a valid token."
//         });
//     }
//   };

// exports.login = async (req,res)=>{
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).send('User not found');

//     if (await argon2.verify(user.passwordHash, password)) {
//         const token = jwt.sign(
//             {
//                 id: user._id,
//                 _id: user._id,
//                 userId: user.id,
//                 isAdmin: user.isAdmin,
//                 isSupplier: user.isSupplier,
//                 isBuyer: user.isBuyer,
//             },
//             process.env.SECRET, // Replace with your secret key
//             { expiresIn: '321d' }
//         );

//         res.send({ user: user.email, token });
//     } else {
//         res.send('Password is wrong');
//     }
   
// }
// exports.signUp = async (req,res)=>{
//     const { name, email, password, phone, street, apartment, city, zip, country, isAdmin, isSupplier, isBuyer } = req.body;
     
//     const foundUser = await User.findOne({email})
//     if(foundUser){
//         res.send('user Exists')
//     }
//     const passwordHash = await argon2.hash(password);
//     const randomComponent = Date.now().toString(); // You can replace this with your own logic
//     const customIdentifer = `${slugify(name, { lower: true })}-${randomComponent}`;

//     let user = new User({
//         name,
//         email,
//         passwordHash,
//         phone,
//         street,
//         apartment,
//         city,
//         zip,
//         country,
//         isAdmin: isAdmin || false,
//         isSupplier: isSupplier || false,
//         isBuyer: isBuyer || false,
//         customIdentifier: customIdentifer,
//     });

//     try {
//         user = await user.save();
//         res.send(user);
//     } catch (error) {
//         res.send('The user cannot be created');
//     }

//     // user = await user.save();

//     if (!user) return res.send('The user cannot be created');

//     res.send(user);

// }
// exports.signUp = async (req, res) => {
//     const { name, email, password, phone, street, apartment, city, zip, country, isAdmin, isSupplier, isBuyer } = req.body;

//     try {
//         // Check if the user already exists
//         const foundUser = await User.findOne({ email });
//         if (foundUser) {
//             return res.status(400).send('User already exists');
//         }

//         // Hash the password
//         const passwordHash = await argon2.hash(password);
//         const randomComponent = Date.now().toString();
//         const customIdentifier = `${slugify(name, { lower: true })}-${randomComponent}`;

//         // Create a new user
//         const user = new User({
//             name,
//             email,
//             passwordHash,
//             phone,
//             street,
//             apartment,
//             city,
//             zip,
//             country,
//             isAdmin: isAdmin || false,
//             isSupplier: isSupplier || false,
//             isBuyer: isBuyer || false,
//             customIdentifer:customIdentifier,
//         });

//         // Save the user to the database
//         const savedUser = await user.save();

//         // Send the response
//         res.status(201).send(savedUser);

//     } catch (error) {
//         console.error('Error creating user:', error);
//         res.status(500).send('The user cannot be created');
//     }
// };

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase();
    console.log(normalizedEmail)
        const user = await User.findOne({ email: normalizedEmail });
        // Verify user exists and password matches
        if (!user || !(await argon2.verify(user.passwordHash, password))) {
            return res.status(400).send('Invalid email or password');
        }

        if (await argon2.verify(user.passwordHash, password)) {
            const token = jwt.sign(
                {
                    id: user._id,
                    _id: user._id,
                    userId: user.id,
                    isAdmin: user.isAdmin,
                    isSupplier: user.isSupplier,
                    isBuyer: user.isBuyer,
                },
                process.env.SECRET, // Replace with your secret key
                { expiresIn: '321d' }
            );

            res.send({ user: user.email, token });
        } else {
            res.status(400).send('Password is incorrect');
        }

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
};


exports.signUp = async (req, res) => {
    const { name, email, password, phone, street, apartment, city, zip, country, isAdmin, isSupplier, isBuyer } = req.body;

    try {
        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase();

        // Check if the user already exists
        const foundUser = await User.findOne({ email: normalizedEmail });
        if (foundUser) {
            return res.status(400).send('User already exists');
        }

        // Hash the password
        const passwordHash = await argon2.hash(password);
        const randomComponent = Date.now().toString();
        const customIdentifier = `${slugify(name, { lower: true })}-${randomComponent}`;

        // Create a new user
        const user = new User({
            name,
            email: normalizedEmail,
            passwordHash,
            phone,
            street,
            apartment,
            city,
            zip,
            country,
            isAdmin: isAdmin || false,
            isSupplier: isSupplier || false,
            isBuyer: isBuyer || true,
            customIdentifer: customIdentifier,
        });

        // Save the user to the database
        const savedUser = await user.save();

        // Send the response
        res.status(201).send(savedUser);

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('The user cannot be created');
    }
};

exports.updateUser = async (req, res) => {
    const { customIdentifer } = req.params;

    if (!customIdentifer) {
        return res.status(400).send('Custom Identifier is required');
    }

    try {
        // Check if password is being updated, and hash it if so
        if (req.body.password) {
            req.body.passwordHash = await argon2.hash(req.body.password);
            delete req.body.password; // Remove the plain text password from the body
        }

        // Find the user by customIdentifer and update their details
        const user = await User.findOneAndUpdate({ customIdentifer }, req.body, { new: true });

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.send(user);
    } catch (error) {
        res.send('Failed to update user details', error);
    }
};

// exports.updateUser = async (req, res) => {
//     const { userId } = req.body;
//     const { customIdentifer } = req.params;

//     if (!userId) {
//         return res.status(400).send('User ID is required');
//     }

//     try {
//         // Check if password is being updated, and hash it if so
//         if (req.body.password) {
//             req.body.passwordHash = await argon2.hash(req.body.password);
//             delete req.body.password; // Remove the plain text password from the body
//         }

//         // Find the user by ID and update their details
//         const user = await User.findByIdAndUpdate(userId, req.body, { new: true });

//         if (!user) {
//             return res.status(404).send('User not found');
//         }

//         res.send(user);
//     } catch (error) {
//         res.status(500).send('Failed to update user details');
//     }
// };

