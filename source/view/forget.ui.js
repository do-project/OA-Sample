var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));

page.on("back", function(){
    app.closePage();
});

ui("action_back").on("touch", function(){
    page.hideKeyboard();
    app.closePage();
});

var tf_id = ui("tf_id");
var action_ok = ui("action_ok");

var $U = require("url");
var forget_http = mm("do_Http");
forget_http.method = "get";
forget_http.timeout = "60000";
forget_http.contentType = "application/json";
forget_http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    nf.alert("密码已经发送到您的公司邮箱，请注意查收~", function(){
        app.closePage();
    });
});

var anim_button = mm("do_Animation", "BUTTONTOUCHDOWN", "app");
action_ok.on("touch", function(){
    page.hideKeyboard();
    var itcode = tf_id.text.trim();
    if (itcode == "") return nf.toast("ID不可为空");
    pbar.visible = true;
    forget_http.url = $U.url.ResetPwd + "?" + $U.queryString({itcode: itcode});
    forget_http.request();
}).on("touchDown", function(){
    this.animate(anim_button);
});
