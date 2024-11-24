import mongoose, { model } from "mongoose";

const UserSchema = new mongoose.Schema({
    username : {
        type : String,
        unique : true
    },
    password : {
        type : String,
    },
    email : {
        type : String,
        unique : true
    }
})

export const User = model('User', UserSchema);


