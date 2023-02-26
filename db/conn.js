const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://0.0.0.0:27017/notedb",
).then(() => {
    console.log("Connection Successful");
}).catch((err) => {
    console.log(err);
})

