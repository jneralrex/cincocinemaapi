const crypto = require("crypto");
const config = require("../config/config");

// Ensure the key length is 24 bytes (for AES-192)
const getValidKey = (key) => key.padEnd(24, '0').slice(0, 24);  // Pad to 24 bytes if shorter, slice if longer

const encryptToken = (token) => {
  const algorithm = "aes-192-cbc";
  const secretkey = getValidKey(config.refresh_token_secret);  // Use the validated key
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, secretkey, iv);
  const encrypted = Buffer.concat([cipher.update(token), cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

const decryptToken = (hash) => {
  const [iv, encryptedToken] = hash.split(":");
  const secretkey = getValidKey(config.refresh_token_secret);  // Use the validated key

  const decipher = crypto.createDecipheriv(
    "aes-192-cbc",
    secretkey,
    Buffer.from(iv, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedToken, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString();
};

module.exports = { encryptToken, decryptToken };
