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
    "commentList.visible": "commentVis"
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
