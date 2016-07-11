var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));
var $U = require("url");

page.on("back", function(data){
    app.closePage(data);
});

ui("action_back").on("touch", function(){
    app.closePage();
});

var listview = ui("do_listview");
var listdata = mm("do_ListData");
listview.bindItems(listdata);

var type_all = page.getData();
listdata.removeAll();
listdata.addData(type_all);
listview.refreshItems();

listview.on("touch", function(data){
    page.fire("back", {
        index: data,
        inform_select: true
    });
});
