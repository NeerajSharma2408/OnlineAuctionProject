const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require('multer');

const fs = require('fs');
const path = require('path');
require('dotenv/config');

const app = express();



// mongoose.connect("mongodb://127.0.0.1:27017/onlineauctionDB", {useNewUrlParser: true, useUnifiedTopology: true})
// .then( ()=> console.log("connection successful...") )
// .catch((err)=> console.log(err + "new problem"));

mongoose.connect(process.env.MONGO_URL,
	{ useNewUrlParser: true, useUnifiedTopology: true }, err => {
		console.log('mongoose server connected')
	});



// sites code --->
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine','ejs');

app.use(express.static("public"));



var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({ storage: storage });



var product = require('./model');



const buyerSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    productsPurchased: {
        type: [String],
        default: []
    },
    priceLimit: {
        productKey: {
            type: mongoose.Decimal128,
            default: 0.0
        },
    },
    priceIncrement: {
        productKey: {
            type: mongoose.Decimal128,
            default: 0.0
        },
    },
    totalMoneySpent: {
        type: mongoose.Decimal128,
        default: 0.0
    }
});
const Buyer = mongoose.model("Buyer", buyerSchema);



const sellerSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    productsDisplayed: {
        type: [String],
        default: []
    },
    totalMoneyEarned: {
        type: mongoose.Decimal128,
        default: 0.0
    }
});
const Seller = mongoose.model("Seller", sellerSchema);



app.get("/", function(req,res){
    res.render('adminuser.ejs');
})

app.get("/signup", function (req,res) {
    res.render('signup.ejs',{alertValue: " "});
})

app.post("/signup", function(req,res){
    const accountType = req.body.selectAccount;
    const userName = req.body.userName;
    const userEmail = req.body.email;
    const createdPassword = req.body.pass;

    // in below method a same email and username could be used for seller and user account
    // might change in future

    if (accountType === "seller") {
        Seller.find({$or: [
            { name: userName, email: userEmail },
            { name: userName },
            { email: userEmail }
          ]}
        )
        .then( function ( sellers) {
                console.log(sellers);

                if (sellers.length === 0) {
                    console.log("array empty");
                    const seller = new Seller ({
                        name: userName,
                        email: userEmail,
                        password: createdPassword,
                        productsDisplayed: [],
                        totalMoneyEarned: 0.0
                    });
                    seller.save( (err,s)=>{
                        if (err) {
                            console.log(err);
                        }
                        else{
                            res.redirect('/home/seller/' + s.id);
                        }
                    });

                    // res.render('/home/'+"seller",{userType: "seller", products: []}); 
                    // here send all the product list of sellers and also the defining varible who is used by if else statement to check whther add product option has to be rendered or not

                    // here you might not be able to send product objects so you can also change the redirect method to the render method
                }
                else{

                    // line 155 and 189
                    console.log("User already present");
                    res.render('signup.ejs',{alertValue: "showAlert"}); // you can send here a class name and add it to the html doc using ejs tags for the purpose of generating an alert
                }
        })
        .catch((err)=>{
            console.log(err);
        });
    }
    else{
        Buyer.find({$or: [
            { name: userName, email: userEmail },
            { name: userName },
            { email: userEmail }
          ]})
        .then( function ( buyers) {
            console.log(buyers);
            if (buyers.length === 0) {
                console.log("array empty");
                const buyers = new Buyer ({
                    name: userName,
                    email: userEmail,
                    password: createdPassword,
                    productsDisplayed: [],
                    totalMoneyEarned: 0.0
                });
                buyers.save((err,b)=>{
                    if(err){
                        console.log(err);
                    }else{
                        res.redirect('/home/buyer/' + b.id); // here send all the product list of sellers and also the defining varible who is used by if else statement to check whther add product option has to be rendered or not
                    }
                });
            }
            else{
                console.log("User already present");
                res.render('/signup',{alertValue: "showAlert"}); // you can send here a class name and add it to the html doc using ejs tags for the purpose of generating an alert --- bootstrap alert
            }
                
        })
        .catch((err)=>{
            console.log(err);
        });
    }
});

app.get("/login", function (req,res) {
    res.render('login.ejs',{alertValue: " "});
})

app.post("/login", function(req,res){

    // ask if there is any method to use account type as a dynamic varible in the below code so that code could be made short

    const accountType = req.body.AccountType;
    const username = req.body.userName; // you can make a choice to user to login using email or username... you just have to change the or statement in the find method
    const password = req.body.pass;

    if (accountType === "seller") {
        Seller.find({$or: [
            { name: username, password: password },
            { name: username },
            { password: password }
        ]})
        .then(function(sellers){

            if (sellers.length === 0) {
                console.log("No user Found");
                res.render('login.ejs',{alertValue: "showAlert"});
            }
            else{
                res.redirect('/home/seller/' + sellers[0].id); // here send all the product list of sellers and also the defining varible who is used by if else statement to check whther add product option has to be rendered or not
            }
        })
        .catch((err)=>{
            console.log(err);
        });
    }
    else{
        Buyer.find({$or: [
            { name: username, password: password },
            { name: username },
            { password: password }
        ]})
        .then(function(buyers){

            if (buyers.length === 0) {
                console.log("No user Found");
                res.render('login.ejs',{alertValue: "showAlert"});
            }
            else{
                res.redirect('/home/buyer/' + buyers[0].id); // here send all the product list of sellers and also the defining varible who is used by if else statement to check whther add product option has to be rendered or not
            }
        })
        .catch((err)=>{
            console.log(err);
        });
    }
});



