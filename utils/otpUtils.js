const bcrypt = require('bcryptjs');

function generateNumericOtp(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

function getExpiryDate(minutes = 5) {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + minutes);
  return expires;
}

async function hashOtp(otp) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp, salt);
}

async function compareOtp(otp, hash) {
  return await bcrypt.compare(otp, hash);
}

module.exports = {
  generateNumericOtp,
  getExpiryDate,
  hashOtp,
  compareOtp
};


