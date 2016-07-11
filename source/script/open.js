var deviceone = require("deviceone");
var app = deviceone.sm("do_App");

module.exports.start = function(source, data){
    var option = {source: source};
    if (data) option.data = data;
    option.statusBarFgColor = "white";
    option.statusBarBgColor = "e03e3f";
    app.openPage(option);
};