// make a post method at home page for providing a delete button at the products div element
app.get("/home/:userType/:userId",function(req,res){
    const id = req.params.userId;
    const user = req.params.userType;

    if (user === "seller") {
        Seller.findById(id, (err, seller)=>{
            if(err){
                console.log(err);
            }
            else{
                product.find({ '_id': { $in: seller.productsDisplayed } }, (err,products)=> {
                // product.findByIds(seller.productsDisplayed, (err, products)=>{
                    if (err) {
                        console.log(err);
                    }
                    else{
                        res.render('home.ejs',{user: user, products: products, userId: id, seller: seller});
                    }
                });

            }
        });
    }
    else{
        Buyer.findById(id, (err, buyer)=>{
            if(err){
                console.log(err);
            }
            else{
                product.find({}, (err,products)=> {
                // product.findByIds(buyer.productsDisplayed, (err, products)=> {
                    if (err) {
                        console.log(err);
                    }
                    else{
                        res.render('home.ejs',{user: user, products: products, userId: id, buyer: buyer});
                    }
                });
            }
        });
    }

    // below code could be used to display products whos auction dates have not been expired
    // product.find({auctionTime: { $gte: Date.now()}}, (err, products)=>{
    //     if(err){
    //         console.log(err);
    //     }
    //     else{
    //         products.forEach(product =>{
    //             console.log(product.auctionTime);
    //         });
    //     }
    // });

});

app.post("/home/:user/:userId", (req,res)=>{

    const productId = req.body.productId;
    const userId = req.params.userId;

    console.log(productId);
    // const seller = Seller.findByIdAndUpdate(userId, { $pull: { productsDisplayed: productId } });
    // console.log(seller);
    Seller.findById(userId, (err, seller)=>{
        if (err) {
            console.log(err);
        }
        else{
            seller.productsDisplayed.pull(productId);
            console.log(seller);
            seller.save();
        }
    });

    product.findByIdAndDelete(productId, (err, product)=>{
        if (err) {
            console.log(err);
        }
        else{
            console.log(product);
        }
    });

    res.redirect('/home/seller/' + userId);

});

// below route can also be given as /home/:user/:userId/profile --- ther will be no effect, we would just have to change the ejs files route too
app.get("/profile/:user/:userId", function(req,res){

    const user = req.params.user;
    const id = req.params.userId;

    if (user === "seller") {
        Seller.findById(id, (err,seller)=>{
            if (err) {
                console.log(err);
            }
            else{
                res.render("profile.ejs", {user: user, User: seller});
            }
        });
    }
    else{
        Buyer.findById(id, (err,buyer)=>{
            if (err) {
                console.log(err);
            }
            else{
                res.render("profile.ejs", {user: user, User: buyer});
            }
        });
    }

});

app.get("/product/:userId", function(req,res){

    var date = new Date();
    const id = req.params.userId;

    // Get year, month, and day part from the date
    var year = date.toLocaleString("default", { year: "numeric" });
    var month = date.toLocaleString("default", { month: "2-digit" });
    var day = date.toLocaleString("default", { day: "2-digit" });

    var time = date.toLocaleTimeString('en-GB').slice(0,5);

    var formattedDate =year + "-" + month + "-" + day + "T" + time;
    console.log(formattedDate);



    res.render('product.ejs',{date: formattedDate, userId: id});
});

app.post("/product/:userId", upload.single('productImage'), (req, res, next)=>{

    const productTitle = req.body.productTitle;
    const productDescription = req.body.productDescription;
    const productPrice = req.body.productPrice;
    const auctionTime = req.body.auctionTime;
    const id = req.params.userId;

    console.log(req.file);
    var productObj = {
        name: productTitle,
        description: productDescription,
        price: productPrice,
        auctionTime: auctionTime,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        },
        sold: false
    }
    product.create(productObj, (err, item)=>{
        if (err) {
            console.log(err);
        }
        else{

            Seller.findByIdAndUpdate(id, { "$push": { "productsDisplayed": item._id } },
            { "new": true, "upsert": true },
            function (err, managerparent) {
                if (err) throw err;
                console.log(managerparent);
            }
            );

            // item.save();
            res.redirect('/home/seller/' + id);
        }
    });

});



// get mathod is made just for developing purpose otherwise a link from either home or any other place would be used to get to this page along with product object
app.get("/productDetails/:userType/:productid", function(req,res){
    const pid = req.params.productid;
    const userType = req.params.userType;


    product.findById(pid, (err,product) => {

        if (err) {
            console.log(err);
        }
        else{
            res.render('productDetails.ejs',{product: product, user: userType});
        }
    });
})

// app.get("/home/:userType/profile", function(req,res){
//     res.render('profile.ejs');
// });



const port = process.env.Port || '3000';

app.listen(port, err => {
	if (err)
		throw err
	console.log('Server listening on port', port)
})