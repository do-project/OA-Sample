var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var external = sm("do_External");
var device = sm("do_Device");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));
var $U = require("url");

var isChanged = false;

page.on("back", function(){
    app.closePage({work_att: isChanged});
});

ui("action_back").on("touch", function(){
    page.fire("back");
});

var scroll_detail = ui("scroll_detail");
var pagedata = page.getData();
pagedata["nameAndItcode"] = pagedata.name + " " + pagedata.itcode;
pagedata["number"] = (pagedata.mobile || pagedata.telephone) || "无号码";
var hashdata = mm("do_HashData");
rootview.bindData(hashdata, {
    "label_title.text": "name",
    "nameAndItcode.text": "nameAndItcode",
    "number.text": "number",
    "employerId.text": "id",
    "email.text": "email",
    "telephone.text": "telephone",
    "dcPosition.text": "dcPosition",
    "departname.text": "departname",
    "icon.source": "icon"
});
hashdata.addData(pagedata);
rootview.refreshData();
scroll_detail.redraw();

var action_att = ui("action_att");
var label_att = ui("label_att");
var att_body = {attentionEmpId: pagedata.itcode};

var isAtt_http = mm("do_Http");
isAtt_http.url = $U.token($U.url.IsAttention) + "&" + $U.queryString(att_body);
isAtt_http.method = "get";
isAtt_http.timeout = "60000";
isAtt_http.contentType = "application/json";
isAtt_http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    label_att.text = data.body ? "取消关注" : "关注";
});

var userInfo = global.getMemory("userInfo");
if (userInfo.itcode == pagedata.itcode) {
    action_att.visible = false;
} else {
    pbar.visible = true;
    isAtt_http.request();
}

var add_http = mm("do_Http");
add_http.url = $U.token($U.url.AddAttention);
add_http.body = att_body;
add_http.method = "post";
add_http.timeout = "60000";
add_http.contentType = "application/json";
add_http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    label_att.text = "取消关注";
    nf.toast("关注成功");
    isChanged = true;
});

var delete_http = mm("do_Http");
delete_http.url = $U.token($U.url.DeleteAttention);
delete_http.body = att_body;
delete_http.method = "post";
delete_http.timeout = "60000";
delete_http.contentType = "application/json";
delete_http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    label_att.text = "关注";
    nf.toast("取消关注成功");
    isChanged = true;
});

action_att.on("touch", function(){
    pbar.visible = true;
    switch (label_att.text) {
        case "关注":
            add_http.request();
            break;
        case "取消关注":
            delete_http.request();
            break;
        default:
            return;
    }
});

var action_call = ui("action_call");
var action_msg = ui("action_msg");

action_call.on("touch", function(){
    if (pagedata.number == "无号码") nf.toast("无登记号码");
    else external.openDial({number: pagedata.number});
});

var deviceOS = device.getInfo().OS;
deviceOS = deviceOS == "android" || deviceOS.indexOf("iPhone") > -1;

var huanxin = deviceOS ? sm("do_HuanXinIM") : false;
var sqlite3 = mm("do_SQLite");

sqlite3.open("data://oa.db");
sqlite3.insert = "INSERT OR REPLACE INTO chat(username,userlogo,nickname,lastmsg,time,ref) VALUES ('{{username}}', '{{userlogo}}', '{{nickname}}', '',(datetime('now','localtime')), '{{ref}}');".replace("{{ref}}", userInfo.itcode);

action_msg.on("touch", function(){
    if (!huanxin) return nf.alert("此系统暂不支持即时消息");
    if (pagedata.name == userInfo.name) return nf.toast("不能与自己交谈");
    sqlite3.executeSync(sqlite3.insert
            .replace("{{username}}", pagedata.itcode)
            .replace("{{userlogo}}", pagedata.icon)
            .replace("{{nickname}}", pagedata.name)
    );
    huanxin.enterChat({
        userID: pagedata.itcode,
        userNick: pagedata.name,
        userIcon: pagedata.icon,
        selfNick: userInfo.name,
        selfIcon: userInfo.icon,
        tag: pagedata.itcode
    });
    app.fire("huanxin-r-listen");
});
