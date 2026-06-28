// orderController.js
// Handles order placement and tracking

const Order = require('../models/Order');
const Product = require('../models/Product');

// ═══════════════════════════════════
// CREATE ORDER (Buy Now)
// POST /api/orders
// ═══════════════════════════════════
const createOrder = async (req, res) => {
  try {
    const { productId, deliveryAddress, deliveryCity, contactPhone, paymentMethod } = req.body;

    // Find the product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.status !== 'available') {
      return res.status(400).json({ success: false, message: 'This product is no longer available' });
    }

    // Prevent buying your own product
    if (product.seller.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot buy your own product' });
    }

    // Create the order
    const order = await Order.create({
      product: productId,
      buyer: req.user.id,
      seller: product.seller,
      price: product.price,
      deliveryAddress,
      deliveryCity,
      contactPhone,
      paymentMethod: paymentMethod || 'cash_on_delivery'
    });

    // Mark product as reserved (not sold yet — seller must confirm)
    product.status = 'reserved';
    await product.save();

    res.status(201).json({
      success: true,
      message: '🎉 Order placed successfully!',
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// GET MY ORDERS (as buyer)
// GET /api/orders/my-orders
// ═══════════════════════════════════
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('product', 'title images price category')
      .populate('seller', 'fullName phone city')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// GET ORDERS FOR MY PRODUCTS (as seller)
// GET /api/orders/seller-orders
// ═══════════════════════════════════
const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.id })
      .populate('product', 'title images price category')
      .populate('buyer', 'fullName phone city')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// UPDATE ORDER STATUS (seller updates)
// PUT /api/orders/:id/status
// ═══════════════════════════════════
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only the seller of this order can update status
    if (order.seller.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    order.status = status;

    // If delivered, mark product as sold and payment as paid (if COD)
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
      const product = await Product.findById(order.product);
      if (product) {
        product.status = 'sold';
        await product.save();
      }
    }

    // If cancelled, make product available again
    if (status === 'cancelled') {
      const product = await Product.findById(order.product);
      if (product) {
        product.status = 'available';
        await product.save();
      }
    }

    await order.save();

    res.json({ success: true, message: 'Order status updated', order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// CANCEL ORDER (buyer cancels)
// PUT /api/orders/:id/cancel
// ═══════════════════════════════════
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only the buyer who placed it can cancel
    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });
    }

    order.status = 'cancelled';
    await order.save();

    // Make product available again
    const product = await Product.findById(order.product);
    if (product) {
      product.status = 'available';
      await product.save();
    }

    res.json({ success: true, message: 'Order cancelled', order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
  cancelOrder
};