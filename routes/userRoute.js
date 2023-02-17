const express = require('express');

const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, getUserDetail, updatePassword, updateUserProfile, getAllUsers, getSingleUser, updateUserRole, deleteUser } = require('../controllers/userController.js');
const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth.js');

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);
router.route('/logout').post(logoutUser);
router.route('/me').get(isAuthenticatedUser, getUserDetail);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/me/update').put(isAuthenticatedUser, updateUserProfile);
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);
router.route('/admin/user/:id').get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser).put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole).delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);
module.exports = router;