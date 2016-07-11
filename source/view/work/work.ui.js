var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var storage = sm("do_Storage");
var imgbrowser = sm("do_ImageBrowser");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));
var $U = require("url");
var open = require("open");

ui("action_add").on("touch", function(){
    open.start("source://view/work/add.ui");
});

var contact = {
    source: "data://AllEmployers.zip",
    target: "data://",
    file: "data://AllEmployers.txt",
    detail: function(id){
        storage.readFile(contact.file, function(data){
            if (typeof data == "string") eval("data = " + data);
            data.forEach(function(v){
                if (id == v[3]) {
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

page.on("icon-listen", function(data){
//    open.start("source://view/work/employer.ui", data);
    pbar.visible = true;
    contact.detail(data.id);
});

page.on("imgs-listen", function(data){
    imgbrowser.show(data.s, data.i);
});

page.on("praise-listen", function(data){
    nf.alert("赞");
});

page.on("comment-listen", function(data){
    open.start("source://view/work/comment.ui", data);
});

var work_shower = ui("work_shower");
var work_btns = [ui("action_all"), ui("action_att")];
var v, path = [], prev = work_btns[0];
for (var i = 0, len = work_btns.length; i < len; i++) {
    v = work_btns[i];
    path.push({
        id: v.tag,
        path: "source://view/work/work_" + v.tag + ".ui"
    });
    v.on("touch", function(){
        if (this.bgColor == "FFFFFFFF") return;
        prev.bgColor = "00000000";
        prev.fontColor = "FFFFFFFF";
        this.bgColor = "FFFFFFFF";
        this.fontColor = "E03E3FFF";
        prev = this;
        work_shower.showView(this.tag);
    });
}

work_shower.addViews(path);
work_shower.showView("all");
