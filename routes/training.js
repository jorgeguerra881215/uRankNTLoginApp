var express = require('express');
var router = express.Router();
const fs = require('fs');
var mongoose = require('mongoose');
var Userlog = require('../models/userlog');


const path = require("path");

var raw_settings = fs.readFileSync(path.resolve(__dirname, '../app_settings.json'));
var settings_json = JSON.parse(raw_settings);

var PREFIX = settings_json['project_path'];

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        //req.flash('error_msg','You are not logged in');
        res.redirect('/users/login');
    }
}

router.ws('/ws', function(ws, req) {
    ws.on('message', function(msg) {
        req_json = JSON.parse(msg)
        console.log(req_json)
        if (req_json.action === "trigger-training") {
            trigger_training_handler(ws, req, req_json);
        } else if (req_json.action === "update-labels") {
            trigger_update_labels_handler(ws, req, req_json);
        } else if (req_json.action === "new-log"){
            trigger_logs(ws, req, req_json)
        }
    });
})

function trigger_logs(ws,req, req_json) {
    send_if_open(ws, 'saving-logs has been triggered')
    console.log('saving logs')
    var data = JSON.parse(req_json.data);
    data.Username = data.Username.replace('// user: ', '');

    var log_tmp = new Userlog({
        username: data["Username"],
        usertoken: data["Usertoken"],
        action: data["Action"],
        datetime: data["Time"],
        sessionID: data["SessionID"]
    });

    console.log(data)

    // save model to database
    log_tmp.save(function (err, log) {
      if (err) return console.error(err);
      console.log("Log at " + log.datetime + " saved to database -logs collection-.");
    });

    //save new log to user logs file
    var logs_file = PREFIX + '/server/user_logs.json';
    var text = JSON.stringify(data)+','+ "\n" //The end of the text is to enter in a new line
    fs.appendFile(logs_file, text, function (err) {
        if (err) return console.error(err);
        console.log("Log saved to local file.");
    });
}

function trigger_training_handler(ws, req, req_json) {
    send_if_open(ws, 'training has been triggered')
    console.log('training has been triggered')
    const spawn = require('child_process').spawn;
    const pyProg = spawn(settings_json['python_prefix'] + 'python3', [PREFIX + '/server/training.py', req_json.token], {
        detatched: true
    });

    pyProg.stdout.on('data', function(data) {
        console.log(data.toString());
    });

    pyProg.on('exit', function(code, signal) {
        console.log('Training exited. (code ' + code + ')');
        //send_if_open(ws, 'Training exited. (code ' + code + ')');
        send_if_open(ws, 'Training exited.');
    })
}

function trigger_update_labels_handler(ws, req, req_json) {
    send_if_open(ws, "updating labels...");
    console.log("updating labels...");
    fs.writeFileSync(PREFIX + "/public/datasets/" + req_json.token + "___TMP___.json", req_json.data);

    const spawn = require('child_process').spawn;
    const pyProg = spawn(settings_json['python_prefix'] + 'python3', [PREFIX + '/server/training.py', req_json.token, '--no-training'], {
        detatched: true
    });

    pyProg.stdout.on('data', function(data) {
        console.log(data.toString());
    });

    pyProg.on('exit', function(code, signal) {
        console.log('Label update exited. (code ' + code + ')');
        send_if_open(ws, 'Label update exited. (code ' + code + ')');
    })
}

function send_if_open(ws, message) {
    if (ws.readyState === 1) { // closed
        ws.send(message)
    }
}

router.get('/get-tmp-dataset', ensureAuthenticated, function(req, res) {
    filepath = PREFIX + "/public/datasets/" + req.user.id + "___TMP___output.json";

    fallback = PREFIX + "/public/datasets/" + settings_json["dataset_path"];

    if (fs.existsSync(filepath)) {
        fs.createReadStream(filepath).pipe(res);
    }
    else {
        fs.createReadStream(fallback).pipe(res);
    }
});

module.exports = router;
