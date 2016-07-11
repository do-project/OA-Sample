var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var imgbrowser = sm("do_ImageBrowser");
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
var label_title = ui("label_title");
label_title.text = pagedata.name;

var listview = ui("do_listview");
var listdata = mm("do_ListData");
listview.bindItems(listdata);
var listcache = sm("do_DataCache");
var chchekey = "cache_work_all";

var work_http = mm("do_Http");
var tokenUrl = $U.token($U.url.GetWorkCircleForEmployer) + "&";
work_http.method = "get";
work_http.timeout = "60000";
work_http.contentType = "application/json";
work_http.on("fail", function(data){
    $U.fail(data, pbar, listview);
}).on("success", function(data){
    if (pbar.visible) pbar.visible = false;
    else listview.rebound();
    if (!$U.headCodeCheck(data)) return;
    data = $U.work_format(data.body);
    listdata.removeAll();
    listdata.addData(data);
    listview.refreshItems();
    listcache.saveData({key: chchekey, value: listdata.getRange(0)});
    if (data.length == 0) nf.toast("暂无内容");
});

var body = {employerId: pagedata.id};
var binddata = function(body){
    work_http.url = tokenUrl + $U.queryString(body);
    work_http.request();
};

var datacache = listcache.loadData({key: chchekey});
if (datacache) {
    listdata.addData(datacache);
    listview.refreshItems();
    binddata(body);
} else {
    pbar.visible = true;
    binddata(body);
}

page.on("imgs-listen", function(data){
    imgbrowser.show(data.s, data.i);
});

listview.on("pull", function(data){
    if (data.state != 2) return;
    binddata(body);
});
