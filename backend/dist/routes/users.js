"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const router = express_1.default.Router();
// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User_1.UserModel.getAll();
        res.json({
            success: true,
            data: users,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users',
        });
    }
});
// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.UserModel.findById(parseInt(id));
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user',
        });
    }
});
// Create new user
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, email, phone, password',
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'Passwords do not match',
            });
        }
        const user = await User_1.UserModel.create(name, email, phone, password);
        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        });
    }
    catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                error: 'Email already exists',
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to create user',
        });
    }
});
// Update user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const user = await User_1.UserModel.update(parseInt(id), updates);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update user',
        });
    }
});
// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const success = await User_1.UserModel.delete(parseInt(id));
        if (!success) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }
        res.json({
            success: true,
            message: 'User deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete user',
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map