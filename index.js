var express = require('express');
var app = express();
var multer = require('multer');
var spicedPg = require('spiced-pg');
var db = spicedPg('postgres:shirintaghavi:password@localhost:5432/photos');
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

app.get('/berlinevents', function(res, req){
    db.query('SELECT * FROM berlin-evets ORDER by created_at DESC LIMIT 10 OFFSET $1',
    [req.query.offset || 0]).then(function(results) {
        console.log("getLink");
        console.log(results.rows);
        res.json(
            {
                links: results.rows
            });

    });
});

app.post('/berlinevents/link', function(res, req){
    db.query("INSERT INTO links(link, title) VALUES ($1, $2) RETURNING id",
    [req.body.url, req.body.title])
    .then (function(result) {
        res.json({
            title: req.body.titel,
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
