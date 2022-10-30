const mongoose = require('mongoose');



const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: mongoose.Decimal128,
    img: {
        data: Buffer,
        contentType: String
    },
    auctionTime: Date,
    sold: {
        type: Boolean,
        default: false
    }
});

module.exports = new mongoose.model("Product", productSchema);