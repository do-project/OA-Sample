var page = sm("do_Page");

var action_cap = ui("action_cap");
var action_abl = ui("action_abl");

action_abl.on("touch", function(){
    page.fire("menu-listen2", {state: 2});
});

action_cap.on("touch", function(){
    page.fire("menu-listen1", {state: 1});
});

ui("$").on("touch", function(){
    page.fire("menu-listen0", {state: 0});
});