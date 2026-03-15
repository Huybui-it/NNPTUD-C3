const express = require('express');
const router = express.Router();
const User = require('../schemas/users');

// [C] Create user
router.post('/', async (req, res) => {
    try {
        // Kiểm tra xem username hoặc email đã tồn tại chưa
        const existingUser = await User.findOne({ 
            $or: [{ username: req.body.username }, { email: req.body.email }] 
        });
        
        if (existingUser) {
            if (existingUser.isDeleted) {
                // Nếu đã xoá mềm -> Khôi phục lại, cập nhật thông tin mới
                existingUser.isDeleted = false;
                existingUser.password = req.body.password || existingUser.password;
                existingUser.fullName = req.body.fullName || existingUser.fullName;
                existingUser.role = req.body.role || existingUser.role;
                const restoredUser = await existingUser.save();
                return res.status(200).json(restoredUser);
            } else {
                return res.status(400).json("Username or Email already exists");
            }
        }

        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) { res.status(500).json(err); }
});

// [R] Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({ isDeleted: false }).populate("role");
        res.status(200).json(users);
    } catch (err) { res.status(500).json(err); }
});

// [R] Get user by id
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, isDeleted: false }).populate("role");
        if (!user) return res.status(404).json("User not found");
        res.status(200).json(user);
    } catch (err) { res.status(500).json(err); }
});

// [U] Update user
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (err) { res.status(500).json(err); }
});

// [D] Soft delete user by id
router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.status(200).json("User has been soft-deleted");
    } catch (err) { res.status(500).json(err); }
});

// Yêu cầu 2: Hàm POST /enable
router.post('/enable', async (req, res) => {
    try {
        const { email, username } = req.body;
        const user = await User.findOneAndUpdate(
            { email, username, isDeleted: false },
            { $set: { status: true } },
            { new: true }
        ).populate("role");
        
        if (!user) return res.status(404).json("User not found or credentials incorrect");
        res.status(200).json(user);
    } catch (err) { res.status(500).json(err); }
});

// Yêu cầu 3: Hàm POST /disable
router.post('/disable', async (req, res) => {
    try {
        const { email, username } = req.body;
        const user = await User.findOneAndUpdate(
            { email, username, isDeleted: false },
            { $set: { status: false } },
            { new: true }
        ).populate("role");
        
        if (!user) return res.status(404).json("User not found or credentials incorrect");
        res.status(200).json(user);
    } catch (err) { res.status(500).json(err); }
});

module.exports = router;
