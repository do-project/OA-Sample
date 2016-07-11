var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));
var $U = require("url");

page.on("back", function(){
    app.closePage();
});

ui("action_back").on("touch", function(){
    app.closePage();
});

var action_ok = ui("action_ok");
var tb_content = ui("tb_content");

var http = mm("do_Http");
http.url = $U.token($U.url.AddSuggestion);
http.method = "post";
http.timeout = 60000;
http.contentType = "application/json";
http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    nf.alert("您的意见已提交后台，后续我们会有专人进行处理，谢谢！", function(){
        app.closePage();
    });
});

action_ok.on("touch", function(){
    page.hideKeyboard();
    var body = {Message: tb_content.text.trim()};
    if (body.Message == "") return nf.toast("内容不可为空");
    pbar.visible = true;
    http.body = body;
    http.request();
});