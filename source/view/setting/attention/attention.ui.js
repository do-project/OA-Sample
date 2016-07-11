var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var storage = sm("do_Storage");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));
var $U = require("url");
var open = require("open");

page.on("back", function(){
    app.closePage();
});

ui("action_back").on("touch", function(){
    app.closePage();
});

var listview = ui("do_listview");
var listdata = mm("do_ListData");
listview.bindItems(listdata);

var contact = {
    source: "data://AllEmployers.zip",
    target: "data://",
    file: "data://AllEmployers.txt",
    detail: function(id){
        storage.readFile(contact.file, function(data){
            if (typeof data == "string") eval("data = " + data);
            data.forEach(function(v){
                if (id == v[6]) {
                    pbar.visible = false;
                    return open.start("source://view/contact/detail.ui", {
                        pinyinIndex: v[0],
                        itcodeIndex: v[1],
                        pinyin: v[2],
                        itcode: v[3],
                        name: v[4],
                        mobile: v[5],
                        id: v[6],
                        email: v[7],
                        telephone: v[8],
                        dcPosition: v[9],
                        departname: v[10],
                        icon: $U.prefix + v[11],
                        nameP: v[4] + " " + v[2],
                        itcodeP: v[6] + " " + v[3] + " " + v[9]
                    });
                }
            })
        })
    }
};

if (!storage.fileExist(contact.file)) {
    storage.unzip(contact.source, contact.target, function(){
        this.deleteFile(contact.source);
    });
}

var myatt_http = mm("do_Http");
myatt_http.method = "get";
myatt_http.timeout = "60000";
myatt_http.contentType = "application/json";
myatt_http.on("fail", function(data){
    $U.fail(data, pbar, listview);
}).on("success", function(data){
    if (pbar.visible) pbar.visible = false;
    else listview.rebound();
    if (!$U.headCodeCheck(data)) return;
    data = data.body.map(function(v){
        return {
            id: v["attentionEmpId"],
            icon: $U.prefix + v["attentionEmpIcon"],
            nameP: v["attentionEmpName"] + " " + v["attentionEmpPinYin"],
            itcodeP: v["attentionEmpId"] + " " + v["attentionEmpItcode"] + " " + v["attentionEmpDcposition"],
            departname: v["attentionEmpDepartementName"]
        }
    });
    listdata.removeAll();
    listdata.addData(data);
    listview.refreshItems();
    if (data.length == 0) nf.toast("暂无关注");
});

pbar.visible = true;
myatt_http.url = $U.token($U.url.GetAttentionList);
myatt_http.request();

listview.on("touch", function(data){
    pbar.visible = true;
    data = listdata.getOne(data);
    contact.detail(data.id);
}).on("pull", function(data){
    if (data.state != 2) return;
    myatt_http.request();
});

page.on("result", function(data){
    if (!data.work_att) return;
    myatt_http.request();
});