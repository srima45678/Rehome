// orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Offer = require('../models/Offer');
const sendEmail = require('../utils/sendEmail');
const generateReceiptPDF = require('../utils/generateReceipt');

// ═══════════════════════════════════
// CREATE ORDER
// POST /api/orders
// ═══════════════════════════════════
const createOrder = async (req, res) => {
  try {
    const {
      productId,
      deliveryAddress,
      deliveryCity,
      contactPhone,
      paymentMethod,
      offerPrice
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Determine the real price to charge.
    // Default: normal listing price.
    let finalPrice = product.price;

    // If the frontend claims there's an accepted offer, verify it against the database.
    if (offerPrice) {
      const acceptedOffer = await Offer.findOne({
        product: productId,
        buyer: req.user.id,
        status: 'accepted',
        offerPrice: Number(offerPrice) // must match exactly
      });

      if (!acceptedOffer) {
        return res.status(400).json({
          success: false,
          message: 'No matching accepted offer found for this price'
        });
      }

      finalPrice = acceptedOffer.offerPrice;
    }

    if (product.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'This product is no longer available'
      });
    }

    if (product.seller.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot buy your own product'
      });
    }

    // Create order
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

    // Mark product as reserved
    product.status = 'reserved';
    await product.save();

    // ── Send email to SELLER ──
    try {
      const seller = await User.findById(product.seller);
      const buyer = await User.findById(req.user.id);

      if (seller?.email) {
        await sendEmail({
          to: seller.email,
          subject: `🛋️ New Order for "${product.title}" — ReHome`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
              <div style="background:#8B4513;padding:20px;text-align:center;border-radius:10px 10px 0 0;">
                <h1 style="color:white;margin:0;">🛋️ ReHome</h1>
                <p style="color:#F5DEB3;margin:5px 0;">New Order Received!</p>
              </div>
              <div style="background:#FFF8F0;padding:30px;border-radius:0 0 10px 10px;border:1px solid #E8D5C4;">
                <h2 style="color:#333;margin-top:0;">🎉 You have a new order!</h2>
                <p style="color:#555;">Hello <strong>${seller.fullName}</strong>,</p>
                <p style="color:#555;"><strong>${buyer.fullName}</strong> wants to buy your product!</p>

                <div style="background:white;border:1px solid #E8D5C4;border-radius:10px;padding:15px;margin:20px 0;">
                  <h3 style="color:#8B4513;margin-top:0;">📦 Order Details</h3>
                  <p style="margin:5px 0;color:#555;"><strong>Product:</strong> ${product.title}</p>
                  <p style="margin:5px 0;color:#555;"><strong>Price:</strong> Rs. ${finalPrice.toLocaleString()}</p>
                  <p style="margin:5px 0;color:#555;"><strong>Buyer:</strong> ${buyer.fullName}</p>
                  <p style="margin:5px 0;color:#555;"><strong>Buyer Phone:</strong> ${contactPhone}</p>
                  <p style="margin:5px 0;color:#555;"><strong>Delivery City:</strong> ${deliveryCity}</p>
                  <p style="margin:5px 0;color:#555;"><strong>Delivery Address:</strong> ${deliveryAddress}</p>
                  <p style="margin:5px 0;color:#555;"><strong>Payment:</strong> ${paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online'}</p>
                </div>

                <div style="background:#FFF3CD;border:1px solid #FFD700;border-radius:8px;padding:12px;margin:15px 0;">
                  <p style="color:#856404;margin:0;font-size:14px;">
                    ⚡ Action Required: Please confirm this order from your seller dashboard!
                  </p>
                </div>

                <p style="color:#888;font-size:13px;">
                  Login to your ReHome seller dashboard to confirm or manage this order.
                </p>
                <hr style="border:none;border-top:1px solid #E8D5C4;margin:20px 0;">
                <p style="color:#AAA;font-size:12px;text-align:center;">
                  ReHome Nepal — Give Furniture a Second Life 🏡
                </p>
              </div>
            </div>
          `
        });
      }

      // ── Send confirmation email to BUYER ──
      if (buyer?.email) {
        await sendEmail({
          to: buyer.email,
          subject: `✅ Order Placed — "${product.title}" — ReHome`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
              <div style="background:#8B4513;padding:20px;text-align:center;border-radius:10px 10px 0 0;">
                <h1 style="color:white;margin:0;">🛋️ ReHome</h1>
                <p style="color:#F5DEB3;margin:5px 0;">Order Confirmed!</p>
              </div>
              <div style="background:#FFF8F0;padding:30px;border-radius:0 0 10px 10px;border:1px solid #E8D5C4;">
                <h2 style="color:#333;margin-top:0;">✅ Your order has been placed!</h2>
                <p style="color:#555;">Hello <strong>${buyer.fullName}</strong>,</p>
                <p style="color:#555;">Your order has been successfully placed. The seller will confirm it soon!</p>

                <div style="background:white;border:1px solid #E8D5C4;border-radius:10px;padding:15px;margin:20px 0;">
                  <h3 style="color:#8B4513;margin-top:0;">📦 Order Summary</h3>
                  <p style="margin:5px 0;color:#555;"><strong>Product:</strong> ${product.title}</p>
                  <p style="margin:5px 0;color:#555;"><strong>Price:</strong> Rs. ${finalPrice.toLocaleString()}</p>
                  <p style="margin:5px 0;color:#555;"><strong>Seller:</strong> ${seller.fullName}</p>
                  <p style="margin:5px 0;color:#555;"><strong>Deliver to:</strong> ${deliveryAddress}, ${deliveryCity}</p>
                  <p style="margin:5px 0;color:#555;"><strong>Payment:</strong> ${paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online'}</p>
                </div>

                <div style="background:#D4EDDA;border:1px solid #C3E6CB;border-radius:8px;padding:12px;margin:15px 0;">
                  <p style="color:#155724;margin:0;font-size:14px;">
                    📱 Track your order status anytime from your ReHome dashboard!
                  </p>
                </div>

                <hr style="border:none;border-top:1px solid #E8D5C4;margin:20px 0;">
                <p style="color:#AAA;font-size:12px;text-align:center;">
                  ReHome Nepal — Give Furniture a Second Life 🏡
                </p>
              </div>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error('Email error (non-critical):', emailError);
    }

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
// GET MY ORDERS — Buyer
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
// GET SELLER ORDERS
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
// UPDATE ORDER STATUS — Seller
// PUT /api/orders/:id/status
// ═══════════════════════════════════
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('product', 'title')
      .populate('buyer', 'fullName email')
      .populate('seller', 'fullName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.seller._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    order.status = status;

    if (status === 'delivered') {
      order.paymentStatus = 'paid';
      const product = await Product.findById(order.product._id);
      if (product) {
        product.status = 'sold';
        await product.save();
      }
    }

    if (status === 'cancelled') {
      const product = await Product.findById(order.product._id);
      if (product) {
        product.status = 'available';
        await product.save();
      }
    }

    await order.save();

    // ── Notify buyer of status update ──
    try {
      const statusMessages = {
        confirmed: { emoji: '✅', msg: 'Your order has been confirmed by the seller!' },
        shipped: { emoji: '🚚', msg: 'Your order is on the way!' },
        delivered: { emoji: '📦', msg: 'Your order has been delivered! Enjoy your furniture.' },
        cancelled: { emoji: '❌', msg: 'Your order has been cancelled.' }
      };

      const statusInfo = statusMessages[status];

      // Generate a PDF receipt only when the order is delivered
      let emailAttachments = [];
      if (status === 'delivered') {
        const pdfBuffer = await generateReceiptPDF(order);
        emailAttachments = [{
          filename: `ReHome-Receipt-${order._id}.pdf`,
          content: pdfBuffer
        }];
      }

      if (statusInfo && order.buyer?.email) {
        await sendEmail({
          to: order.buyer.email,
          subject: `${statusInfo.emoji} Order ${status} — "${order.product.title}" — ReHome`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
              <div style="background:#8B4513;padding:20px;text-align:center;border-radius:10px 10px 0 0;">
                <h1 style="color:white;margin:0;">🛋️ ReHome</h1>
                <p style="color:#F5DEB3;margin:5px 0;">Order Update</p>
              </div>
              <div style="background:#FFF8F0;padding:30px;border-radius:0 0 10px 10px;border:1px solid #E8D5C4;">
                <h2 style="color:#333;margin-top:0;">${statusInfo.emoji} Order ${status.charAt(0).toUpperCase() + status.slice(1)}!</h2>
                <p style="color:#555;">Hello <strong>${order.buyer.fullName}</strong>,</p>
                <p style="color:#555;">${statusInfo.msg}</p>
                <div style="background:white;border:1px solid #E8D5C4;border-radius:10px;padding:15px;margin:20px 0;">
                  <p style="margin:5px 0;color:#555;"><strong>Product:</strong> ${order.product.title}</p>
                  <p style="margin:5px 0;color:#555;"><strong>Status:</strong> ${status.toUpperCase()}</p>
                  <p style="margin:5px 0;color:#555;"><strong>Seller:</strong> ${order.seller.fullName}</p>
                </div>
                ${status === 'delivered' ? `
                <div style="background:#D4EDDA;border:1px solid #C3E6CB;border-radius:8px;padding:12px;margin:15px 0;">
                  <p style="color:#155724;margin:0;font-size:14px;">
                    🧾 Your receipt is attached to this email as a PDF.
                  </p>
                </div>` : ''}
                <p style="color:#888;font-size:13px;">
                  Track your order anytime from your ReHome dashboard.
                </p>
                <hr style="border:none;border-top:1px solid #E8D5C4;margin:20px 0;">
                <p style="color:#AAA;font-size:12px;text-align:center;">
                  ReHome Nepal — Give Furniture a Second Life 🏡
                </p>
              </div>
            </div>
          `,
          attachments: emailAttachments
        });
      }
    } catch (emailError) {
      console.error('Status email error:', emailError);
    }

    res.json({ success: true, message: 'Order status updated', order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// CANCEL ORDER — Buyer
// PUT /api/orders/:id/cancel
// ═══════════════════════════════════
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('product', 'title')
      .populate('seller', 'fullName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a delivered order'
      });
    }

    order.status = 'cancelled';
    await order.save();

    // Make product available again
    const product = await Product.findById(order.product._id);
    if (product) {
      product.status = 'available';
      await product.save();
    }

    // ── Notify seller of cancellation ──
    try {
      const buyer = await User.findById(req.user.id);
      if (order.seller?.email) {
        await sendEmail({
          to: order.seller.email,
          subject: `❌ Order Cancelled — "${order.product.title}" — ReHome`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
              <div style="background:#8B4513;padding:20px;text-align:center;border-radius:10px 10px 0 0;">
                <h1 style="color:white;margin:0;">🛋️ ReHome</h1>
              </div>
              <div style="background:#FFF8F0;padding:30px;border-radius:0 0 10px 10px;border:1px solid #E8D5C4;">
                <h2 style="color:#333;margin-top:0;">❌ Order Cancelled</h2>
                <p style="color:#555;">Hello <strong>${order.seller.fullName}</strong>,</p>
                <p style="color:#555;"><strong>${buyer?.fullName}</strong> has cancelled their order for <strong>"${order.product.title}"</strong>.</p>
                <p style="color:#555;">Your product is now available for other buyers.</p>
                <hr style="border:none;border-top:1px solid #E8D5C4;margin:20px 0;">
                <p style="color:#AAA;font-size:12px;text-align:center;">
                  ReHome Nepal — Give Furniture a Second Life 🏡
                </p>
              </div>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error('Cancel email error:', emailError);
    }

    res.json({ success: true, message: 'Order cancelled', order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// DOWNLOAD RECEIPT (buyer or seller)
// GET /api/orders/:id/receipt
// ═══════════════════════════════════
const downloadReceipt = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('product', 'title price')
      .populate('buyer', 'fullName email')
      .populate('seller', 'fullName email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only the buyer or seller of THIS order can download it
    if (
      order.buyer._id.toString() !== req.user.id &&
      order.seller._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const pdfBuffer = await generateReceiptPDF(order);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ReHome-Receipt-${order._id}.pdf`,
      'Content-Length': pdfBuffer.length
    });
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Download receipt error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
  cancelOrder,
  downloadReceipt
};