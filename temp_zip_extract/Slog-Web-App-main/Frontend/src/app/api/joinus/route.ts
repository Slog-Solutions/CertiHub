import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Handle POST requests to the /api/joinus endpoint
export async function POST(request: Request) {
    try {
        const { name, email, phone, position, message } = await request.json();

        // Basic validation
        if (!name || !email) {
            return NextResponse.json({ message: 'Name and email are required.' }, { status: 400 });
        }

        // 1. Create a Nodemailer transporter
        // NOTE: For security, use environment variables to store your credentials.
        // Example: process.env.EMAIL_USER and process.env.EMAIL_PASS
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER || 'slog.training@gmail.com',
              pass: process.env.EMAIL_PASSWORD || 'zgnmzjqqydixohct',
            },
            logger: true,
            debug: process.env.NODE_ENV === 'development',
          });

        // 2. Set up email content
        const mailOptions = {
            from: email,
            to: "slog.training@gmail.com", // The email address where you want to receive applications
            subject: 'New Join Us Application from Website',
            html: `
                <h2>New Application Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <p><strong>Position:</strong> ${position || 'N/A'}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `,
        };

        // 3. Send the email
        await transporter.sendMail(mailOptions);

        // 4. Return a success response
        return NextResponse.json({ message: 'Application sent successfully!' }, { status: 200 });

    } catch (error) {
        console.error('API Route Error:', error);
        // Return an error response if something goes wrong
        return NextResponse.json({ message: 'Failed to send application. Please try again later.' }, { status: 500 });
    }
}
