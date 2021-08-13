/************************************************************************************
* WEB322 – FINAL (Summer 2021)
* I declare that this assignment is my own work in accordance with Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Name: Emre Isik
* Student ID: 137524195
* Course: WEB322NCC
* Professor Name: Haytham Qushtom
*
************************************************************************************/
var HTTP_PORT = process.env.PORT || 8080;

var express = require("express");
const path = require("path");
const app = express();

const bodyParser = require("body-parser");

const handle = require("express-handlebars");

const mongoose = require("mongoose");


const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

app.use(express.static("static"));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


const multer = require("multer");

var planPicStorage = multer.diskStorage({
    destination: "static/planPictures/",
    filename: (req, file, cb) => {
        
        cb(null, "planPic.jpg");
    }
})

const uploadPic = multer({storage: planPicStorage});

app.engine(".hbs", handle({extname:".hbs"}));
app.set("view engine", ".hbs");

mongoose.connect("mongodb+srv://emredbweb:Password!@web322clusteremre.cvsbc.mongodb.net/Web322db?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

//collection for accounts to register and login
const user_Schema = new Schema( {
    "firstName": String,
    "lastName": String,
    "email": { "type": String, "unique": true},
    "phNum": Number,
    "Password": String,
    "role": String,
    "Purchase": Object
});

var Accounts = mongoose.model("User", user_Schema);


let newUser1 = new Accounts({
    firstName: "Haytham", lastName: "Qushtom", email: "HQ@seneca.ca", phNum: 1233211234, Password: 123456, role: "admin"
}).save((err, data) => {
    if(err){
        console.log("create user error: " + err);
    }
    else {
        console.log("success. User created. " + data);
    }
})



let newUser3 = new Accounts({
    firstName: "John", lastName: "Wick", email: "johnwick@gmail.com", phNum: 9876543210, Password: 123456, role: "user"
}).save((err, data) => {
    if(err){
        console.log("create user error: " + err);
    }
    else {
        console.log("success. User created. " + data);
    }
})


//object storing data for WebHosting.hbs
var planGroup = [ 
    {
    name: "TTA Starter",
    desc: "Affordable, great for personal projects",
    price: "4.99",
    slot: 1,
    hot: true
    },
    {
    name: "TTA Pro",
    desc: "For those Looking for a little more",
    price: "9.99",
    slot: 2,
    hot: false
    },
    {
    name: "TTA Enterprise",
    desc: "Put your website into overdrive",
    price: "19.99",
    slot: 3,
    hot: false
    }
]
var userPlan = null;
var cart = true;


const clientSession = require("client-sessions");


app.use(clientSession({
    
    cookieName:"session",   
    secret: "week10-web322",     
    duration: 5 * 60 * 1000,   
    activeDuration: 5 * 60 * 1000
}));


function login(req, res, next) {
    if(req.session.user)
        next();
    else
        res.redirect("/");
}

//function to store data from page and used if error occurs
function getPreviousData(reqBody) {
    let previousData = {};
    for (const input in reqBody) {
      previousData[input] = reqBody[input];
    }
    return previousData;
  }



// setup a 'route' to listen on the default url path
app.get("/", function(req, res) {
    if(req.session.user){
        if(req.session.user.role == "admin")
            res.redirect("admindashboard");
        else
            res.redirect("/dashboard");
    }
    else
        // res.sendFile(path.join(__dirname,"/views/Index.html"));
        res.render("Index", {layout:false});
});


app.get("/dashboard", login, (req, res) => {
    if(req.session.user)
        res.render("dashboard", { data:req.session.user, layout:false});
    else
        res.status(404).send("page not found!");
});

app.get("/admindashboard", login, (req, res) => {
    if(req.session.user)
        res.render("admindashboard", { data:req.session.user, layout:false});
    else
        res.status(404).send("page not found!");
});


app.get("/login", function(req, res) {
    // res.sendFile(path.join(__dirname,"/views/Login.html"));
    if(req.session.user){
        res.redirect("/");
    } else {
        res.render("Login", {
            layout:false
        })
    }
});

app.get("/registration", function(req, res) {
    // res.sendFile(path.join(__dirname,"/views/Registration.html"));
    res.render("Registration", {
        layout:false
    })
});

app.get("/plans", function(req, res) {
    // res.sendFile(path.join(__dirname,"/views/WebHosting.html"));
    res.render("WebHosting", {
        plan:planGroup, 
        layout:false
    })
});


app.get("/createplan", function(req, res) {
    res.render("createplan", {layout:false})
});

app.get("/editplan", function(req, res) {
    res.render("editplan", {layout:false})
});


//admin path to update plans
app.post("/newplan", uploadPic.single("picture"), (req, res) => {
    if(req.body.hot == "true"){
        for (let i = 0; i < planGroup.length; i++) {
            planGroup[i].hot = false;
          }
    }

    let errorMsg = "";
    if (isNaN(req.body.planPrice)) {
        errorMsg += "The price can only be a number. ";
    }
    if(req.body.planName == "" || req.body.planPrice == "" || req.body.planDesc == "") {
        errorMsg += "All fields must be filled. ";
    } 
    if (req.body.planDesc > 50 || req.body.planName > 20) {
        errorMsg += "The description or name is too big. ";
    } 
    if(errorMsg) {
        console.log("Create plan errors: " + errorMsg);
        res.render("editPlan", {err:errorMsg, layout:false});
    } else {
        if(req.session.user.role == "admin") {
            var fileName = req.file.filename;
            
            console.log("Plan name: " + req.body.planName + " Plan price: " + req.body.planPrice  + " Plan Desc: " + req.body.planDesc + " Position: " + req.body.position + " Hot: " + req.body.hot); 
            console.log("File uploaded. Name is: " + fileName);

            if(req.body.position == 1) {
                planGroup[0].name = req.body.planName;
                planGroup[0].desc = req.body.planDesc;
                planGroup[0].price = req.body.planPrice;
                planGroup[0].hot = req.body.hot;
            }else if (req.body.position == 2) {
                planGroup[1].name = req.body.planName;
                planGroup[1].desc = req.body.planDesc;
                planGroup[1].price = req.body.planPrice;
                planGroup[1].hot = req.body.hot;
            }else if(req.body.position == 3) {
                planGroup[2].name = req.body.planName;
                planGroup[2].desc = req.body.planDesc;
                planGroup[2].price = req.body.planPrice;
                planGroup[2].hot = req.body.hot;
            }
            let msg = "Plan updated";

            res.render("editplan", {msg:msg, layout:false})
        } else
        res.render("editplan", {err:"You are not an admin", layout:false});
    }
});


//from the plans page
app.post("/addToCart", (req, res) => {
    if(req.session.user){
        console.log("Plan to add to cart: " + req.body.submit);
        userPlan = req.body.submit-1;
        res.redirect("plans");
    } else
    res.render("WebHosting", {msg:"You must be logged in to do that.", plan:planGroup, layout: false});

});


app.get("/usercart", (req, res) => {
    if(req.session.user){
        if(userPlan==null){
            res.render("usercart", {layout:false});
        } else
            res.render("usercart", {plan:planGroup[userPlan],cart:cart, layout:false});
    } else 
    res.status(404).send("You must be logged in");
})


//AJAX for the carts page
app.post("/calculate", (req, res) => {
    let result = "$" + req.body.cost * req.body.months;
    res.json({result:result});
});

//place the order from the shopping cart
app.post("/order", (req, res) => {
    userPlan = null;
    res.redirect("/");
});


app.post("/register", async (req, res) => {
    let previousData = getPreviousData(req.body);

    fName = req.body.fName,
    lName = req.body.lName,
    email = req.body.email,
    phNum = req.body.phNumber;
    pass = req.body.password;

    let errorMsg = "";

    //encrypt the password
    const pass1 = await bcrypt.hash(req.body.password, 10);
    var pass2 = bcrypt.hashSync(req.body.password, salt);

    console.log("password: " + pass + " Password1 " + pass1 + " Password 2: " + pass2);

    if(req.body.password != req.body.password2){
        errorMsg += "Passwords do not match. ";
    }
    if (isNaN(phNum)) {
        errorMsg += "The phone number can only contain numbers. ";
    }
    if(fName == "" || lName == "" || email == "" || phNum == "" || pass == "") {
        errorMsg += "All fields must be filled. ";
    } 
    if (req.body.password.length < 6 || req.body.password.length > 12){
        errorMsg += "Password must be 6-12 characters. ";
    } 
    if(errorMsg) {
        console.log("Registration error: " + errorMsg);
        res.render("Registration", {msg:errorMsg, previousData:previousData, layout:false});
    } else{
        //if no error msg create the user in the database.
        let newUser = new Accounts({
            firstName: fName, lastName: lName, email: email, phNum: phNum, Password: req.body.password, role: "user"
        }).save((err, data) => {
            if(err){
                console.log("create user error: " + err);
                res.send("User error: " + err);
            }
            else {
            console.log("success. User created. " + data);
            res.redirect("/login");
            }
        })
    }
})


app.post("/logged", (req, res) => {
    let previousData = getPreviousData(req.body);


    //function to search for the user
    findUser = function (userData) {
        return Accounts.findOne({
            $and: [
                { email: userData.email },
                { Password: userData.password }
            ]
        }).exec().then((data) => {
            console.log("data from function: " + data);
            return data;
        })
    }
   

    if(req.body.email == "" || req.body.password == ""){
        let errorMsg = "Either the username or password is empty.";
        console.log("Login error: " + errorMsg);
        return res.render("Login", {msg:errorMsg, layout:false})
    } else{
        findUser(req.body).then((data) => {
            if(data){
                if(data.role === 'admin'){
                    console.log("Admin. " + data.firstName + " " + data.lastName);
                    req.session.user = {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        role: data.role
                    };
                    res.redirect("/admindashboard");
                } else {
                console.log("User. " + data.firstName + " " + data.lastName);
                req.session.user = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: data.role
                };
                res.redirect("/dashboard");
                }
            } else {
                let errorMsg = "User not located in database. ";
                console.log(errorMsg);
                res.render("Login", {msg:errorMsg, previousData:previousData, layout:false});
            }
        });

    }

});

app.get("/logout", (req, res) => {
    req.session.reset();
    userPlan = null;
    res.redirect("/login");
  });

app.use(function (req, res) {
    res.status(404).send("page not found!");
    
});

app.listen(HTTP_PORT);
