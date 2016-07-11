var deviceone = require("deviceone");
var global = deviceone.sm("do_Global");
var nf = deviceone.sm("do_Notification");

var domain = "http://oapro.deviceone.cn/";
var oatestapi = domain + "oatestapi/";
var oatest = domain + "oatest/";

var account = oatestapi + "api/account/";
var mobile = oatestapi + "api/mobile/";
var file = oatestapi + "api/file/";
var appPublish = oatestapi + "api/AppPublish/";

var prefix = oatest + "Files";
var api_prefix = oatest + "api/Files";

var url = {
    GetToken: account + "GetToken",
    GetToken222: account + "GetToken222",
    ResetPwd: account + "ResetPwd",
    LogOff: account + "LogOff",
    RegisterEmployer: account + "RegisterEmployer",

    ChangePwd: mobile + "ChangePwd",
    GetEmployerDetail: mobile + "GetEmployerDetail",
    UploadEmpHeadImage: mobile + "UploadEmpHeadImage",

    GetInformationType: mobile + "GetInformationType",
    GetInformationList: mobile + "GetInformationList",
    GetInformationDetail: mobile + "GetInformationDetail",
    AddInforComment: mobile + "AddInforComment",
    GetInforCommentList: mobile + "GetInforCommentList",

    AddWorkCircle: mobile + "AddWorkCircle",
    GetWorkCircleList: mobile + "GetWorkCircleList",
    GetWorkCircleDetail: mobile + "GetWorkCircleDetail",
    AddWorkCircleComment: mobile + "AddWorkCircleComment",
    GetWorkCircleCommentList: mobile + "GetWorkCircleCommentList",
    GetWorkCircleForEmployer: mobile + "GetWorkCircleForEmployer",

    IsAttention: mobile + "IsAttention",
    AddAttention: mobile + "AddAttention",
    DeleteAttention: mobile + "DeleteAttention",
    GetAttentionList: mobile + "GetAttentionList",

    AddPraise: mobile + "AddPraise",
    AddApplication: mobile + "AddApplication",
    DeleteApplication: mobile + "DeleteApplication",
    GetApplicationList: mobile + "GetApplicationList",

    AddSuggestion: mobile + "AddSuggestion",

    UploadImage: file + "UploadImage",
    UploadIImageForEmpIcon: file + "UploadIImageForEmpIcon",
    GetLastVersion: appPublish + "GetLastVersion",

    AllEmployers: prefix + "/AllEmployers/Zip/AllEmployers.zip",
    CheckTimeForAllEmployerJson: mobile + "CheckTimeForAllEmployerJson"
};

var token = function(url){
    return url + "?access_token=" + global.getMemory("access_token");
};

var headCodeCheck = function(data){
    if (data.head) {
        if (data.head.code == "000000") {
            return true;
        } else {
            nf.alert(data.head.message);
            return false;
        }
    } else {
        nf.alert(data.message);
        return false;
    }
};

var minute = 1000 * 60;
var hour = minute * 60;
var day = hour * 24;

var time_format = function(createTime){
    createTime = new Date(createTime).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '');
    var nowTime = new Date().getTime();
    var strtoTime = Date.parse(createTime.replace(/-/gi, "/"));
    var diffTime = nowTime - strtoTime;
    var dayC = diffTime / day;
    var hourC = diffTime / hour;
    var minC = diffTime / minute;
    if (dayC >= 1) {
        dayC = parseInt(dayC);
        createTime = dayC == 1 ? "发表于昨天" : createTime;
    } else if (hourC >= 1) {
        createTime = "发表于" + parseInt(hourC) + "个小时前";
    } else if (minC >= 1) {
        createTime = "发表于" + parseInt(minC) + "分钟前";
    } else {
        createTime = "刚刚发表";
    }
    return createTime;
};

var work_format = function(data){
    var img, imgsL, imgT, lines, sources;
    data.forEach(function(v){
        v.icon = prefix + v.icon;
        v.createTime = time_format(v.createTime);
        imgsL = v.imgs.length;
        lines = Math.floor((imgsL / 3) + (imgsL % 3 == 0 ? 0 : 1));
        v.template = lines > 3 ? 3 : lines;
        sources = [];
        for (var n = 0, nLen = lines * 3; n < nLen; n++) {
            if (n < imgsL) {
                img = api_prefix + v.imgs[n].img;
                imgT = img.split("/");
                imgT = imgT[imgT.length - 1];
                imgT = img.replace(imgT, "Thumb/" + imgT);
                v["img" + n + "t"] = imgT;
                v["img" + n + "v"] = true;
                sources.push({source: img, init: imgT});
            } else {
                v["img" + n + "v"] = false;
            }
        }
        if (imgsL == 1) {
            v.img0w = v.imgs[0].width;
            v.img0h = v.imgs[0].height;
            v.template = 4;
        }
        v.sources = JSON.stringify(sources);
        if (v.workCircleComments.length > 0) {
            v.commentList = "";
            v.workCircleComments.forEach(function(comment){
                v.commentList += (comment.replayEmpName + "：" + comment.message + "\r\n")
            });
            v.commentList = v.commentList.substring(0, v.commentList.length - 2);
            v.commentVis = true;
        } else {
            v.commentVis = false;
        }
        delete v.imgs;
        delete v.workCircleComments;
    });
    return data;
};

var inform_format = function(data){
    data.forEach(function(v){
        if (v.icon) {
            v.template = 0;
            var temp = v.icon.split("/");
            temp = temp[temp.length - 1];
            v.icon = prefix + v.icon.replace(temp, "Thumb/" + temp);
        } else if (v.comment) {
            v.template = 2;
        } else {
            v.template = 1;
        }
        v.describe = v.describe.replace(/&nbsp;/g, "").trim();
        v.inforTypeIcon = prefix + v.inforTypeIcon;
    });
    return data;
};

var fail = function(data, pbar, listview){
    if (pbar.visible) pbar.visible = false;
    else if (listview) listview.rebound();
    if (data.status == 401)
        nf.alert("此帐号在另一设备上登录，您被强制下线", function(){
            global.exit();
        });
    else nf.alert(data.message);
};

var Euc = encodeURIComponent;
var queryString = function(obj, sep, eq, name){
    sep = sep || '&';
    eq = eq || '=';
    obj = obj === null ? undefined : obj;
    if (typeof obj === "object") return Object.keys(obj).map(function(k){
        var ks = Euc(k) + eq;
        if (Array.isArray(obj[k])) return obj[k].map(function(v){
            return ks + Euc(v)
        }).join(sep);
        else return ks + Euc(obj[k]);
    }).join(sep);
    if (!name) return "";
    return Euc(name) + eq + Euc(obj);
};

module.exports.domain = domain;
module.exports.prefix = prefix;
module.exports.api_prefix = api_prefix;
module.exports.url = url;
module.exports.fail = fail;
module.exports.token = token;
module.exports.headCodeCheck = headCodeCheck;
module.exports.queryString = queryString;
module.exports.inform_format = inform_format;
module.exports.work_format = work_format;
module.exports.time_format = time_format;
