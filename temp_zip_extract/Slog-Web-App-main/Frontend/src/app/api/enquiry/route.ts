import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { name, email, phone, message } = await req.json();

  // Validate the input
  if (!name || !email || !phone) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" }, 
      { status: 400 }
    );
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { success: false, error: "Invalid email format" }, 
      { status: 400 }
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || 'slog.training@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'zgnmzjqqydixohct',
    },
    logger: true,
    debug: process.env.NODE_ENV === 'development',
  });

  try {
    const mailOptions = {
      from: email || `"Website Enquiry" <noreply@yourdomain.com>`,
      replyTo: email,
      to: process.env.EMAIL_TO || "slog.training@gmail.com",
      subject: "New Enquiry Form Submission",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Enquiry Received</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold;">Name</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold;">Email</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">
                <a href="mailto:${email}">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold;">Phone</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">
                <a href="tel:${phone.replace(/\D/g, '')}">${phone}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold;">Message</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${message || 'No message provided'}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            This enquiry was submitted from your website contact form.
          </p>
        </div>
      `,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message || 'No message provided'}`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" }, 
      { status: 500 }
    );
  }
}