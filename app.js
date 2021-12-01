const express = require("express");
const crypto = require("crypto");
const { Buffer } = require("buffer");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const { send } = require("process");
const { info } = require("console");
const { resolveSoa } = require("dns");
const e = require("express");
const { ResumeToken } = require("mongodb");
const { json } = require("body-parser");
const CONNECTION_URL = "mongodb+srv://theom:theomdev123@cluster0.xrtup.mongodb.net/cykelhandler?retryWrites=true&w=majority";
const DATABASE_NAME = "cykelhandler";
let port = process.env.PORT || 5000;

var app = express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
var database, brugerCollection, vareCollection;

app.listen(port, () => {
  MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
      if(error) {
          throw error
      }
      database = client.db(DATABASE_NAME);
      brugerCollection = database.collection("brugere");
      vareCollection = database.collection("varer");
      console.log("Connected to database...");
  });
});

app.get("/", (req, res) => {
res.send('CykelHandler backend // Udviklet af @theodorstenz');
});

//Login
app.get("/login/:user/:pass/:prev", (req, res) => {
  //Find username in db
  brugerCollection.findOne({ "brugernavn": req.params.user }, (error, result) => {
    //On error
    if(error)
    {
      res.sendStatus(500);
    }
    //On vaild result
    if(result != null)
    {
      brugerCollection.findOne({ "kodeord": req.params.pass}, (error, result) => {
        if(error)
        {
          //On error
          res.sendStatus(500);
        }
        if(result != null)
        {
           res.redirect('url' + '/' + req.params.prev)
        }
        else
        {
          //Request is invalid and server returned: 401 - Unauthorized
          result.sendStatus(401);
        }
      });
    }
    else
    {
      //On invalid result
      res.sendStatus(401);
    }
  });
});

////Product Management

//Product Add
app.get("/addproduct/:user/:pass/:productname/:productprice/:productimage", (req, res) => {
  //Authorization
  //Find username in db
  brugerCollection.findOne({ "brugernavn": req.params.user }, (error, result) => {
    //On error
    if(error)
    {
      res.sendStatus(500);
    }
    //On vaild result
    if(result != null)
    {
      brugerCollection.findOne({ "kodeord": req.params.pass}, (error, result) => {
        if(error)
        {
          //On error
          res.sendStatus(500);
        }
        if(result != null)
        {
          //Authorization complete
          //Add Product
          vareCollection.insertOne({"navn": req.params.productname, "pris": req.params.productprice, "billede": req.params.productimage}, (error) => {
            if(error)
            {
              res.sendStatus(500);
            }
            else
            {
              res.sendStatus(200);
            }
          });
        }
        else
        {
          //Authorization failed
          result.sendStatus(401);
        }
      });
    }
    else
    {
      //On invalid result
      res.sendStatus(401);
    }
  });
});

//Product Remove
//Product id instead of product name?  -   Test and change if needed.
app.get("/removeproduct/:user/:pass/:productname", (req, res) => {
 //Authorization
  //Find username in db
  brugerCollection.findOne({ "brugernavn": req.params.user }, (error, result) => {
    //On error
    if(error)
    {
      res.sendStatus(500);
    }
    //On vaild result
    if(result != null)
    {
      brugerCollection.findOne({ "kodeord": req.params.pass}, (error, result) => {
        if(error)
        {
          //On error
          res.sendStatus(500);
        }
        if(result != null)
        {
          //Authorization complete
          //Remove Product
          vareCollection.deleteOne({ "navn": req.params.productname}, (error) => {
            if(error)
            {
              res.sendStatus(500);
            }
            else
            {
              res.sendStatus(200);
            }
          });
        }
        else
        {
          //Authorization failed
          result.sendStatus(401);
        }
      });
    }
    else
    {
      //On invalid result
      res.sendStatus(401);
    }
  });
});