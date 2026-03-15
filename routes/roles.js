const express = require('express');
const router = express.Router();
const Role = require('../schemas/roles');
const User = require('../schemas/users');

// [C] Create role
router.post('/', async (req, res) => {
    try {
        // Kiểm tra xem role đã tồn tại chưa (kể cả xoá mềm)
        const existingRole = await Role.findOne({ name: req.body.name });
        if (existingRole) {
            if (existingRole.isDeleted) {
                // Nếu đã xoá mềm -> Khôi phục lại
                existingRole.isDeleted = false;
                existingRole.description = req.body.description || existingRole.description;
                const restoredRole = await existingRole.save();
                return res.status(200).json(restoredRole);
            } else {
                return res.status(400).json("Role name already exists");
            }
        }

        const newRole = new Role(req.body);
        const savedRole = await newRole.save();
        res.status(201).json(savedRole);
    } catch (err) { res.status(500).json(err); }
});

// [R] Get all roles
router.get('/', async (req, res) => {
    try {
        const roles = await Role.find({ isDeleted: false });
        res.status(200).json(roles);
    } catch (err) { res.status(500).json(err); }
});

// [R] Get role by id
router.get('/:id', async (req, res) => {
    try {
        const role = await Role.findOne({ _id: req.params.id, isDeleted: false });
        if (!role) return res.status(404).json("Role not found");
        res.status(200).json(role);
    } catch (err) { res.status(500).json(err); }
});

// [U] Update role
router.put('/:id', async (req, res) => {
    try {
        const updatedRole = await Role.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedRole);
    } catch (err) { res.status(500).json(err); }
});

// [D] Soft delete role by id
router.delete('/:id', async (req, res) => {
    try {
        await Role.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.status(200).json("Role has been soft-deleted");
    } catch (err) { res.status(500).json(err); }
});

// Yêu cầu 4: GET /roles/:id/users
router.get('/:id/users', async (req, res) => {
    try {
        const roleId = req.params.id;
        const users = await User.find({ role: roleId, isDeleted: false }).populate("role");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
