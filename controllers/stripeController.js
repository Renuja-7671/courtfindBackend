const stripe = require('../config/stripe');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'], 
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};