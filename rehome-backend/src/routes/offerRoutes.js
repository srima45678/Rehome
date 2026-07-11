const express = require('express');
const router = express.Router();
const {
  makeOffer,
  getProductOffers,
  getMyOffers,
  getIncomingOffers,
  respondToOffer,
  acceptCounter
} = require('../controllers/offerController');
const { protect } = require('../middleware/auth');

router.use(protect); // all offer routes need login

router.post('/', makeOffer);
router.get('/my-offers', getMyOffers);
router.get('/incoming', getIncomingOffers);
router.get('/product/:productId', getProductOffers);
router.put('/:id/respond', respondToOffer);
router.put('/:id/accept-counter', acceptCounter);

module.exports = router;