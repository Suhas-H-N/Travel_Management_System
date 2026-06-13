const PdfPrinter = require('pdfmake');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const fonts = {
  Roboto: {
    normal: 'node_modules/pdfmake/build/vfs_fonts.js',
    bold: 'node_modules/pdfmake/build/vfs_fonts.js',
  }
};

/**
 * Generate an e-ticket PDF for a confirmed booking
 * @param {Object} booking - Populated booking document
 * @returns {String} - Local file path of generated PDF
 */
const generateETicket = async (booking) => {
  try {
    const qrData = JSON.stringify({
      ref: booking.bookingRef,
      id: booking._id.toString(),
      type: booking.bookingType,
      date: booking.travelDate,
    });

    const qrCodeBase64 = await QRCode.toDataURL(qrData, { width: 150, margin: 1 });

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content: [
        // Header
        {
          columns: [
            {
              stack: [
                { text: '✈ Travel Management System', style: 'header' },
                { text: 'E-TICKET / BOOKING CONFIRMATION', style: 'subheader' },
              ]
            },
            { image: qrCodeBase64, width: 90, alignment: 'right' }
          ]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 2, lineColor: '#1F4E79' }] },
        { text: '\n' },

        // Booking details
        {
          style: 'tableExample',
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Booking Reference', style: 'tableHeader' },
                { text: 'Status', style: 'tableHeader' },
              ],
              [
                { text: booking.bookingRef, style: 'bookingRef' },
                { text: booking.status.toUpperCase(), style: 'statusBadge', color: '#27ae60' },
              ],
            ]
          },
          layout: 'lightHorizontalLines'
        },
        { text: '\n' },

        // Journey / Service details
        { text: 'JOURNEY DETAILS', style: 'sectionTitle' },
        {
          table: {
            widths: [150, '*'],
            body: [
              ['Booking Type', { text: booking.bookingType.toUpperCase(), bold: true }],
              ['Travel Date', new Date(booking.travelDate).toDateString()],
              ...(booking.returnDate ? [['Return Date', new Date(booking.returnDate).toDateString()]] : []),
              ['Base Fare', `₹${booking.baseFare || booking.totalAmount}`],
              ['Taxes (18% GST)', `₹${booking.taxes || 0}`],
              ['Total Amount Paid', { text: `₹${booking.totalAmount}`, bold: true, fontSize: 14 }],
            ]
          },
          layout: 'lightHorizontalLines'
        },
        { text: '\n' },

        // Passengers
        ...(booking.passengers?.length > 0 ? [
          { text: 'PASSENGER DETAILS', style: 'sectionTitle' },
          {
            table: {
              widths: ['auto', '*', 'auto', 'auto', 'auto'],
              body: [
                ['#', 'Name', 'Age', 'Gender', 'Seat'].map(h => ({ text: h, style: 'tableHeader' })),
                ...booking.passengers.map((p, i) => [
                  i + 1, p.name, p.age, p.gender || '-', p.seatNumber || '-'
                ])
              ]
            },
            layout: 'lightHorizontalLines'
          },
          { text: '\n' },
        ] : []),

        // Footer
        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#cccccc' }] },
        {
          columns: [
            { text: 'For support: support@travelms.com | +91-1800-TMS-HELP', fontSize: 9, color: '#666' },
            { text: `Generated: ${new Date().toLocaleString('en-IN')}`, fontSize: 9, color: '#666', alignment: 'right' }
          ]
        },
        { text: 'This is a computer-generated document and does not require a signature.', fontSize: 8, color: '#999', alignment: 'center', margin: [0, 4, 0, 0] },
      ],
      styles: {
        header: { fontSize: 20, bold: true, color: '#1F4E79' },
        subheader: { fontSize: 11, color: '#2E75B6', margin: [0, 4, 0, 0] },
        sectionTitle: { fontSize: 12, bold: true, color: '#1F4E79', margin: [0, 8, 0, 4] },
        tableHeader: { bold: true, fillColor: '#D5E8F0', fontSize: 10 },
        bookingRef: { fontSize: 18, bold: true, color: '#1F4E79' },
        statusBadge: { fontSize: 14, bold: true },
      },
      defaultStyle: { font: 'Roboto', fontSize: 10 }
    };

    // Save PDF to temp directory
    const outputDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const filePath = path.join(outputDir, `${booking.bookingRef}.pdf`);

    // In production, upload to Cloudinary and return URL
    // For now, return the local path
    return filePath;
  } catch (err) {
    console.error('PDF generation error:', err);
    return null;
  }
};

module.exports = { generateETicket };
