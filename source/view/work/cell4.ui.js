var rootview = ui("$");
var page = sm("do_Page");
var nf = sm("do_Notification");

rootview.setMapping({
    "icon.tag": "employerId",
    "icon.source": "icon",
    "name.text": "name",
    "message.text": "message",

    "createTime.text": "createTime",
    "actionTips.tag": "id",

    "commentList.text": "commentList",
    "commentList.visible": "commentVis",

    "img0.source": "img0t",
    "img0.width": "img0w",
    "img0.height": "img0h",

    "tag": "sources"
});

var img0 = ui("img0");
img0.on("dataRefreshed", function(){
    img0.redraw();
});

var icon = ui("icon");
var name = ui("name");
icon.on("touch", function(){
    page.fire("icon-listen", {id: this.tag, name: name.text});
});

var actionTips = ui("actionTips");
actionTips.on("touch", function(){
    page.fire("comment-listen", {id: this.tag});
});

var work_imgs = [
    ui("img0")
];

work_imgs.forEach(function(v, k){
    v.on("touch", {index: k}, function(_, e){
        page.fire("imgs-listen", {s: JSON.parse(rootview.tag), i: e.data.index})
    })
});