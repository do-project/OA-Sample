var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var external = sm("do_External");

page.on("back", function(){
    app.closePage();
});

ui("action_back").on("touch", function(){
    app.closePage();
});

var data_url = page.getData();
var scan_url = ui("scan_url");
var action_open = ui("action_open");

scan_url.text = data_url;
action_open.on("touch", function(){
    external.openURL(data_url);
});
