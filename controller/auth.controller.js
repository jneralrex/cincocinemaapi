const User = require("../models/user.model");
const bycrpt = require("bcryptjs")

const signUp = async(req, res, next) => {
   const {username, email, phoneNumber, password} = req.body;
    try {
        if(!username, !email, !phoneNumber, !password){
            return res.status(403).json({message: "All fields are required"});
        }

        const usernameCheck = await User.findOne({username})
        if(usernameCheck){
            return  res.status(403).json({
                message:"User name already taken, please try another from our suggested name or try another"
            })
        };

        const emialCheck = await User.findOne({email});
        if(emialCheck){
            return res.status(403).json({
                message: "This email is already regiested",
                suggestions: suggestions
            });
        };

        const phoneCheck = await User.findOne({phoneCheck})
        if(phoneCheck){
            return  res.status(403).json({
                message: "This phone number is already registered, please use another",
            })
        };

        const hashedPassWord = bycrpt.hashSync(password, 10);
        const newUser = new User({username, email, phoneNumber, password:hashedPassWord});
        await newUser.save();
        res.status(201).json({
            message:"User created successfully"
        });
    } catch (error) {
        next(error); 
    }
};

module.exports = {signUp}