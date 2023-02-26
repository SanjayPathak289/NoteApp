const express = require("express");
const path = require("path");
require("./db/conn")
const {CredColl, noteSchema} = require("./db/coll");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const { default: mongoose } = require("mongoose");
const auth = require("./middleware/auth")
const hbs = require("hbs");
// const Handlebars = require("handlebars");
const port = process.env.PORT || 8000;
const app = express();
const staticPath = path.join(__dirname,"/public");
var Usernote;
app.use(express.static(staticPath));

app.set("view engine", "hbs");

const partialPath = path.join(__dirname,"/partials");

hbs.registerPartials(partialPath);



app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeysanjay",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

app.get("/", auth,(req,res) => {
    res.render("index",{
        user : req.session.user
    })
});
app.get("/register", (req,res) => {
    res.render("register");
})
app.post("/register", async (req,res) => {
    const pass = req.body.password;
    const confirmpass = req.body.confirmpassword;
    if (pass === confirmpass) {
        const userData = new CredColl({
            username : req.body.username,
            password : pass
        })

        const token = await userData.generateAuthToken();
        // res.cookie("jwt",token,{
        //     expires: new Date(Date.now() + 9999999),
        //     httpOnly : true
        // });
        await userData.save();
        Usernote = req.body.username + 'note';
        Usernote = new mongoose.model(Usernote,noteSchema);
        res.render("register");
    }
})
app.post("/login", async (req,res) => {
    try {
        const userName = req.body.username;
        const pass = req.body.password;
        const data = await CredColl.findOne({username : userName});
        // const token = await data.generateAuthToken();
        // const token = await data.tokens[0].token;
        // res.cookie("jwt",token,{
        //     expires: new Date(Date.now() + 9999999),
        //     httpOnly : true,
        //     // secure:true
        // });
        
        if (pass === data.password) {
            const token = data.tokens[0].token;
            res.cookie("jwt",token,{
                expires: new Date(Date.now() + 9999999),
                httpOnly : true,
            });
            req.session.user = userName;
            Usernote = req.body.username + 'note';
            Usernote = new mongoose.model(Usernote,noteSchema);
            
            res.redirect('/');
        }
        else{
            res.send("Invalid username/password");
        }
        
    } catch (error) {
        res.send(error);
    }
    
})

app.get("/logout",(req,res) => {
    req.session.destroy();
    res.redirect('/register');
})



app.get("/notes",async (req,res) => {
    if (!req.session.user) {
        res.send("Please Login First")
    }
    else{
        
        const user_data = await Usernote.find();
        if (user_data) {
            res.render("notes",{
                notedata : user_data,
                user : req.session.user
            })
    
        }
        else{
            res.render("notes");
        }
    }
})


app.post("/notes", async (req,res) => {
    const user_title = req.body.title;
    const user_note = req.body.note;
    const notesData = new Usernote({
        title : user_title,
        data : user_note
    });
    await notesData.save();

    res.redirect("/notes");

})
app.get("/notes/:id", async (req,res) => {
    await Usernote.findByIdAndRemove({_id : req.params.id});
    res.redirect("/notes");
});

app.post("/notes/:id",async (req,res) => {
    await Usernote.findByIdAndUpdate(req.params.id,{
        title : req.body.updatetitle,
        data : req.body.updatenote
    });
    res.redirect("/notes");
})









app.listen(port,() => {
    console.log(`http://localhost:${port}`);
})