const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  deleteUser,
  getAllProducts,
  deleteProductAdmin,
  toggleUserStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes need login + admin role
// protect = must be logged in
// authorize('admin') = must have admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/products', getAllProducts);
router.delete('/products/:id', deleteProductAdmin);

module.exports = router;