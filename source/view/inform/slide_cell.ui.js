var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, -50));
var $U = require("url");
var open = require("open");

rootview.setMapping({
    "tag": "id"
});

var isMore = false;
var listview = ui("do_listview");
var listdata = mm("do_ListData");
listview.bindItems(listdata);
var listcache = sm("do_DataCache");
var cachekey = "cache_inform";

var inform_http = mm("do_Http");
var tokenUrl = $U.token($U.url.GetInformationList) + "&";
inform_http.method = "get";
inform_http.timeout = "60000";
inform_http.contentType = "application/json";
inform_http.on("fail", function(data){
    $U.fail(data, pbar, listview);
}).on("success", function(data){
    if (pbar.visible) pbar.visible = false;
    else listview.rebound();
    if (!$U.headCodeCheck(data)) return;
    data = $U.inform_format(data.body);
    if (!isMore) listdata.removeAll();
    listdata.addData(data);
    listview.refreshItems();
    listcache.saveData({key: cachekey + body.typeId, value: listdata.getRange(0)});
});

var body = {typeId: "", page: 1};
var binddata = function(body){
    if (isMore) body.page++;
    else body.page = 1;
    inform_http.url = tokenUrl + $U.queryString(body);
    inform_http.request();
};

rootview.on("dataRefreshed", function(){
    body.typeId = rootview.tag;
    var datacache = listcache.loadData({key: cachekey + body.typeId});
    if (datacache) {
        listdata.removeAll();
        listdata.addData(datacache);
        listview.refreshItems();
    } else {
        pbar.visible = true;
    }
    binddata(body);
});

listview.on("touch", function(data){
    data = listdata.getOne(data);
    if (data.template == 3) return;
    open.start("source://view/inform/detail.ui", data);
}).on("pull", function(data){
    if (data.state != 2) return;
    isMore = false;
    binddata(body);
}).on("push", function(data){
    if (data.state != 2) return;
    isMore = true;
    binddata(body);
});
