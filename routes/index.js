var express = require('express');
var router = express.Router();
const fs = require('fs');

const path = require("path");

var raw_settings = fs.readFileSync(path.resolve(__dirname, '../app_settings.json'));
var settings_json = JSON.parse(raw_settings);

//Get Homepage
router.get('/',ensureAuthenticated,function(req, res){
    var sessionId = req.sessionID;
   res.render('index',{'sessionId':sessionId, 'typeOfRepresentation': settings_json['visualization']});
});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        //req.flash('error_msg','You are not logged in');
        res.redirect('/users/login');
    }
}

module.exports = router;
