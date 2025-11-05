async function sendSms(to, body) {
  const provider = process.env.SMS_PROVIDER || 'twilio';
  if (provider !== 'twilio') {
    throw new Error(`Unsupported SMS provider: ${provider}`);
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;

  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM');
  }

  let twilio;
  try {
    twilio = require('twilio');
  } catch (e) {
    throw new Error('Twilio SDK not installed. Run: npm install twilio');
  }

  const client = twilio(accountSid, authToken);
  const msg = await client.messages.create({ to, from, body });
  return { sid: msg.sid };
}

module.exports = { sendSms };


