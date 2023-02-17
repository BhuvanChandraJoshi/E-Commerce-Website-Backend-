const express = require('express');

const { newOrder, getSingleOrder, getUserOrders, getAllOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController.js');
const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth.js');

const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, authorizeRoles("admin"), getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, getUserOrders);
router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);
router.route("/admin/order/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatus).delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);


module.exports = router; 