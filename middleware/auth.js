const jwt = require("jsonwebtoken");
// const {CredColl} = require("../db/coll");

const auth = async(req,res,next) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, "mynameissanjaypathakhelloworldiamgood")
        next();
    } catch (error) {
        // res.status(401).send(error);
        res.render("register");
    }
}
module.exports = auth;
