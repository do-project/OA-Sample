var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var camera = sm("do_Camera");
var album = sm("do_Album");
var device = sm("do_Device");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));
var menuor = ui(rootview.add("menuor", "source://view/kit/menu.ui", 0, 0));
var share = ui(rootview.add("share", "source://view/kit/share.ui", 0, 0));
var $U = require("url");
var open = require("open");
var upgrade = require("upgrade");

page.on("back", function(){
    app.closePage();
});

ui("action_back").on("touch", function(){
    app.closePage();
});

var userInfo = global.getMemory("userInfo");
var user_avatar = ui("user_avatar");
var user_name = ui("user_name");
var user_itcode = ui("user_itcode");
var action_info = ui("action_info");
user_avatar.source = userInfo.icon;
user_itcode.text = userInfo.itcode + " " + userInfo.name;
user_name.text = "工号：" + userInfo.employerNumber;

var hupload = mm("do_Http");
hupload.url = $U.token($U.url.UploadIImageForEmpIcon);
hupload.method = "post";
hupload.contentType = "multipart/form-data";
hupload.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    nf.alert("头像修改成功", function(){
        user_avatar.source = "source://image/user@avatar.png";
        user_avatar.source = userInfo.icon;
    });
});

action_info.on("touch", function(){
    menuor.visible = true;
});

page.on("menu-listen", function(data){
    menuor.visible = false;
    if (data.state == 1) {
        camera.capture({
            width: 120,
            height: -1,
            quality: 100
        }, function(data){
            pbar.visible = true;
            hupload.upload(data);
        });
    } else if (data.state == 2) {
        album.select({
            maxCount: 1,
            width: 120,
            height: -1,
            quality: 100
        }, function(datas){
            if (!datas[0]) return;
            pbar.visible = true;
            hupload.upload(datas[0]);
        });
    }
});

var action_edit = ui("action_edit");
var action_about = ui("action_about");
var action_feedback = ui("action_feedback");
var action_mypay = ui("action_mypay");
var action_share = ui("action_share");
var lb_version = ui("lb_version");
var action_upgrade = ui("action_upgrade");
var action_push = ui("action_push");
var switch_push = ui("switch_push");
var action_logoff = ui("action_logoff");

var action_alys = [
    action_edit,
    action_about,
    action_feedback,
    action_mypay,
    action_share,
    action_upgrade,
    action_logoff
];
var anim_button = mm("do_Animation", "BUTTONTOUCHDOWN", "app");
for (var i = 0; i < action_alys.length; i++) {
    action_alys[i].on("touchDown", function(){
        this.animate(anim_button);
    })
}

action_edit.on("touch", function(){
//    open.start("source://view/setting/edit/editpwd.ui");
});

action_about.on("touch", function(){
    open.start("source://view/setting/about/about.ui");
});

action_feedback.on("touch", function(){
    open.start("source://view/setting/feedback/feedback.ui");
});

action_mypay.on("touch", function(){
    open.start("source://view/setting/attention/attention.ui");
});

action_share.on("touch", function(){
    share.visible = true;
});

var qq = sm("do_TencentQQ");
var wb = sm("do_SinaWeiBo");
var wx = sm("do_TencentWX");
var key = {
    qq: "1104684313",
    wb: "2188698262",
    wx: "wxba6c0c3cf39df3eb",

    title: "DC协同",
    url: "http://oa.dcdmt.cn/Files/Version/Html/DowonloadHtml.html",
    image: "source://image/logo.png",
    summary: "欢迎使用DeviceOne！",
    success: "分享成功",
    fail: "分享失败"
};

var shareTo = function(id){
    switch (id) {
        case "qq":
            qq.shareToQQ({
                appId: key.qq,
                type: 0,
                title: key.title,
                url: key.url,
                image: key.image,
                summary: key.summary
            }, function(data){
                if (data) nf.toast(key.success);
            });
            break;
        case "qzone":
            qq.shareToQzone({
                appId: key.qq,
                type: 0,
                title: key.title,
                url: key.url,
                image: key.image,
                summary: key.summary
            }, function(data){
                if (data) nf.toast(key.success);
            });
            break;
        case "wx":
            wx.share({
                appId: key.wx,
                scene: 1,
                type: 0,
                title: key.title,
                content: key.summary,
                url: key.url,
                image: key.image
            }, function(data){
                if (data) nf.toast(key.success);
            });
            break;
        case "wb":
            wb.share({
                appID: key.wb,
                type: 0,
                title: key.title,
                image: key.image,
                url: key.url,
                summary: key.summary
            }, function(data){
                if (data) nf.toast(key.success);
            });
            break;
        case "copy":
            global.setToPasteboard(key.url);
            nf.toast("复制成功");
            break;
        default :
            nf.toast(key.fail);
    }
};

page.on("share-listen", shareTo);

lb_version.text = "v." + global.getVersion().ver;
action_upgrade.on("touch", function(){
    if (huanxin) upgrade.request(pbar);
    else nf.alert("此系统暂不支持版本更新");
});

var deviceOS = device.getInfo().OS;
deviceOS = deviceOS == "android" || deviceOS.indexOf("iPhone") > -1;

var huanxin = deviceOS ? sm("do_HuanXinIM") : false;

var func_logoff = function(){
    global.setMemory("userInfo", "");
    global.setMemory("access_token", "");
    if (huanxin) huanxin.logout();
    app.closePage().closePage();
};

var http_logoff = mm("do_Http");
http_logoff.url = $U.token($U.url.LogOff);
http_logoff.method = "post";
http_logoff.timeout = "60000";
http_logoff.contentType = "application/json";
http_logoff.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    func_logoff();
});

action_logoff.on("touch", function(){
    nf.confirm("退出登录?", function(state){
        if (state != 1) return;
//        pbar.visible = true;
//        http_logoff.request();
        func_logoff();
    })
});
