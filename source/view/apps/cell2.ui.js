var rootview = ui("$");
var page = sm("do_Page");

ui("$").setMapping({
    "icon.source": "icon",
    "name.text": "name",
    "tag": "id"
});

ui("action_delete").on("touch", function(){
    page.fire("delete-listen", rootview.tag);
});
