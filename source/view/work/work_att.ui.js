var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 0));
var $U = require("url");

var isMore = false;
var listview = ui("do_listview_att");
var listdata = mm("do_ListData");
listview.bindItems(listdata);
var listcache = sm("do_DataCache");
var chchekey = "cache_work_att";

var work_http = mm("do_Http");
var tokenUrl = $U.token($U.url.GetWorkCircleList) + "&";
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
    if (!isMore) listdata.removeAll();
    listdata.addData(data);
    listview.refreshItems();
    listcache.saveData({key: chchekey, value: listdata.getRange(0)});
    if (data.length == 0) nf.toast("暂无关注");
});

var body = {isAttention: true, page: 1};
var binddata = function(body){
    if (isMore) body.page++;
    else body.page = 1;
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

page.on("result", function(data){
    if (data.work_att || data.work_reply) {
        pbar.visible = true;
        isMore = false;
        binddata(body);
    }
});

listview.on("pull", function(data){
    if (data.state != 2) return;
    isMore = false;
    binddata(body);
}).on("push", function(data, e){
    if (data.state != 2) return;
    isMore = true;
    binddata(body);
});
