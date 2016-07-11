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

var pagedata = page.getData();
var userInfo = global.getMemory("userInfo");

var isMore = false;
var listview = ui("do_listview");
var listdata = mm("do_ListData");
listview.bindItems(listdata);
var listcache = sm("do_DataCache");
var cachekey = "cache_inform_comment";

var comment_http = mm("do_Http");
var tokenUrl = $U.token($U.url.GetInforCommentList) + "&";
comment_http.method = "get";
comment_http.timeout = "60000";
comment_http.contentType = "application/json";
comment_http.on("fail", function(data){
    $U.fail(data, pbar, listview);
}).on("success", function(data){
    if (pbar.visible) pbar.visible = false;
    else listview.rebound();
    if (!$U.headCodeCheck(data)) return;
    data = data.body.map(function(v){
        v.createTime = $U.time_format(v.createTime);
        v.icon = $U.prefix + v.icon;
        return v;
    });
    if (!isMore) listdata.removeAll();
    listdata.addData(data);
    listview.refreshItems();
    listcache.saveData({key: cachekey, value: listdata.getRange(0)});
    if (data.length == 0) nf.toast("暂无评论");
});

var body = {inforId: pagedata.id, page: 1};
var binddata = function(body){
    if (isMore) body.page++;
    else body.page = 1;
    comment_http.url = tokenUrl + $U.queryString(body);
    comment_http.request();
};

var datacache = listcache.loadData({key: cachekey});
if (datacache) {
    listdata.addData(datacache);
    listview.refreshItems();
    binddata(body);
} else {
    pbar.visible = true;
    binddata(body);
}

listview.on("pull", function(data){
    if (data.state != 2) return;
    isMore = false;
    binddata(body);
}).on("push", function(data, e){
    if (data.state != 2) return;
    isMore = true;
    binddata(body);
});

var add_http = mm("do_Http");
add_http.url = $U.token($U.url.AddInforComment);
add_http.method = "post";
add_http.timeout = "60000";
add_http.contentType = "application/json";
add_http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    if (!$U.headCodeCheck(data)) return;
    tf_comment.text = "";
    nf.toast("评论成功");
    isMore = false;
    binddata(body);
});

var action_ok = ui("action_ok");
var tf_comment = ui("tf_comment");
action_ok.on("touch", function(){
    page.hideKeyboard();
    var body = {
        InformationId: pagedata.id,
        ReplayEmpId: userInfo.id,
        Message: tf_comment.text.trim()
    };
    if (body.Message == "") return nf.toast("请输入评论内容");
    pbar.visible = true;
    add_http.body = body;
    add_http.request();
});
