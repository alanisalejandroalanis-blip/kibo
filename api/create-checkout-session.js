const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { items, customerData } = req.body;

        const lineItems = items.map(priceId => ({
            price: priceId,
            quantity: 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: lineItems,
            metadata: {
                nombre: customerData.name,
                telefono: customerData.phone,
                direccion: customerData.address,
                preferencia: customerData.preference
            },
            success_url: `${req.headers.origin}/exito.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/`,
        });

        return res.status(200).json({ url: session.url });
    } catch (err) {
        console.error("Error en Stripe Checkout:", err);
        return res.status(500).json({ error: err.message });
    }
};