// const Stripe = require('stripe');
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Set in .env

// exports.createStripeSession = async (req, res) => {
//   const { bookingId, amount, ownerId } = req.body;

//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       mode: 'payment',
//       line_items: [{
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: `Court Booking #${bookingId}`,
//           },
//           unit_amount: parseInt(amount * 100),
//         },
//         quantity: 1,
//       }],
//       success_url: `${process.env.CLIENT_URL}/payment-success/${bookingId}`,
//       cancel_url: `${process.env.CLIENT_URL}/payment-cancel/${bookingId}`,
//       metadata: {
//         bookingId,
//         ownerId,
//       },
//     });

//     res.json({ id: session.id });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Stripe session creation failed' });
//   }
// };
// const stripe = require('../config/stripe');

// const sellers = {
//   'arena1@example.com': 'acct_1XXXXXX1',
//   'arena2@example.com': 'acct_1XXXXXX2',
// };

// exports.createCheckoutSession = async (req, res) => {
//   const { sellerEmail, amount } = req.body;
//   const accountId = sellers[sellerEmail];

//   if (!accountId) {
//     return res.status(400).json({ error: 'Seller not found' });
//   }

//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [{
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: `Booking with ${sellerEmail}`,
//           },
//           unit_amount: parseInt(amount),
//         },
//         quantity: 1,
//       }],
//       mode: 'payment',
//       success_url: 'http://localhost:5173/payment-success',
//       cancel_url: 'http://localhost:5173/payment-cancel',
//     }, {
//       stripeAccount: accountId,
//     });

//     res.json({ url: session.url });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const stripe = require('../config/stripe');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'], // or 'us_bank_account' for ACH
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};