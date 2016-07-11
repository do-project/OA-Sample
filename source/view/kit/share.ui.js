var rootview = ui("$");
var page = sm("do_Page");
var nf = sm("do_Notification");

rootview.on("touch", function(){
    this.visible = false;
});

var action_alys = [
    ui("action_qq"),
    ui("action_qzone"),
    ui("action_wx"),
    ui("action_wb"),
    ui("action_copy")
];

for (var i = 0; i < action_alys.length; i++) {
    action_alys[i].on("touch", function(){
        rootview.visible = false;
        page.fire("share-listen", this.id.substr(7));
    })
}
