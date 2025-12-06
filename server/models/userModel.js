const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "Provide Username"],
        unique: true
    },
    name: {
        type :String ,
        required: [true, "Provide Name"]


    },
    email : {
        type : String ,
        required: [true,"Provide E-mail"],
        unique: true
    },
    password :{
        type : String,
        required :[true, "Provide your password"]
    },
    profilePic :{
        type : String,
        default : ""

    },
    friends: [{
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    }],
    friendRequests: [{
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    }],
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date
    }
},{
    timestamps: true
     
})

const UserModel = mongoose.model('user',userSchema)

module.exports= UserModel   