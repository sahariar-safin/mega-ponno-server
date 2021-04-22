const express = require('express')
const app = express()
require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const FileUpload = require('express-fileupload');
const { response } = require('express')
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('service'));
app.use(FileUpload());

const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASS }@cluster0.t6lve.mongodb.net/${ process.env.DB_NAME }?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const products = client.db(`${ process.env.DB_NAME }`).collection("products");
    const banner = client.db(`${ process.env.DB_NAME }`).collection("banner");
    const order = client.db(`${ process.env.DB_NAME }`).collection("order");

    app.post("/addproduct", (req, res) => {
        const image = req.files.image;
        const image2 = req.files.image2;
        if (image2) {
            const imgData = {
                size: image.size,
                imageType: image.mimetype,
                img: [Buffer.from(image.data).toString('base64'), Buffer.from(image2.data).toString('base64')]
            };
            const product = {
                ...req.body,
                imgData
            }
            products.insertOne(product)
                .then(response => {
                    res.send(response);
                })
        } else {
            const imgData = {
                size: image.size,
                imageType: image.mimetype,
                img: [Buffer.from(image.data).toString('base64')]
            };
            const product = {
                ...req.body,
                imgData
            }
            products.insertOne(product)
                .then(response => {
                    res.send(response);
                })
        }
    });

    app.get('/manageproducts', (req, res) => {
        products.find({})
            .toArray((err, product) => {
                res.send(product);
            })
    })

    app.post('/deleteProduct', (req, res) => {
        products.deleteOne({
            productID: req.body.id
        })
            .then(response => {
                res.send(response);
            })
    })

    app.post("/uloadbanner", (req, res) => {
        const image = req.files.image;
        const imgData = {
            size: image.size,
            imageType: image.mimetype,
            img: Buffer.from(image.data).toString('base64')
        };
        const bannerData = {
            ...req.body,
            imgData
        }
        banner.insertOne(bannerData)
            .then(response => {
                res.send(response);
            })
    })

    app.get("/banners", (req, res) => {
        banner.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/flashSell', (req, res) => {
        products.find({
            isFlashSell: "true"
        })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addFlashSell', (req, res) => {
        if (req.body.isFlashSell === "false") {
            products.updateOne({ productID: req.body.productId },
                { $set: { isFlashSell: "true" } })
                .then(response => {
                    res.send(response);
                })
        } else {
            products.updateOne({ productID: req.body.productId },
                { $set: { isFlashSell: "false" } })
                .then(response => {
                    res.send(response);
                })
        }
    });

    app.post('/categorizedProducts', (req, res) => {
        console.log(req.body);
        products.find({
            category: req.body.categorySelected
        })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get("/product", (req, res) => {
        console.log(req.query.id);
        products.find({
            productID: req.query.id
        })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post("/cartProducts", (req, res) => {
        products.find({
            productID: { $in: req.body }
        })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addOrder', (req, res) => {
        order.insertOne(req.body)
            .then(response => {
                res.send(response);
            })
    })

    app.get('/orders', (req, res) => {
        order.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/deleteOrder', (req, res) => {
        order.deleteOne({
            orderId: req.body.id
        })
            .then(response => {
                res.send(response);
            })
    })

});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${ port }`)
})