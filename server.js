const express = require('express');
const app = express();
const cors = require('cors');
const mongodb = require('mongodb');
const DB = 'pollsmaker';
const bcrypt = require('bcryptjs');
require('dotenv').config();
const URL = process.env.DB;


app.use(cors());
app.use(express.json());

const BitlyClient = require('bitly').BitlyClient;
const { response } = require('express');
const bitly = new BitlyClient('<accessToken>');


app.use(cors());
app.use(express.json());

app.post('/login', async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let user = await db.collection('users').findOne({ email: req.body.email });

        if (user) {
            let isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
            if (isPasswordCorrect) {
                id = user._id
                res.json({
                    message: "allow",
                    id
                })
            }
            else {
                res.status(404).json({
                    message: "Email or password incorrect"
                })
            }
        }
        else {
            res.status(404).json({
                message: "Email or password incorrect"
            })
        }
        connection.close

    }
    catch (error) {
        console.log(error);
    }
})

app.post('/createpoll', async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        var id={};
        db.collection('polls').insertOne(req.body,function(err,insertedData){
          id = insertedData.insertedId
        })
        
        db.close
    }
    catch (error) {

    }
})

app.get('/getpolls/:user', async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let polls = await db.collection('polls').find({user_id : req.params.user}).toArray();
        if(polls.length>0){
            res.json(polls)
        }
        else{
            res.json({
                message : 'no polls'
            })
        }
    } catch (error) {
        console.log(error)
    }
})

app.post('/signup', async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let email = await db.collection('users').findOne({ email: req.body.email });
        if (!email) {
            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(req.body.password, salt);
            req.body.password = hash;
            db.collection('users').insertOne(req.body);
            res.json({
                message: 'user registered'
            })
        }
        else {
            res.json({
                message: 'email exist'
            })
        }
        connection.close

    } catch (error) {
        console.log(error);
    }
})

app.listen(process.env.PORT || 3030)