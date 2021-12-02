const express = require("express");
const crypto = require("crypto");
const { Buffer } = require("buffer");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const { send } = require("process");
const { info } = require("console");
const { resolveSoa } = require("dns");
const alert = require("alert");
const e = require("express");
const { ResumeToken } = require("mongodb");
const { json } = require("body-parser");
const CONNECTION_URL = "mongodb+srv://theom:theomdev123@cluster0.xrtup.mongodb.net/cykelhandler?retryWrites=true&w=majority";
const DATABASE_NAME = "cykelhandler";
let port = process.env.PORT || 5000;
var isloggedin = false;
var commonerr = 'Der skete en fejl. // Prøv igen senere.';

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

//Views
  app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
  });

  app.get("/index", (req, res) => {
  res.redirect('/');
  });

  app.get("/index.html", (req, res) => {
  res.redirect('/');
  });
  
  app.get("/produkter", (req, res) => {
  res.sendFile(__dirname + "/views/produkter.html");
  });
  
  app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/views/login.html");
  });
  
  //Resources
  app.get("/design.css" || "/design", (req, res) => {
    if(isloggedin == true)
    {
      res.sendFile(__dirname + "/resources/ldesign.css");
    }
    else
    {
      res.sendFile(__dirname + "/resources/design.css");
    }
  });
  
  app.get("/img/mountainbike", (req, res) => {
  res.sendFile(__dirname + "/resources/img/mountainbike.jpeg");
  });
  
  app.get("/img/produkter/mountainbike", (req, res) => {
  res.sendFile(__dirname + "/resources/img/produkter/mountainbike.jpg");
  });
  
  app.get("/img/citybike", (req, res) => {
  res.sendFile(__dirname + "/resources/img/citybike.jpg");
  });
  
  app.get("/img/produkter/citybike", (req, res) => {
  res.sendFile(__dirname + "/resources/img/produkter/citybike.jpg");
  });
  
  app.get("/img/ryttercykel", (req, res) => {
  res.sendFile(__dirname + "/resources/img/ryttercykel.jpg");
  });
  
  app.get("/img/produkter/ryttercykel", (req, res) => {
  res.sendFile(__dirname + "/resources/img/produkter/ryttercykel.jpeg");
  });
  
  app.get("/img/elcykel", (req, res) => {
  res.sendFile(__dirname + "/resources/img/elcykel.jpg");
  });
  
  app.get("/img/produkter/elcykel", (req, res) => {
  res.sendFile(__dirname + "/resources/img/produkter/elcykel.jpg");
  });
  
  app.get("/img/menu_white", (req, res) => {
  res.sendFile(__dirname + "/resources/img/menu_white.png");
  });
  
  app.get("/img/menu_black", (req, res) => {
  res.sendFile(__dirname + "/resources/img/menu_black.png");
  });
  
  app.get("/img/menu", (req, res) => {
  res.sendFile(__dirname + "/resources/img/menu.png");
  });

//Login
app.get("/dologin/:user/:pass/:prev/", (req, res) => {
  //Find username in db
  brugerCollection.findOne({ "brugernavn": req.params.user }, (error, result) => {
    //On error
    if(error)
    {
      alert(commonerr);
    }
    //On vaild result
    if(result != null)
    {
      brugerCollection.findOne({ "kodeord": req.params.pass}, (error, result) => {
        if(error)
        {
          //On error
          isloggedin = false;
          alert(commonerr);
        }
        if(result != null)
        {
          isloggedin = true;
          console.log('Logged in!');
          alert('Du er nu logget ind!');
          res.redirect('/' + req.params.prev);
        }
        else
        {
          //Request is invalid and server returned: 401 - Unauthorized
          isloggedin = false;
          alert(commonerr);
          res.redirect('/' + req.params.prev);
        }
      });
    }
    else
    {
      //On invalid result
      alert(commonerr);
      res.redirect('/' + req.params.prev);
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
      alert(commonerr);
    }
    //On vaild result
    if(result != null)
    {
      brugerCollection.findOne({ "kodeord": req.params.pass}, (error, result) => {
        if(error)
        {
          //On error
          alert(commonerr);
        }
        if(result != null)
        {
          //Authorization complete
          //Check if user is logged in + Add Product
          if(isloggedin == true)
          { 
          vareCollection.insertOne({"navn": req.params.productname, "pris": req.params.productprice, "billede": req.params.productimage}, (error) => {
            if(error)
            {
              alert('Der skete en fejl. Produktet blev ikke tilføjet. // Prøv igen senere');
            }
            else
            {
              alert('Succes! - Et prodult er blevet tilføjet!');
            }
          });
        }
        else
        {
          alert('Fejl - Du er ikke logget ind.');
          res.sendFile(__dirname + "/views/index.html");
        }
        }
        else
        {
          //Authorization failed
          alert(commonerr);
          res.sendFile(__dirname + "/views/index.html");
        }
      });
    }
    else
    {
      //On invalid result
      alert('Fejl - Du er ikke logget ind.');
      res.sendFile(__dirname + "/views/index.html");
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