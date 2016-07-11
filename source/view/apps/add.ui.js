var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));

page.on("back", function(data){
    app.closePage(data);
});

ui("action_back").on("touch", function(){
    app.closePage();
});

var action_ok = ui("action_ok");
var add_name = ui("add_name");
var add_url = ui("add_url");

var $U = require("url");
var add_http = mm("do_Http");
add_http.url = $U.token($U.url.AddApplication);
add_http.method = "post";
add_http.timeout = "60000";
add_http.contentType = "application/json";
add_http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    nf.toast("添加成功");
    page.fire("back", {apps_add: true});
});

var verify = require("verify");
action_ok.on("touch", function(){
    page.hideKeyboard();
    var body = {
        Name: add_name.text.trim(),
        Url: add_url.text.trim()
    };
    if (body.Name == "") return nf.toast("应用名称不可为空");
    var cell = [body.Url, "!:http", "应用网址不可为空:请输入正确的网址"];
    var ver = verify.run(cell);
    if (!ver[0]) return nf.toast(ver[1]);
    pbar.visible = true;
    add_http.body = body;
    add_http.request();
});
