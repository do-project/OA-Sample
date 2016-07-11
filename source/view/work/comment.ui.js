var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));
var $U = require("url");

page.on("back", function(data){
    app.closePage(data);
});

ui("action_back").on("touch", function(){
    app.closePage();
});

var pagedata = page.getData();
var userInfo = global.getMemory("userInfo");

var add_http = mm("do_Http");
add_http.url = $U.token($U.url.AddWorkCircleComment);
add_http.method = "post";
add_http.timeout = "60000";
add_http.contentType = "application/json";
add_http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    nf.toast("评论成功");
    page.fire("back", {work_reply: true})
});

var action_ok = ui("action_ok");
var tf_comment = ui("tf_comment");
action_ok.on("touch", function(){
    page.hideKeyboard();
    var body = {
        WorkCircleId: pagedata.id,
        ReplayEmpId: userInfo.id,
        Message: tf_comment.text.trim()
    };
    if (body.Message == "") return nf.toast("请输入评论内容");
    pbar.visible = true;
    add_http.body = body;
    add_http.request();
});
