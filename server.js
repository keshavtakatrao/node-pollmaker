const express = require('express');
const app = express();
const cors = require('cors');
const mongodb = require('mongodb');
const DB = 'pollsmaker';
const bcrypt = require('bcryptjs');
require('dotenv').config();
const URL = process.env.DB;

var tinny = '';
app.use(cors());
app.use(express.json());

const TinyURL = require('tinyurl');

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

app.post('/submit/:id',async function(req,res){
   try {
    let id = req.params.id
    const ObjectId = require('mongodb').ObjectId;
    let o_id = new ObjectId(id)
      let connection = await mongodb.connect(URL);
      let db = connection.db(DB);
      db.collection('polls').updateOne({_id :o_id,"options.opt":req.body.vote},{$inc:{"options.$.votes":1}})
      res.json({
          message:"vote submitted"
      })
   } catch (error) {
       console.log(error)
   }
})

app.post('/createpoll', async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        const user = db.collection('polls').insertOne(req.body)
        var id = (await user).insertedId;
        TinyURL.shorten('https://keshavtakatrao.github.io/pollmaker-react/#/poll/'+id, function (response, err) {
            if (err)
                console.log(err)
            tinny = response
            pid = JSON.stringify(id)
            db.collection('polls').updateOne({ _id: id }, { $set: { shortUrl: tinny  }});
            res.json({
                message: 'poll created',
                shortUrl: tinny
            })
        });
       db.close
    }
    catch (error) {

    }
})

app.get('/getpolls/:user', async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let polls = await db.collection('polls').find({ user_id: req.params.user }).toArray();
        console.log('-----', req.params.user);
        if (polls.length > 0) {
            res.json(polls)
        }
        else {
            res.json([])
        }
    } catch (error) {
        console.log(error)
    }

})

app.get('/poll/:id', async function (req, res) {
    try {
        let id = req.params.id
        const ObjectId = require('mongodb').ObjectId;
        let o_id = new ObjectId(id)
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let polls = await db.collection('polls').findOne({ _id: o_id })
        res.json(polls);
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