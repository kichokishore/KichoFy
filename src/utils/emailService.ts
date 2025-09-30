import { Resend } from 'resend';
import { Order, User, Product } from '../types';

// Initialize Resend with your API key
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY || 're_123456789');

// Use your Resend domain
const RESEND_DOMAIN = 'kichofy.resend.dev';

// Email templates
interface EmailTemplates {
  orderConfirmation: (order: Order, user: User) => any;
  orderShipped: (order: Order, user: User, trackingNumber: string) => any;
  orderDelivered: (order: Order, user: User) => any;
  welcome: (user: User) => any;
  passwordReset: (user: User, resetLink: string) => any;
}

const emailTemplates: EmailTemplates = {
  orderConfirmation: (order: Order, user: User) => ({
    subject: `Order Confirmed - ${order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .product-item { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #e5e7eb; }
          .product-image { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px; }
          .status-timeline { display: flex; justify-content: space-between; margin: 30px 0; }
          .status-step { text-align: center; flex: 1; }
          .status-dot { width: 12px; height: 12px; background: #10B981; border-radius: 50%; margin: 0 auto 10px; }
          .status-pending { background: #9CA3AF; }
          .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your purchase, ${user.name || 'Valued Customer'}!</p>
          </div>
          
          <div class="content">
            <div class="order-details">
              <h2>Order Details</h2>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ₹${order.total_amount.toLocaleString()}</p>
              
              <h3 style="margin-top: 20px;">Items Ordered</h3>
              ${order.order_items?.map(item => `
                <div class="product-item">
                  <img src="${item.product?.image_url || 'https://images.pexels.com/photos/9503741/pexels-photo-9503741.jpeg'}" 
                       alt="${item.product?.name}" class="product-image">
                  <div style="flex: 1;">
                    <strong>${item.product?.name}</strong>
                    <p style="margin: 5px 0; color: #6B7280;">
                      Quantity: ${item.quantity} • Size: ${item.size} • Color: ${item.color}
                    </p>
                    <p style="margin: 0; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="status-timeline">
              <div class="status-step">
                <div class="status-dot"></div>
                <p><strong>Order Placed</strong></p>
                <small>${new Date(order.created_at).toLocaleDateString()}</small>
              </div>
              <div class="status-step">
                <div class="status-dot status-pending"></div>
                <p>Processing</p>
                <small>Next 24 hours</small>
              </div>
              <div class="status-step">
                <div class="status-dot status-pending"></div>
                <p>Shipped</p>
                <small>1-2 days</small>
              </div>
              <div class="status-step">
                <div class="status-dot status-pending"></div>
                <p>Delivered</p>
                <small>3-5 days</small>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${import.meta.env.VITE_APP_URL}/order-confirmation/${order.id}" class="button">
                View Order Details
              </a>
            </div>

            <div style="background: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #92400E;">
                <strong>📦 Shipping Information:</strong><br>
                Your order will be processed within 24 hours. You'll receive another email with tracking information once your order ships.
              </p>
            </div>

            <div class="footer">
              <p>If you have any questions, please contact our support team at support@kichofy.com</p>
              <p>&copy; 2024 KichoFy. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderShipped: (order: Order, user: User, trackingNumber: string) => ({
    subject: `Your Order Has Shipped! - ${order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .tracking-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 Your Order is on the Way!</h1>
            <p>Great news, ${user.name || 'Valued Customer'}! Your order has been shipped.</p>
          </div>
          
          <div class="content">
            <div class="tracking-info">
              <h2>Tracking Information</h2>
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Estimated Delivery:</strong> ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              
              <div style="margin: 30px 0;">
                <a href="https://www.shipment-tracker.com/track/${trackingNumber}" class="button" target="_blank">
                  Track Your Package
                </a>
              </div>
            </div>

            <div style="background: #F0F9FF; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #0369A1;">
                <strong>💡 Pro Tip:</strong> You can track your package using the tracking number above. 
                Most deliveries occur between 9 AM and 8 PM.
              </p>
            </div>

            <div class="footer">
              <p>Need help with your delivery? Contact our support team at support@kichofy.com</p>
              <p>&copy; 2024 KichoFy. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderDelivered: (order: Order, user: User) => ({
    subject: `Your Order Has Been Delivered - ${order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .review-prompt { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 10px; }
          .footer { text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 Delivery Successful!</h1>
            <p>Your KichoFy order has been delivered, ${user.name || 'Valued Customer'}!</p>
          </div>
          
          <div class="content">
            <div class="review-prompt">
              <h2>How was your experience?</h2>
              <p>We'd love to hear your feedback about the products and delivery experience.</p>
              
              <div style="margin: 30px 0;">
                <a href="${import.meta.env.VITE_APP_URL}/orders" class="button">
                  Leave a Review
                </a>
                <a href="${import.meta.env.VITE_APP_URL}/collections" class="button" style="background: #6B7280;">
                  Shop Again
                </a>
              </div>
            </div>

            <div style="background: #F0FDF4; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #166534;">
                <strong>📦 Return Policy:</strong> Not satisfied with your purchase? 
                You have 30 days to return items in original condition.
              </p>
            </div>

            <div class="footer">
              <p>Thank you for shopping with KichoFy! We hope to see you again soon.</p>
              <p>&copy; 2024 KichoFy. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  welcome: (user: User) => ({
    subject: `Welcome to KichoFy - Your Fashion Journey Begins!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #EC4899, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .benefit-item { display: flex; align-items: center; margin: 15px 0; }
          .benefit-icon { font-size: 24px; margin-right: 15px; }
          .button { display: inline-block; background: #EC4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👋 Welcome to KichoFy!</h1>
            <p>Hello ${user.name || 'there'}! We're thrilled to have you join our fashion community.</p>
          </div>
          
          <div class="content">
            <div class="benefits">
              <h2>Your Fashion Benefits</h2>
              
              <div class="benefit-item">
                <span class="benefit-icon">🚚</span>
                <div>
                  <strong>Free Shipping</strong>
                  <p>On orders above ₹999</p>
                </div>
              </div>
              
              <div class="benefit-item">
                <span class="benefit-icon">⭐</span>
                <div>
                  <strong>Exclusive Offers</strong>
                  <p>Special discounts for members</p>
                </div>
              </div>
              
              <div class="benefit-item">
                <span class="benefit-icon">↩️</span>
                <div>
                  <strong>Easy Returns</strong>
                  <p>30-day hassle-free returns</p>
                </div>
              </div>
              
              <div class="benefit-item">
                <span class="benefit-icon">🎁</span>
                <div>
                  <strong>Early Access</strong>
                  <p>Be the first to see new collections</p>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${import.meta.env.VITE_APP_URL}/collections" class="button">
                Start Shopping
              </a>
            </div>

            <div style="background: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #92400E;">
                <strong>🎉 Welcome Offer:</strong> Use code <strong>WELCOME10</strong> for 10% off your first order!
              </p>
            </div>

            <div class="footer">
              <p>Happy shopping! If you need any help, contact us at support@kichofy.com</p>
              <p>&copy; 2024 KichoFy. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  passwordReset: (user: User, resetLink: string) => ({
    subject: `Reset Your KichoFy Password`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .reset-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset</h1>
            <p>We received a request to reset your password</p>
          </div>
          
          <div class="content">
            <div class="reset-info">
              <p>Hello ${user.name || 'there'},</p>
              <p>You recently requested to reset your password for your KichoFy account. Click the button below to reset it.</p>
              
              <div style="margin: 30px 0;">
                <a href="${resetLink}" class="button">
                  Reset Your Password
                </a>
              </div>
              
              <p style="color: #6B7280; font-size: 14px;">
                This password reset link will expire in 1 hour.<br>
                If you didn't request a password reset, please ignore this email.
              </p>
            </div>

            <div style="background: #FEF2F2; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #DC2626;">
                <strong>⚠️ Security Tip:</strong> Never share your password with anyone. 
                KichoFy will never ask for your password via email.
              </p>
            </div>

            <div class="footer">
              <p>If you have any questions, contact our support team at support@kichofy.com</p>
              <p>&copy; 2024 KichoFy. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Main email service - UPDATED FOR RESEND DOMAIN
export const emailService = {
  // Send order confirmation email
  async sendOrderConfirmation(order: Order, user: User): Promise<boolean> {
    try {
      if (!import.meta.env.VITE_RESEND_API_KEY) {
        console.warn('Resend API key not found. Email would be sent in production.');
        console.log('Order Confirmation Email Details:', {
          to: user.email,
          subject: `Order Confirmation - ${order.id}`,
          order: order.id,
          total: order.total_amount
        });
        return true; // Simulate success in development
      }

      const template = emailTemplates.orderConfirmation(order, user);
      
      const { data, error } = await resend.emails.send({
        from: `KichoFy <noreply@${RESEND_DOMAIN}>`,
        to: user.email,
        subject: template.subject,
        html: template.html,
      });

      if (error) {
        console.error('Error sending order confirmation email:', error);
        return false;
      }

      console.log('Order confirmation email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in sendOrderConfirmation:', error);
      return false;
    }
  },

  // Send order shipped email
  async sendOrderShipped(order: Order, user: User, trackingNumber: string): Promise<boolean> {
    try {
      if (!import.meta.env.VITE_RESEND_API_KEY) {
        console.log('Order Shipped Email Details:', {
          to: user.email,
          subject: `Order Shipped - ${order.id}`,
          trackingNumber,
          order: order.id
        });
        return true;
      }

      const template = emailTemplates.orderShipped(order, user, trackingNumber);
      
      const { data, error } = await resend.emails.send({
        from: `KichoFy <noreply@${RESEND_DOMAIN}>`,
        to: user.email,
        subject: template.subject,
        html: template.html,
      });

      if (error) {
        console.error('Error sending order shipped email:', error);
        return false;
      }

      console.log('Order shipped email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in sendOrderShipped:', error);
      return false;
    }
  },

  // Send order delivered email
  async sendOrderDelivered(order: Order, user: User): Promise<boolean> {
    try {
      if (!import.meta.env.VITE_RESEND_API_KEY) {
        console.log('Order Delivered Email Details:', {
          to: user.email,
          subject: `Order Delivered - ${order.id}`,
          order: order.id
        });
        return true;
      }

      const template = emailTemplates.orderDelivered(order, user);
      
      const { data, error } = await resend.emails.send({
        from: `KichoFy <noreply@${RESEND_DOMAIN}>`,
        to: user.email,
        subject: template.subject,
        html: template.html,
      });

      if (error) {
        console.error('Error sending order delivered email:', error);
        return false;
      }

      console.log('Order delivered email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in sendOrderDelivered:', error);
      return false;
    }
  },

  // Send welcome email
  async sendWelcomeEmail(user: User): Promise<boolean> {
    try {
      if (!import.meta.env.VITE_RESEND_API_KEY) {
        console.log('Welcome Email Details:', {
          to: user.email,
          subject: 'Welcome to KichoFy',
          user: user.name
        });
        return true;
      }

      const template = emailTemplates.welcome(user);
      
      const { data, error } = await resend.emails.send({
        from: `KichoFy <welcome@${RESEND_DOMAIN}>`,
        to: user.email,
        subject: template.subject,
        html: template.html,
      });

      if (error) {
        console.error('Error sending welcome email:', error);
        return false;
      }

      console.log('Welcome email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in sendWelcomeEmail:', error);
      return false;
    }
  },

  // Send password reset email
  async sendPasswordReset(user: User, resetLink: string): Promise<boolean> {
    try {
      if (!import.meta.env.VITE_RESEND_API_KEY) {
        console.log('Password Reset Email Details:', {
          to: user.email,
          subject: 'Reset Your KichoFy Password',
          resetLink
        });
        return true;
      }

      const template = emailTemplates.passwordReset(user, resetLink);
      
      const { data, error } = await resend.emails.send({
        from: `KichoFy <security@${RESEND_DOMAIN}>`,
        to: user.email,
        subject: template.subject,
        html: template.html,
      });

      if (error) {
        console.error('Error sending password reset email:', error);
        return false;
      }

      console.log('Password reset email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in sendPasswordReset:', error);
      return false;
    }
  },

  // Send custom email
  async sendCustomEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (!import.meta.env.VITE_RESEND_API_KEY) {
        console.log('Custom Email Details:', { to, subject });
        return true;
      }

      const { data, error } = await resend.emails.send({
        from: `KichoFy <noreply@${RESEND_DOMAIN}>`,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('Error sending custom email:', error);
        return false;
      }

      console.log('Custom email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in sendCustomEmail:', error);
      return false;
    }
  }
};

// Admin email functions - UPDATED FOR RESEND DOMAIN
export const adminEmailService = {
  // Send low stock alert to admin
  async sendLowStockAlert(products: Product[]): Promise<boolean> {
    const lowStockProducts = products.filter(p => p.stock <= 10);
    
    if (lowStockProducts.length === 0) return true;

    const html = `
      <h2>Low Stock Alert</h2>
      <p>The following products are running low on stock:</p>
      <ul>
        ${lowStockProducts.map(product => `
          <li>
            <strong>${product.name}</strong> - Only ${product.stock} left in stock
          </li>
        `).join('')}
      </ul>
      <p>Please restock these items soon.</p>
    `;

    return await emailService.sendCustomEmail(
      `admin@${RESEND_DOMAIN}`,
      `Low Stock Alert - ${lowStockProducts.length} Products`,
      html
    );
  },

  // Send new order notification to admin
  async sendNewOrderNotification(order: Order): Promise<boolean> {
    const html = `
      <h2>New Order Received</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Total Amount:</strong> ₹${order.total_amount.toLocaleString()}</p>
      <p><strong>Items:</strong> ${order.order_items?.length || 0}</p>
      <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
      
      <h3>Order Items:</h3>
      <ul>
        ${order.order_items?.map(item => `
          <li>
            ${item.product?.name} - Qty: ${item.quantity} - ₹${item.price}
          </li>
        `).join('')}
      </ul>
    `;

    return await emailService.sendCustomEmail(
      `orders@${RESEND_DOMAIN}`,
      `New Order - ${order.id}`,
      html
    );
  }
};

// Usage Examples:
/*
// Send order confirmation
await emailService.sendOrderConfirmation(order, user);

// Send welcome email
await emailService.sendWelcomeEmail(user);

// Send password reset
await emailService.sendPasswordReset(user, 'https://your-app.com/reset-password?token=abc123');

// Send low stock alert (admin)
await adminEmailService.sendLowStockAlert(lowStockProducts);

// Send new order notification (admin)
await adminEmailService.sendNewOrderNotification(order);
*/