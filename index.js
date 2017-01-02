var express = require('express');
var app = express();
var multer = require('multer');
var spicedPg = require('spiced-pg');
var config = require('./passwords.json');
var db = spicedPg('postgres:' + config.name + ':' + config.password + '@localhost:5432/events');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
var fs = require('fs');
var url = require('url');
var https = require('https');
var http = require('http');
var path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("./public"));

app.get('/berlinevents', function(req, res){
    db.query('SELECT * FROM links ORDER by created_at DESC').then(function(results) {
        console.log("getLink");
        console.log(results.rows);
        res.json(
            {
                links: results.rows
            });

    }).catch(function(err) {
        console.log(err);
        res.json({
            success: false
        });
    });
});

app.post('/berlinevents/link', function(req, res){
    db.query("INSERT INTO links(link, title) VALUES ($1, $2) RETURNING id",
    [req.body.url, req.body.title])
    .then (function(result) {
        console.log(result + "Risultato Post");
        res.json({
            title: req.body.title,
            link: req.body.url,
            id: result.rows[0].id
        });
    }).catch(function(err) {
        console.log(err);
        res.json({
            success: false
        });
    });
});

app.listen(8080, function(){
    console.log("I'm listening on 8080");
});
