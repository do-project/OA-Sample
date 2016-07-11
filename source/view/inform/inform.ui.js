var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));
var $U = require("url");
var open = require("open");

var segmentview = ui("do_segmentview");
var segmentdata = mm("do_ListData");
segmentview.bindItems(segmentdata);

var slideview = ui("do_slideview");
var slidedata = mm("do_ListData");
slideview.bindItems(slidedata);

var type_all = [
    {icon: "source://image/inform@all.png", name: "全部", id: "", fontColor: "E03E3FFF"}
];
var type_http = mm("do_Http");
type_http.url = $U.token($U.url.GetInformationType);
type_http.method = "get";
type_http.timeout = "60000";
type_http.contentType = "application/json";
type_http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    if (pbar.visible) pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    data.body.forEach(function(v, k){
        v.icon = $U.prefix + v.icon;
        v.fontColor = "000000FF";
    });
    type_all = type_all.concat(data.body);
    segmentdata.removeAll();
    segmentdata.addData(type_all);
    segmentview.refreshItems();
    slidedata.removeAll();
    slidedata.addData(type_all);
    slideview.refreshItems();
});
pbar.visible = true;
type_http.request();

segmentview.on("indexChanged", function(index){
    slideview.set({index: index});
});

slideview.on("indexChanged", function(index){
    type_all.forEach(function(v, k){
        if (k == index) v.fontColor = "E03E3FFF";
        else v.fontColor = "000000FF";
    });
    segmentdata.removeAll();
    segmentdata.addData(type_all);
    segmentview.refreshItems();
    segmentview.set({index: index});
});

page.on("result", function(data){
    if (!data.inform_select) return;
    slideview.set({index: data.index});
});

ui("action_select").on("touch", function(){
    open.start("source://view/inform/select.ui", type_all);
});
