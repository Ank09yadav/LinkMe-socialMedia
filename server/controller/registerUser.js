const UserModel = require("../models/userModel")
const bcryptjs= require('bcryptjs')

async function registerUser(request, response) {
    try {

        const { userName, name, email, password, profilePic } = request.body

        const checkEmail = await UserModel.findOne({ email }) // {name , email} //null
        const checkUserName = await UserModel.findOne({userName})

        if(checkUserName){
            return response.status(400).json({
                message: "Username already taken, try another.", 
                error: true,
            })
        }

        if (checkEmail) {
            return response.status(400).json({
                message: "User already exists.", 
                error: true,
            })
        }

        // Password into hashPassword
        const salt = await bcryptjs.genSalt(10)
        const hashpassword = await bcryptjs.hash(password, salt)

        
        const payload = {
            userName,
            name,
            email,
            profilePic, 
            password: hashpassword
        }

        const user = new UserModel(payload)
        const userSave = await user.save()

        return response.status(201).json({
            message: "User created successfully.",
            data: userSave,
            success: true,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error ,
            error: true 
        })
        
    }
}

module.exports = registerUser