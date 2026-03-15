var express = require('express');
var router = express.Router();
const User = require('../schemas/users');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Function chung đổi trạng thái User
const changeUserStatus = async (req, res, targetStatus) => {
    try {
        const { email, username } = req.body;
        
        const user = await User.findOne({ email: email, username: username, isDeleted: false });
        
        if (!user) {
            return res.status(404).json("Incorrect email or username.");
        }

        user.status = targetStatus;
        await user.save();
        
        res.status(200).json(`User status changed to ${targetStatus}`);
    } catch (err) {
        res.status(500).json(err);
    }
}

// Yêu cầu 2: enable
router.post('/enable', async (req, res) => {
    await changeUserStatus(req, res, true);
});

// Yêu cầu 3: disable
router.post('/disable', async (req, res) => {
    await changeUserStatus(req, res, false);
});

module.exports = router;
