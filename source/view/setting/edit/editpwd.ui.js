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
    app.closePage();
});

var tf_old = ui("tf_old");
var tf_new = ui("tf_new");
var tf_again = ui("tf_again");
var action_ok = ui("action_ok");

var $U = require("url");
var http = mm("do_Http");
http.url = $U.token($U.url.ChangePwd);
http.method = "post";
http.timeout = "60000";
http.contentType = "application/json";
http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    nf.alert("密码修改成功", function(){
        app.closePage();
    });
});

var anim_button = mm("do_Animation", "BUTTONTOUCHDOWN", "app");
action_ok.on("touch", function(){
    page.hideKeyboard();
    var body = {
        PassWord: tf_old.text.trim(),
        NewPassWord: tf_new.text.trim()
    };
    if (body.PassWord == "") return nf.toast("原密码不可为空");
    if (body.NewPassWord == "") return nf.toast("新密码不可为空");
    if (body.NewPassWord == body.PassWord) return nf.toast("新密码不能和原密码一样");
    var newPassWordAgain = tf_again.text.trim();
    if (newPassWordAgain == "") return nf.toast("确认密码不可为空");
    if (newPassWordAgain != body.NewPassWord) return nf.toast("两次密码不一致");
    pbar.visible = true;
    http.body = body;
    http.request();
}).on("touchDown", function(){
    this.animate(anim_button);
});
