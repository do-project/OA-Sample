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

var action_save = ui("action_save");
var action_text = ui("action_text");
var action_photo = ui("action_photo");
var action_audio = ui("action_audio");

action_save.on("touch", function(){
    page.hideKeyboard();
    nf.alert("保存")
});

action_text.on("touch", function(){
    nf.alert("文本")
});

action_photo.on("touch", function(){
    nf.alert("照片")
});

action_audio.on("touch", function(){
    nf.alert("音频")
});
