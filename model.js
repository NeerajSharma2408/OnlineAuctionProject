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
    },
    bidPrice: {
        type: mongoose.Decimal128,
        default: 0.0
    },
    soldTo: {
        type: String,
        default: ""
    }
});

module.exports = new mongoose.model("Product", productSchema);