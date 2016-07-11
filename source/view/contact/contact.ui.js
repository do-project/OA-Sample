var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var storage = sm("do_Storage");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));
var $U = require("url");
var open = require("open");
var action_sync = ui("action_sync");

var listview = ui("do_listview");
var listdata = mm("do_ListData");
listview.bindItems(listdata);

var alldata, searchdata;
var contact = {
    source: "data://AllEmployers.zip",
    target: "data://",
    file: "data://AllEmployers.txt",
    start: 0, end: 0, size: 50,
    init: function(){
        alldata = [];
        storage.readFile(contact.file, function(data){
            if (typeof data == "string") eval("data = " + data);
            data.forEach(function(v){
                alldata.push({
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
                })
            });
            searchdata = alldata;
            contact.bind(false);
        })
    },
    bind: function(isMore){
        if (isMore) {
            contact.start += contact.size;
            contact.end += contact.size;
        } else {
            contact.start = 0;
            contact.end = contact.size;
            listdata.removeAll();
        }
        contact.end = contact.end > searchdata.length ? undefined : contact.end;
        listdata.addData(searchdata.slice(contact.start, contact.end));
        if (pbar.visible) {
            pbar.visible = false;
            keyboard.visible = true;
        } else listview.rebound();
        listview.refreshItems();
    },
    search: function(text){
        if (text) {
            img_del.source = "source://image/contact@delete.png";
            lb_text_0.text = text;
            lb_text_0.fontColor = "000000FF";
            lb_text_1.text = text;
            lb_text_1.fontColor = "000000FF";
        } else {
            img_del.source = "source://image/contact@search.png";
            lb_text_0.text = "搜索ID、员工编号和姓名的拼音码";
            lb_text_0.fontColor = "999999FF";
            lb_text_1.text = "索引键盘→";
            lb_text_1.fontColor = "666666FF";
        }
        contact.start = 0;
        contact.end = contact.size;
        searchdata = [];
        alldata.forEach(function(v){
            var pinyin = v.pinyinIndex.substr(0, text.length);
            var itcode = v.itcodeIndex.substr(0, text.length);
            var id = v.id.length >= text.length && v.id.substr(v.id.length - text.length) == text;
            if (text == pinyin || text == itcode || id) {
                searchdata.push(v);
            }
        });
        listdata.removeAll();
        listdata.addData(searchdata.slice(contact.start, contact.end));
        listview.refreshItems();
    },
    time: "data://security/sync.time",
    download: function(){
        var download_http = mm("do_Http");
        download_http.url = action_sync.url;
        download_http.on("fail", function(data){
            $U.fail(data, pbar);
        }).on("success", function(data){
            pbar.visible = false;
        }).on("progress", function(data){
            if (data.currentSize == data.totalSize) {
                nf.alert("同步成功");
                storage.unzip(contact.source, contact.target, function(){
                    this.deleteFile(contact.source);
                    contact.init();
                    action_sync.visible = false;
                    storage.writeFile(contact.time, action_sync.time);
                })
            }
        });
        nf.confirm("是否同步最新通讯录？", function(state){
            if (state != 1) return;
            pbar.visible = true;
            download_http.download(contact.source);
        })
    },
    check: function(){
        var check_http = mm("do_Http");
        check_http.url = $U.token($U.url.CheckTimeForAllEmployerJson);
        check_http.method = "get";
        check_http.timeout = "60000";
        check_http.contentType = "application/json";
        check_http.on("fail", function(data){
            $U.fail(data, {});
        }).on("success", function(data){
            if (!$U.headCodeCheck(data)) return;
            action_sync.time = data.body.allEmployerJsonChangeTime;
            action_sync.url = $U.prefix + data.body.allEmployerJsonPath;
            if (storage.fileExist(contact.time)) {
                storage.readFile(contact.time, function(localTime){
                    if (action_sync.time != localTime) {
                        action_sync.visible = true;
                    }
                })
            } else {
                action_sync.visible = true;
            }
        });
        check_http.request();
    }
};

contact.check();
pbar.visible = true;
if (storage.fileExist(contact.file)) {
    contact.init();
} else {
    storage.unzip(contact.source, contact.target, function(){
        this.deleteFile(contact.source);
        contact.init();
    });
}

var keyboard = ui("keyboard");
var lb_text_0 = ui("lb_text_0");
var lb_text_1 = ui("lb_text_1");
var img_del = ui("img_del");
var action_del = ui("action_del");
var img_switch = ui("img_switch");
var action_switch = ui("action_switch");
var action_aly, action_lb, c_text = "";

keyboard.on("touch", function(){
    return false;
});

for (var t = 0; t < 10; t++) {
    action_aly = ui("action_" + t);
    action_lb = ui("label_" + t);
    action_aly.tag = action_lb.text;
    action_aly.on("touch", function(){
        c_text += this.tag;
        contact.search(c_text);
    }).on("touchDown", function(){
        this.bgColor = "FFFFFFFF";
    }).on("touchUp", function(){
        this.bgColor = "00000000";
    });
}

action_del.on("touch", function(){
    if (c_text == "") return;
    c_text = c_text.substring(0, c_text.length - 1);
    contact.search(c_text);
});

action_switch.on("touch", function(){
    var vis = keyboard.visible;
    keyboard.visible = vis ? false : true;
    img_switch.source = "source://image/contact@switch_" + (vis ? "up" : "down") + ".png";
});

listview.on("touch", function(data){
    data = listdata.getOne(data);
    open.start("source://view/contact/detail.ui", data);
}).on("pull", function(data){
    if (data.state != 2) return;
    contact.bind(false);
    contact.check();
}).on("push", function(data, e){
    if (data.state != 2) return;
    if (contact.end) {
        contact.bind(true);
    } else {
        this.rebound();
        nf.toast("没有更多了");
    }
});

action_sync.on("touch", contact.download);