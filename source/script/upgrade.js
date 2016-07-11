var deviceone = require("deviceone");
var global = deviceone.sm("do_Global");
var nf = deviceone.sm("do_Notification");
var device = deviceone.sm("do_Device");
var external = deviceone.sm("do_External");
var $U = require("url");

var os = device.getInfo().OS == "android" ? 1 : 0;
var version = global.getVersion().ver;

var request = function(pbar){
    var http = deviceone.mm("do_Http");
    http.url = $U.url.GetLastVersion + "?" + $U.queryString({type: os});
    http.method = "get";
    http.timeout = "60000";
    http.contentType = "application/json";
    http.on("fail", function(data){
        if (pbar) $U.fail(data, pbar);
    }).on("success", function(data){
        if (pbar) pbar.visible = false;
        if (data.head.code == "000000") {
            if (data.body.version != version) {
                nf.confirm("检测到新版本，是否升级？", function(state){
                    if (state != 1) return;
                    if (os == 0) data.body.path = "itms-services://?action=download-manifest&url=" + data.body.path;
                    external.openURL(data.body.path);
                });
            } else if (pbar) nf.alert("已是最新版本");
        } else if (pbar) nf.alert("版本更新失败");
    });
    if (pbar) pbar.visible = true;
    http.request();
};

module.exports.request = request;