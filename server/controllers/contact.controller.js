import { Resend } from "resend";
import { env } from "../config/env.config.js";
import Message from "../models/message.model.js";

const resend = new Resend(env.resend_api_key);

// Escape HTML to prevent XSS in email templates
const escapeHtml = (str) => {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const handleSendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }

    if (subject.trim().length < 3) {
      return res.status(400).json({ error: "Subject must be at least 3 characters" });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({ error: "Message must be at least 10 characters" });
    }

    // 1. Always persist the message to database so it is never lost
    const savedMessage = await Message.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      status: "unread",
    });

    // 2. Attempt email dispatch via Resend without failing the request if email service has issues
    if (env.resend_api_key) {
      try {
        const safeName = escapeHtml(name.trim());
        const safeEmail = escapeHtml(email.trim());
        const safeSubject = escapeHtml(subject.trim());
        const safeMessage = escapeHtml(message.trim());

        await resend.batch.send([
          {
            from: `BidX Support <onboarding@resend.dev>`,
            to: ["admin@bidx.com"],
            reply_to: email.trim(),
            subject: `[Contact Form] ${safeSubject}`,
            html: adminEmailTemplate(safeName, safeEmail, safeSubject, safeMessage),
          },
          {
            from: `BidX Support <onboarding@resend.dev>`,
            to: email.trim(),
            subject: `We've received your message: ${safeSubject}`,
            html: userEmailTemplate(safeName, safeEmail, safeSubject, safeMessage),
          },
        ]);
      } catch (emailErr) {
        console.warn("Resend email dispatch warning (message saved to DB):", emailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully! Our team will get back to you soon.",
      data: savedMessage,
    });
  } catch (error) {
    console.error("Error in handleSendMessage:", error);
    return res.status(500).json({ error: "Failed to submit message. Please try again." });
  }
};

const userEmailTemplate = (name, email, subject, message) => `
  <!DOCTYPE html>
  <html lang="en" style="margin: 0; padding: 0;">
    <head>
      <meta charset="UTF-8" />
      <title>Contact Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f4f6;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .btn {
          display: inline-block;
          background-color: #007bff;
          color: #fff;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          font-size: 12px;
          color: #888;
          text-align: center;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Hi <strong>${name}</strong>,</p>

        <p>
          Thank you for contacting us. We’ve received your message and our team will get back to you shortly. Here's a copy of what you submitted:
        </p>

        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>

        <a href="http://localhost:3000" class="btn">Visit Our Website</a>

        <p>
          If this wasn’t you or you need immediate help, feel free to reply directly to this email.
        </p>

        <div class="footer">
          &copy; 2025 Auction Platform (Darshan Prajapati). All rights reserved. <br />
          This is an automated confirmation. Please do not reply.
        </div>
      </div>
    </body>
  </html>
`;

const adminEmailTemplate = (name, email, subject, message) => `
<!DOCTYPE html>
  <html lang="en" style="margin: 0; padding: 0;">
    <head>
      <meta charset="UTF-8" />
      <title>Contact Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f4f6;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
      </style>
    </head>
    <body>
      <div class="container">
      <p>
          New Contact Form Submission from Online Auction
        </p>

        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>

      </div>
    </body>
    </html>
`;
