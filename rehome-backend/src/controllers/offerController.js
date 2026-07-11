// offerController.js
// Handles all offer logic between buyers and sellers

const Offer = require('../models/Offer');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');

// ═══════════════════════════════════
// MAKE AN OFFER
// POST /api/offers
// ═══════════════════════════════════
const makeOffer = async (req, res) => {
  try {
    const { productId, offerPrice, message } = req.body;

    const product = await Product.findById(productId).populate('seller', 'fullName email');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Add this check
    if(!product.seller) {
        return res.status(400).json({ success: false, message: 'This listing has no active seller.'});
    }

    if (product.allowOffers === false) {
      return res.status(400).json({ success: false, message: 'This seller is not accepting offers on this listing'})
    }

    // Can't offer on own product
    if (product.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't make an offer on your own listing" });
    }

    // Can't offer more than asking price
    if (offerPrice >= product.price) {
      return res.status(400).json({ success: false, message: 'Offer must be less than the asking price' });
    }

    // Check if buyer already has a pending/countered offer on this product
    const existingOffer = await Offer.findOne({
      product: productId,
      buyer: req.user._id,
      status: { $in: ['pending', 'countered'] }
    });
    if (existingOffer) {
      return res.status(400).json({ success: false, message: 'You already have an active offer on this listing' });
    }

    const offer = await Offer.create({
      product: productId,
      buyer: req.user._id,
      seller: product.seller._id,
      offerPrice,
      message
    });

    await offer.populate(['product', 'buyer', 'seller']);

    // ── Notify seller of new offer ──
    try {
      if (offer.seller?.email) {
        await sendEmail({
          to: offer.seller.email,
          subject: `💰 New Offer on "${offer.product.title}" — ReHome`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
              <div style="background:#8B4513;padding:20px;text-align:center;border-radius:10px 10px 0 0;">
                <h1 style="color:white;margin:0;">🛋️ ReHome</h1>
                <p style="color:#F5DEB3;margin:5px 0;">New Offer Received</p>
              </div>
              <div style="background:#FFF8F0;padding:30px;border-radius:0 0 10px 10px;border:1px solid #E8D5C4;">
                <h2 style="color:#333;margin-top:0;">💰 You've received a new offer!</h2>
                <p style="color:#555;">Hello <strong>${offer.seller.fullName}</strong>,</p>
                <p style="color:#555;"><strong>${offer.buyer.fullName}</strong> made an offer on your listing.</p>
                <div style="background:white;border:1px solid #E8D5C4;border-radius:10px;padding:15px;margin:20px 0;">
                  <p style="margin:5px 0;color:#555;"><strong>Product:</strong> ${offer.product.title}</p>
                  <p style="margin:5px 0;color:#555;"><strong>Asking Price:</strong> Rs. ${offer.product.price.toLocaleString()}</p>
                  <p style="margin:5px 0;color:#555;"><strong>Offer:</strong> Rs. ${offer.offerPrice.toLocaleString()}</p>
                  ${offer.message ? `<p style="margin:5px 0;color:#555;"><strong>Message:</strong> "${offer.message}"</p>` : ''}
                </div>
                <p style="color:#888;font-size:13px;">Login to your seller dashboard to accept, reject, or counter this offer.</p>
                <hr style="border:none;border-top:1px solid #E8D5C4;margin:20px 0;">
                <p style="color:#AAA;font-size:12px;text-align:center;">ReHome Nepal — Give Furniture a Second Life 🏡</p>
              </div>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error('Offer email error:', emailError);
    }

    res.status(201).json({ success: true, message: 'Offer sent!', offer });;
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// GET OFFERS FOR A PRODUCT (seller view)
// GET /api/offers/product/:productId
// ═══════════════════════════════════
const getProductOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ product: req.params.productId })
      .populate('buyer', 'fullName city')
      .populate('product', 'title price images')
      .sort({ createdAt: -1 });

    res.json({ success: true, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// GET MY OFFERS (buyer view)
// GET /api/offers/my-offers
// ═══════════════════════════════════
const getMyOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ buyer: req.user._id })
      .populate('product', 'title price images category city')
      .populate('seller', 'fullName')
      .sort({ createdAt: -1 });

    res.json({ success: true, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// GET INCOMING OFFERS (seller view)
// GET /api/offers/incoming
// ═══════════════════════════════════
const getIncomingOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ seller: req.user._id })
      .populate('product', 'title price images category')
      .populate('buyer', 'fullName city')
      .sort({ createdAt: -1 });

    res.json({ success: true, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// RESPOND TO OFFER (seller)
// PUT /api/offers/:id/respond
// action: 'accept' | 'reject' | 'counter'
// ═══════════════════════════════════
const respondToOffer = async (req, res) => {
  try {
    const { action, counterPrice, sellerMessage } = req.body;
    const offer = await Offer.findById(req.params.id)
      .populate('product', 'title price')
      .populate('buyer', 'fullName email')
      .populate('seller', 'fullName');

    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

    // Only seller can respond
    if (offer.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (action === 'accept') {
      offer.status = 'accepted';
    } else if (action === 'reject') {
      offer.status = 'rejected';
      offer.sellerMessage = sellerMessage || '';
    } else if (action === 'counter') {
      if (!counterPrice || counterPrice <= 0) {
        return res.status(400).json({ success: false, message: 'Counter price is required' });
      }
      if (counterPrice >= offer.product.price) {
        return res.status(400).json({ success: false, message: 'Counter must be less than asking price' });
      }
      offer.status = 'countered';
      offer.counterPrice = counterPrice;
      offer.sellerMessage = sellerMessage || '';
    }

    await offer.save();

    // ── Notify buyer of seller's response ──
    try {
      if (offer.buyer?.email) {
        const actionMessages = {
          accept: { emoji: '✅', title: 'Your offer was accepted!', body: `Great news — <strong>${offer.seller.fullName}</strong> accepted your offer of Rs. ${offer.offerPrice.toLocaleString()}. You can now proceed to checkout.` },
          reject: { emoji: '❌', title: 'Your offer was declined', body: `<strong>${offer.seller.fullName}</strong> declined your offer of Rs. ${offer.offerPrice.toLocaleString()}.${sellerMessage ? ` They said: "${sellerMessage}"` : ''}` },
          counter: { emoji: '🔄', title: 'Seller sent a counter offer', body: `<strong>${offer.seller.fullName}</strong> countered your offer with a new price: Rs. ${Number(counterPrice).toLocaleString()}.${sellerMessage ? ` They said: "${sellerMessage}"` : ''}` }
        };
        const info = actionMessages[action];

        await sendEmail({
          to: offer.buyer.email,
          subject: `${info.emoji} ${info.title} — "${offer.product.title}" — ReHome`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
              <div style="background:#8B4513;padding:20px;text-align:center;border-radius:10px 10px 0 0;">
                <h1 style="color:white;margin:0;">🛋️ ReHome</h1>
                <p style="color:#F5DEB3;margin:5px 0;">Offer Update</p>
              </div>
              <div style="background:#FFF8F0;padding:30px;border-radius:0 0 10px 10px;border:1px solid #E8D5C4;">
                <h2 style="color:#333;margin-top:0;">${info.emoji} ${info.title}</h2>
                <p style="color:#555;">Hello <strong>${offer.buyer.fullName}</strong>,</p>
                <p style="color:#555;">${info.body}</p>
                <div style="background:white;border:1px solid #E8D5C4;border-radius:10px;padding:15px;margin:20px 0;">
                  <p style="margin:5px 0;color:#555;"><strong>Product:</strong> ${offer.product.title}</p>
                </div>
                <p style="color:#888;font-size:13px;">Login to your dashboard to view or respond.</p>
                <hr style="border:none;border-top:1px solid #E8D5C4;margin:20px 0;">
                <p style="color:#AAA;font-size:12px;text-align:center;">ReHome Nepal — Give Furniture a Second Life 🏡</p>
              </div>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error('Offer response email error:', emailError);
    }

    res.json({ success: true, message: `Offer ${action}ed`, offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════
// ACCEPT COUNTER OFFER (buyer)
// PUT /api/offers/:id/accept-counter
// ═══════════════════════════════════
const acceptCounter = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('product', 'title price')
      .populate('buyer', 'fullName')
      .populate('seller', 'fullName email');
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

    if (offer.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (offer.status !== 'countered') {
      return res.status(400).json({ success: false, message: 'No counter offer to accept' });
    }

    offer.status = 'accepted';
    offer.offerPrice = offer.counterPrice;
    await offer.save();

    // ── Notify seller their counter was accepted ──
    try {
      if (offer.seller?.email) {
        await sendEmail({
          to: offer.seller.email,
          subject: `✅ Counter offer accepted — "${offer.product.title}" — ReHome`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
              <div style="background:#8B4513;padding:20px;text-align:center;border-radius:10px 10px 0 0;">
                <h1 style="color:white;margin:0;">🛋️ ReHome</h1>
                <p style="color:#F5DEB3;margin:5px 0;">Offer Update</p>
              </div>
              <div style="background:#FFF8F0;padding:30px;border-radius:0 0 10px 10px;border:1px solid #E8D5C4;">
                <h2 style="color:#333;margin-top:0;">✅ Your counter offer was accepted!</h2>
                <p style="color:#555;">Hello <strong>${offer.seller.fullName}</strong>,</p>
                <p style="color:#555;"><strong>${offer.buyer.fullName}</strong> accepted your counter price of Rs. ${offer.offerPrice.toLocaleString()} for "${offer.product.title}".</p>
                <p style="color:#888;font-size:13px;">They'll proceed to checkout soon — watch your dashboard for the new order.</p>
                <hr style="border:none;border-top:1px solid #E8D5C4;margin:20px 0;">
                <p style="color:#AAA;font-size:12px;text-align:center;">ReHome Nepal — Give Furniture a Second Life 🏡</p>
              </div>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error('Accept counter email error:', emailError);
    }

    res.json({ success: true, message: 'Counter offer accepted!', offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  makeOffer,
  getProductOffers,
  getMyOffers,
  getIncomingOffers,
  respondToOffer,
  acceptCounter
};