const express = require('express');
const router = express.Router();
const User = require('../database/models/user');
const userCntrl = require('../controllers/user');
const argon2 = require('argon2');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const role = require('../helper/roles')
router.get('/user', userCntrl.getUsers);
const FcmToken = require('../database/models/fcmToken'); // Import FcmToken model
const middleware = require('../helper/middleware');
const roleMiddleware = require('../helper/roles')
router.get('/users/all', middleware.verifyToken, roleMiddleware('isAdmin'), userCntrl.getUsers)
router.get('/admin/users-count', middleware.verifyToken, roleMiddleware('isAdmin'),  async (req, res) => {
    try {
      const totalUsersCount = await User.countDocuments();
      const buyersCount = await User.countDocuments({ isBuyer: true });
      const suppliersCount = await User.countDocuments({ isSupplier: true });
      const adminsCount = await User.countDocuments({ isAdmin: true });
  
      res.status(200).json({
        totalUsers: totalUsersCount,
        buyers: buyersCount,
        suppliers: suppliersCount,
        admins: adminsCount
      });
    } catch (error) {
      console.error('Error occurred:', error);
      res.status(500).send('Error occurred: ' + error.message);
    }
  });
router.get('/user/:customIdentifer', async (req, res) => {
    const { customIdentifer } = req.params;

    try {
        // Find the user by customIdentifer
        const user = await User.findOne({ customIdentifer }).select('-passwordHash');

        if (!user) {
            return res.status(404).json('No user found');
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/userProfile',middleware.verifyToken, userCntrl.userProfile);

// Protected route example for buyer
router.get('/buyer', middleware.verifyToken, roleMiddleware('isBuyer'), (req, res) => {
    res.send('Buyer content');
});

// Protected route example for supplier
router.get('/supplier', middleware.verifyToken, roleMiddleware('isSupplier'), (req, res) => {
    res.send('Supplier content');
});

// Protected route example for admin
router.get('/admin', middleware.verifyToken, roleMiddleware('isAdmin'), (req, res) => {
    res.send('Admin content');
});

router.put('/user/:id', async (req, res) => {
    const userExist = await User.findById(req.params.id);
    let newPassword
    if (req.body.password) {
       newPassword = bcrypt.hashSync(req.body.password, 10);
    }
    else {
        newPassword = userExist.passwordHash;
    }


    const user = await User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        passwordHash: newPassword,
        phone: req.body.phone,
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        isAdmin: req.body.isAdmin,
    },{new: true})

    user.save();
    res.send(user);
})

router.post('/user/signup', middleware.verifyToken, roleMiddleware('isAdmin'), userCntrl.signUp);

router.post('/secret/signup', userCntrl.signUp);




router.get('/user/get/count', async (req,res)=>{
    const userCount = await User.countDocuments();

    if(!userCount) return res.status(404).json('No users')

    res.send({
      userCount: userCount
    });
});


router.post('/users/login', async(req,res)=>{
    console.log('[USER.JS LOGIN] Attempting login...');
    console.log('[USER.JS LOGIN] Request Body:', req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('User not found');

    if (user && await argon2.verify(user.passwordHash, password)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin,
                isSupplier: user.isSupplier,
                isBuyer: user.isBuyer,
            },
            process.env.SECRET, 
            { expiresIn: '30d' }
        );

        res.send({ user: user.email, token, userId:user.id });
    } else {
        res.status(400).send('Password is wrong');
    }
})


router.put('/updateuser/:customIdentifer',middleware.verifyToken,roleMiddleware('isAdmin'),  userCntrl.updateUser);


router.delete('/user/:id', (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).json('invalid user')
      }
    User.findByIdAndRemove(req.params.id).then(user=>{
        if(user){
            return res.status(200).json({status:'success', message:'deleted user successfully'})
        }
        else{
            res.status(200).json({status:'failed', message:'User not found'});

        }
    }).catch(err=>{
        res.status(500).json({success:'failed', error:err});
      })

});


// Save FCM token endpoint
router.post('/users/save-fcm-token', middleware.verifyToken, async (req, res) => {
    try {
      const { userId, fcmToken } = req.body;
  
      // Validate input
      if (!userId || !fcmToken) {
        return res.status(400).json({ error: 'User ID and FCM token are required' });
      }
  
      // Find and update if token already exists for this user, otherwise create new
      const updatedFcmToken = await FcmToken.findOneAndUpdate(
        { userId: userId, fcmToken: fcmToken }, // Find by userId AND fcmToken to prevent duplicate entries for same user/device
        { $set: { userId: userId, fcmToken: fcmToken, deviceType: req.body.deviceType || 'android' } }, // Update with new data
        { upsert: true, new: true, setDefaultsOnInsert: true } // Create if not found, return new doc
      );
  
      console.log(`FCM token saved successfully for user ${userId}`);
  
      res.status(200).json({ message: 'FCM token saved successfully', fcmToken: updatedFcmToken });
    } catch (error) {
      console.error('Error saving FCM token:', error);
      res.status(500).json({ error: 'Failed to save FCM token' });
    }
  });
  
  
module.exports = router;