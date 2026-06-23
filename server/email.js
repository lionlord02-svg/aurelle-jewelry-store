import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function sendOrderConfirmationEmail(order, customerEmail, customerName) {
  try {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    await resend.emails.send({
      from: FROM,
      to: customerEmail,
      subject: `Order Confirmed — Aurelle & Co. #${order.id}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <h1 style="font-size: 28px; margin-bottom: 8px;">Aurelle & Co.</h1>
          <p style="color: #888; margin-bottom: 40px; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase;">Fine Jewelry & Accessories</p>
          
          <h2 style="font-size: 22px; margin-bottom: 8px;">Thank you, ${customerName}!</h2>
          <p style="color: #555; margin-bottom: 32px;">Your order has been confirmed and is being prepared.</p>
          
          <div style="background: #faf9f7; padding: 24px; margin-bottom: 32px;">
            <p style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Order ID</p>
            <p style="margin: 0; font-weight: bold;">#${order.id}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="border-bottom: 2px solid #1a1a1a;">
                <th style="padding: 8px 0; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Item</th>
                <th style="padding: 8px 0; text-align: center; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Qty</th>
                <th style="padding: 8px 0; text-align: right; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="text-align: right; margin-bottom: 40px;">
            <p style="font-size: 18px; font-weight: bold;">Total: $${order.total.toFixed(2)}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 24px;">
          <p style="color: #888; font-size: 13px; text-align: center;">
            Questions? Reply to this email or visit aurelle-jewelry-store.vercel.app
          </p>
        </div>
      `,
    });

    console.log(`Order confirmation email sent to ${customerEmail}`);
  } catch (err) {
    console.error('Failed to send order confirmation email:', err.message);
  }
}
