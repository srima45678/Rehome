// utils/generateReceipt.js
// Generates a PDF receipt for a completed order

const PDFDocument = require('pdfkit');

function generateReceiptPDF(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(22).fillColor('#8B4513').text('ReHome', { align: 'left' });
    doc.fontSize(10).fillColor('#888').text('Nepal — Give Furniture a Second Life');
    doc.moveDown(1.5);

    doc.fontSize(16).fillColor('#000').text('Order Receipt', { underline: true });
    doc.moveDown();

    doc.fontSize(10).fillColor('#333');
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`);
    doc.text(`Status: ${order.status.toUpperCase()}`);
    doc.moveDown();

    doc.fontSize(12).fillColor('#8B4513').text('Product');
    doc.fontSize(10).fillColor('#333');
    doc.text(`Item: ${order.product?.title || 'N/A'}`);
    doc.text(`Price Paid: Rs. ${Number(order.price).toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(12).fillColor('#8B4513').text('Buyer');
    doc.fontSize(10).fillColor('#333');
    doc.text(`Name: ${order.buyer?.fullName || 'N/A'}`);
    doc.text(`Delivery Address: ${order.deliveryAddress}, ${order.deliveryCity}`);
    doc.text(`Phone: ${order.contactPhone}`);
    doc.moveDown();

    doc.fontSize(12).fillColor('#8B4513').text('Seller');
    doc.fontSize(10).fillColor('#333');
    doc.text(`Name: ${order.seller?.fullName || 'N/A'}`);
    doc.moveDown();

    doc.fontSize(10).fillColor('#333')
      .text(`Payment Method: ${order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online'}`);
    doc.moveDown(2);

    doc.fontSize(9).fillColor('#aaa')
      .text('This is a computer-generated receipt from ReHome Nepal.', { align: 'center' });

    doc.end();
  });
}

module.exports = generateReceiptPDF;