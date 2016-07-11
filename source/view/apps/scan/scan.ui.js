var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var open = require("open");

page.on("back", function(){
    app.closePage();
});

ui("action_back").on("touch", function(){
    app.closePage();
});

var action_start = ui("action_start");
var barc_scan = ui("barc_scan");
var barc_result = "什么都没有扫到，请重新尝试";

var delay1 = mm("do_Timer");
delay1.delay = 0;
delay1.interval = 1000;
delay1.duration = 1;
delay1.on("tick", function(){
    if (this.duration <= 0) {
        this.stop();
        open.start("source://view/apps/scan/url.ui", barc_result);
    }
    this.duration--;
});

barc_scan.start(function(data){
    if (!data.value) return;
    barc_result = data.value;
    delay1.start();
});