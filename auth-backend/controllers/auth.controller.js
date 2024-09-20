

import bcrypt from "bcrypt";
import User from "../models/user.model.js"
import generateJWTTokenAndSetCookie from "../utils/generateToken.js"; 

const signup = async (req, res) => {
   try {
       const {username, password} = req.body;
       const hashedPassword = await bcrypt.hash(password, 10);       
       const foundUser = await User.findOne({username});
       if(foundUser) {
           res.status(201).json({message: 'Username already exists'});
       } else {
           const user = new User({username: username, password: hashedPassword}); 
           await user.save();
           generateJWTTokenAndSetCookie(user._id, res);
           res.status(201).json({message: 'User signed up successfully'});
       }
   } catch(error) {
       console.log(" error from server ",error);
       res.status(500).json({message: "User reg failed!"});
   }
} 

export const login = async(req, res) => {
    try {
        const {username, password} = req.body;
        const foundUser = await User.findOne({username});
        if(!foundUser) {
            return res.status(401).json({message: "Auth failed"});
        } else {
            const passwordMatch = await bcrypt.compare(password, foundUser?.password);
            if(!passwordMatch) {
                return res.status(401).json({message: "Auth failed"});
            }
            generateJWTTokenAndSetCookie(foundUser._id, res);
            return res.status(201).json({_id: foundUser._id, username: foundUser.username});
        }

    } catch(error) {
        console.log(error);
        return res.status(500).json({message: "Login failed!"});
    }
}
export default signup