const crypto = require("crypto");
const config = require("../config/config");

const encryptToken = (token) => {
  const algorithm = "aes-192-cbc";
  const secretkey = config.refresh_token_secret;
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, secretkey, iv);
  const encrypted = Buffer.concat([cipher.update(token), cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

const decryptToken = (hash) => {
  const [iv, encryptedToken] = hash.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-192-cbc",
    config.refresh_token_secret,
    Buffer.from(iv, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedToken, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString();
};

module.exports = { encryptToken, decryptToken };