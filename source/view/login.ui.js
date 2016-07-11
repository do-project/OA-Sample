var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var device = sm("do_Device");
var storage = sm("do_Storage");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));
var $U = require("url");
var upgrade = require("upgrade");
var open = require("open");

page.on("back", function(){
    nf.confirm("确定退出应用吗？", function(state){
        if (state != 1) return;
        global.exit();
    });
}).on("result", function(data){
    if (data.login_reg) {
        tf_id.text = data.itcode;
        tf_password.text = data.pwd;
        action_login.fire("touch");
    } else {
        tf_password.text = "";
    }
});

var tf_id = ui("tf_id");
var tf_password = ui("tf_password");
var action_login = ui("action_login");
var action_reg = ui("action_reg");
var action_forget = ui("action_forget");
var action_remember = ui("action_remember");
var img_remember = ui("img_remember");
var remember_imgs = [
    "source://image/login@remember0.png",
    "source://image/login@remember1.png"
];
var login_file = "data://security/login";

var user_http = mm("do_Http");
user_http.method = "get";
user_http.timeout = "60000";
user_http.contentType = "application/json";
user_http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    data.body.icon = $U.prefix + data.body.icon;
    global.setMemory("userInfo", data.body);
    open.start("source://view/index.ui");
});

var login_success = function(access_token){
    pbar.visible = true;
    var img_source = img_remember.source;
    var login_body = {
        itcode: tf_id.text.trim(),
        pwd: img_source == remember_imgs[1] ? tf_password.text.trim() : "",
        remember: img_source
    };
    storage.writeFile(login_file, login_body);
    deviceone.print("access_token : "+ access_token);
    global.setMemory("access_token", access_token);
    var itcode = login_body.itcode.toLowerCase();
    if (huanxin) {
        huanxin.login(itcode, itcode, function(data){
            pbar.visible = false;
            if (data.state == 0) {
                pbar.visible = true;
                user_http.url = $U.token($U.url.GetEmployerDetail);
                user_http.request();
            } else nf.alert("登录失败，请重试");
        });
    } else {
        user_http.url = $U.token($U.url.GetEmployerDetail);
        user_http.request();
    }
};

var login_http = mm("do_Http");
login_http.method = "get";
login_http.timeout = "60000";
login_http.contentType = "application/json";
login_http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    login_success(data.body.access_token);
});

if (storage.fileExist(login_file)) {
    storage.readFile(login_file, function(data){
        if (typeof data == "object") {
            tf_id.text = data.itcode;
            tf_password.text = data.pwd;
            img_remember.source = data.remember;
        }
    });
}

var anim_button = mm("do_Animation", "BUTTONTOUCHDOWN", "app");
action_login.on("touch", function(){
    page.hideKeyboard();
    var itcode = tf_id.text.toLowerCase().trim();
    if (itcode == "") return nf.toast("帐号不可为空");
    var pwd = tf_password.text.trim();
    if (pwd == "") return nf.toast("密码不可为空");
    pbar.visible = true;
//    login_http.url = $U.url.GetToken + "?" + $U.queryString({itcode: itcode, pwd: pwd});
    login_http.url = $U.url.GetToken + "?itcode=admin&pwd=893391";
    login_http.request();
}).on("touchDown", function(){
    this.animate(anim_button);
});

action_reg.on("touch", function(){
    open.start("source://view/reg.ui");
}).on("touchDown", function(){
    this.animate(anim_button);
});

action_forget.on("touch", function(){
    open.start("source://view/forget.ui");
}).on("touchDown", function(){
    this.animate(anim_button);
});

action_remember.on("touch", function(){
    img_remember.source = img_remember.source == remember_imgs[0] ? remember_imgs[1] : remember_imgs[0];
});

var deviceOS = device.getInfo().OS;
deviceOS = deviceOS == "android" || deviceOS.indexOf("iPhone") > -1;

var huanxin = deviceOS ? sm("do_HuanXinIM") : false;
var sqlite3 = mm("do_SQLite");

sqlite3.open("data://oa.db");
sqlite3.insert = "INSERT OR REPLACE INTO chat(username,userlogo,nickname,lastmsg,time,ref,status) VALUES ('{{username}}','{{userlogo}}','{{nickname}}','{{lastmsg}}',(datetime({{time}},'unixepoch','localtime')),'{{ref}}',{{status}});";

if (huanxin) {
    huanxin.on("chatStatusChanged", function(data){
        this.status = data;
    });

    huanxin.on("receive", function(data){
        device.beep();
        data.time = data.time / 1000;
        var status = this.status == 1 ? 0 : "ifnull((SELECT status FROM chat WHERE username='{{username}}' AND ref='{{ref}}'),0) + 1";
        sqlite3.executeSync(sqlite3.insert
                .replace("{{nickname}}", data["nick"])
                .replace("{{lastmsg}}", data["message"])
                .replace("{{time}}", data["time"])
                .replace("{{userlogo}}", data["icon"])
                .replace("{{status}}", status)
                .replace(/\{\{username\}\}/g, data["from"])
                .replace(/\{\{ref\}\}/g, data["tag"])
        );
        app.fire("huanxin-r-listen");
    });

//    upgrade.request();
}
