var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var external = sm("do_External");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));
var $U = require("url");
var open = require("open");

var action_ok = ui("action_ok");
var action_refresh = ui("action_refresh");
var gridview = ui("do_gridview");
var listdata = mm("do_ListData");
gridview.bindItems(listdata);
var listcache = sm("do_DataCache");
var cachekey = "cache_apps";

var template0 = [
    {template: 0, name: "设置", icon: "source://image/apps@setting.png"},
    {template: 0, name: "扫一扫", icon: "source://image/apps@scan.png"},
    {template: 0, name: "添加", icon: "source://image/apps@add.png"}
], isLong = false, isRefresh = false;

var apps_http = mm("do_Http");
apps_http.url = $U.token($U.url.GetApplicationList);
apps_http.method = "get";
apps_http.timeout = "60000";
apps_http.contentType = "application/json";
apps_http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    data.body.forEach(function(v){
        v.template = 1;
        v.icon = $U.prefix + v.icon;
    });
    data = data.body.concat(template0);
    listdata.removeAll();
    listdata.addData(data);
    gridview.refreshItems();
    listcache.saveData({key: cachekey, value: listdata.getRange(0)});
    if (isRefresh) nf.toast("刷新成功");
});

var datacache = listcache.loadData({key: cachekey});
if (datacache) {
    listdata.addData(datacache);
    gridview.refreshItems();
    apps_http.request();
} else {
    pbar.visible = true;
    apps_http.request();
}

gridview.on("touch", function(data){
    data = listdata.getOne(data);
    if (data.template == 0) {
        if (isLong) gridview.fire("longTouch");
        if (data.name == "设置")
            open.start("source://view/setting/setting.ui");
        else if (data.name == "扫一扫")
            open.start("source://view/apps/scan/scan.ui");
        else if (data.name == "备忘录")
            open.start("source://view/apps/memo/memo.ui");
        else if (data.name == "添加")
            open.start("source://view/apps/add.ui");
    } else {
        if (data.type == "Web")
            open.start("source://view/apps/detail.ui", data);
        else if (data.type == "Native")
            external.openURL(data.url);
        else if (data.type == "Middleware")
            nf.alert(data);
    }
}).on("longTouch", function(){
    isLong = !isLong;
    var arr = [], len = listdata.getCount();
    for (var i = 0; i < len; i++) arr.push(i);
    var adddata = listdata.getData(arr);
    adddata.forEach(function(v){
        if (v.applicationType == "1") v.template = isLong ? 2 : 1;
    });
    listdata.removeAll();
    listdata.addData(adddata);
    gridview.refreshItems();
    action_ok.visible = isLong;
});

action_ok.on("touch", function(){
    gridview.fire("longTouch");
});

var delete_http = mm("do_Http");
delete_http.url = $U.token($U.url.DeleteApplication);
delete_http.method = "post";
delete_http.timeout = "60000";
delete_http.contentType = "application/json";
delete_http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    nf.toast("删除成功");
    var arr = [], len = listdata.getCount();
    for (var i = 0; i < len; i++) arr.push(i);
    var adddata = listdata.getData(arr);
    var appid = JSON.parse(delete_http.body).Id;
    adddata.forEach(function(v, k){
        if (v.id == appid) adddata.splice(k, 1);
    });
    listdata.removeAll();
    listdata.addData(adddata);
    gridview.refreshItems();
});

page.on("delete-listen", function(data){
    pbar.visible = true;
    delete_http.body = {Id: data};
    delete_http.request();
});

page.on("result", function(data){
    if (!data.apps_add) return;
    isRefresh = false;
    pbar.visible = true;
    apps_http.request();
});

action_refresh.on("touch", function(){
    isRefresh = true;
    pbar.visible = true;
    apps_http.request();
});
