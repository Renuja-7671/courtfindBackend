// stripeWebhookController.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post("/webhook", express.raw({ type: 'application/json' }), async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    console.log("⚠️  Webhook error:", err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log("💰 Payment completed!", session);
      // Save or update booking/payment here
    }

    response.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    response.status(500).json({ error: "Webhook processing failed" });
  }
});

module.exports = router;