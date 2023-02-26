const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const userCred = new mongoose.Schema({
    username : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }]
})

const noteSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    data : {
        type : String,
        required : true
    }
});
userCred.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({_id : this._id.toString()},"mynameissanjaypathakhelloworldiamgood")
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        res.send("Error");
    }
}
const CredColl = new mongoose.model("CredColl",userCred);
module.exports = {CredColl, noteSchema};
