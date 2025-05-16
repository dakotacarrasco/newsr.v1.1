import { supabase } from '../services/supabase';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

async function sendDigestEmail() {
  console.log('Preparing to send digest email...');
  
  const recipientEmail = 'dakotacarrasco98@gmail.com';
  const cityCode = 'seattle';
  const cityName = 'Seattle';
  
  try {
    // 1. Fetch the latest digest from city_digests table
    console.log('\n1. Fetching latest city digest for Seattle...');
    const { data: cityDigest, error: digestError } = await supabase
      .from('city_digests')
      .select('*')
      .eq('city_code', cityCode)
      .eq('status', 'active')
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (digestError) {
      console.error('Error fetching digest:', digestError);
      return;
    }
    
    console.log('\nFound latest digest:', {
      id: cityDigest.id,
      date: cityDigest.date,
      status: cityDigest.status
    });
    
    // 2. Prepare digest content
    let emailContent = cityDigest.content || '';
    
    // Also save to file as backup
    const filename = `${cityCode}_digest_${new Date().toISOString().split('T')[0]}.html`;
    const filePath = path.join(process.cwd(), filename);
    fs.writeFileSync(filePath, emailContent);
    console.log(`Backup saved to: ${filePath}`);
    
    // 3. Set up email options
    console.log('\n2. Setting up email options...');
    
    // Check for required environment variables
    if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('\nMissing email configuration. Please set EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASSWORD in your .env file');
      console.log('Sample .env additions:');
      console.log('EMAIL_SERVICE=gmail');
      console.log('EMAIL_USER=your-email@gmail.com');
      console.log('EMAIL_PASSWORD=your-app-password');
      
      console.log('\nIn the meantime, you can view the digest by opening the HTML file that was saved:');
      console.log(`${filename}`);
      return;
    }
    
    // 4. Create email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    // 5. Send the email
    console.log('\n3. Sending email...');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `${cityName} Daily Digest - ${new Date().toLocaleDateString()}`,
      html: emailContent,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('\nSuccess! Digest email sent to:', recipientEmail);
    console.log('Message ID:', info.messageId);
    console.log('Check your inbox in a few minutes.');
    
  } catch (err) {
    console.error('Error sending email:', err);
    console.log('\nPlease use the HTML file that was generated and manually send it');
  }
}

// Execute the function if this file is run directly
if (require.main === module) {
  sendDigestEmail()
    .then(() => console.log('Email sending completed'))
    .catch(err => console.error('Email sending failed:', err));
}

export { sendDigestEmail }; 