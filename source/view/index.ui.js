var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");

var canBack = false;
var delay3 = mm("do_Timer");
delay3.delay = 3000;
delay3.interval = 1000;
delay3.on("tick", function(){
    this.stop();
    canBack = false;
});

page.on("back", function(){
    if (canBack) {
        global.exit();
    } else {
        nf.toast("再按一次退出");
        canBack = true;
        delay3.start();
    }
});

var main_shower = ui("main_shower");
var action_alys = [ui("inform"), ui("work"), ui("apps"), ui("contact"), ui("message")];
var action_imgs = [ui("img_0"), ui("img_1"), ui("img_2"), ui("img_3"), ui("img_4")];
var action_lbs = [ui("lb_0"), ui("lb_1"), ui("lb_2"), ui("lb_3"), ui("lb_4")];
var v, path = [], prev = {img: action_imgs[0], lb: action_lbs[0]};
for (var i = 0, len = action_alys.length; i < len; i++) {
    v = action_alys[i];
    path.push({
        id: v.id,
        path: "source://view/" + v.id + "/" + v.id + ".ui"
    });
    v.img = action_imgs[i];
    v.lb = action_lbs[i];
    v.on("touch", function(){
        prev.img.source = prev.img.source.replace("_d", "");
        prev.lb.fontColor = "000000FF";
        this.img.source = "source://image/action@" + this.id + "_d.png";
        this.lb.fontColor = "E03E3FFF";
        prev.img = this.img;
        prev.lb = this.lb;
        main_shower.showView(this.id);
    });
}
main_shower.addViews(path);

page.on("loaded", function(){
    main_shower.showView("inform");
}).on("index-listen", function(data){
    ui(data.view).fire("touch");
});
