//["{\"SessionID\":\"Ik3VOGITQMwvsxLTWu-LfDU3RtG6f9Tq\",\"Username\":\"// user: jorch\",\"Usertoken\":\"ljjljsykcqwoecdi\",\"Time\":\"2019-12-2_15.58.8\",\"Action\":\"Connection(Unlabelled)7961\"}",
var mongoose = require('mongoose');

var UserlogSchema = mongoose.Schema({
    username:{
        type: String,
    },
    usertoken:{
        type: String
    },
    action:{
        type:String
    },
    datetime:{
        type:String
    },
    sessionID:{
        type:String
    }
});

var Userlog = module.exports = mongoose.model('Userlog', UserlogSchema);
