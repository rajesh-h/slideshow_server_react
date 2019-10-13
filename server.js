// Create express app
var express = require("express")
var cors = require('cors'); //To Avoid cors issues

var app = express()



var db = require("./database.js")

app.use(cors());
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'))


// Server port
var HTTP_PORT = 8000 
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

// Insert here other API endpoints

//List All Slides from Slider table
app.get("/api/slides", (req, res, next) => {
    var sql = "select * from slider ORDER BY ID DESC"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

// View single slide
app.get("/api/slides/:id", (req, res, next) => {
    var sql = "select * from slider where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

// Create a Single Slide
app.post("/api/slide/", (req, res, next) => {
    var errors=[]
    if (!req.body.title){
        errors.push("No title specified");
    }
    if (!req.body.imageurl){
        errors.push("No imageurl specified");
    }
    if (!req.body.description){
        errors.push("No description specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        title: req.body.title,
        imageurl: req.body.imageurl,
        description : req.body.description
    }
    var sql ='INSERT INTO slider (title, imageurl, description) VALUES (?,?,?)'
    var params =[data.title, data.imageurl, data.description]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})


// Update an existing slide
app.patch("/api/slide/:id", (req, res, next) => {
    var data = {
        title: req.body.title,
        imageurl: req.body.imageurl,
        description : req.body.description 
    }
    db.run(
        `UPDATE slider set 
           title = COALESCE(?,title), 
           imageurl = COALESCE(?,imageurl), 
           description = COALESCE(?,description) 
           WHERE id = ?`,
        [data.title, data.imageurl, data.description, req.params.id],
        function (err, result) {
            if (err){ 
                console.log(err)               
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
})


//Delete a Slide
app.delete("/api/slide/:id", (req, res, next) => {
    db.run(
        'DELETE FROM Slider WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
})

// Get Active Slides only where active property is True
app.get("/api/activeslides", (req, res, next) => {
    var sql = "select * from slider ORDER BY ID DESC"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});


// Default response for any other request
app.use(function(req, res){
    res.status(404);
});
