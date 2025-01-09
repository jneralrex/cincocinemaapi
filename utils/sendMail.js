const nodemailer = require("nodemailer");
const config = require("../config/config");

const transporter = nodemailer.createTransport({
    service: "Gmail", 
    auth: {
        user: config.email, 
        pass: config.email_password,
    },
});

const sendEmail = async (to, subject, message) => {
    try {
        const mailOptions = {
            from: config.email, 
            to, 
            subject, 
            text: message, 
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        console.error("Full error: ", error.message);
        throw new Error("Failed to send email");
    }
};

module.exports = sendEmail;
