var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var storage = sm("do_Storage");
var camera = sm("do_Camera");
var album = sm("do_Album");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));
var menuor = ui(rootview.add("menuor", "source://view/kit/menu.ui", 0, 0));
var $U = require("url");

page.on("back", function(data){
    app.closePage(data);
});

ui("action_back").on("touch", function(){
    app.closePage();
});

var add_body = {};
var add_http = mm("do_Http");
add_http.url = $U.token($U.url.AddWorkCircle);
add_http.method = "post";
add_http.timeout = "60000";
add_http.contentType = "application/json";
add_http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    nf.toast("发表成功");
    page.fire("back", {work_add: true});
});

var hupload = mm("do_Http");
hupload.url = $U.url.UploadImage;
hupload.method = "post";
hupload.contentType = "multipart/form-data";
hupload.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    pbar.visible = true;
    add_body.ImageForUploads = data.body;
    add_http.body = add_body;
    add_http.request();
});

var gv_imgs = ui("gv_imgs");
var gv_data = mm("do_ListData");
gv_imgs.bindItems(gv_data);

gv_data.addData([
    {"$+": "+", "$s": "source://image/apps@add.png"}
]);
gv_imgs.refreshItems();

gv_imgs.on("touch", function(index){
    page.hideKeyboard();
    var len = gv_data.getCount() - 1;
    page.len = 9 - len;
    if (len === index) {
        if (len < 9) menuor.visible = true;
        else nf.toast("最多只能发布9张图片");
    } else {
        nf.confirm("确定放弃此图片?", function(state){
            if (state != 1) return;
            gv_data.removeData([index]);
            gv_imgs.refreshItems();
            page.len -= 1;
        });
    }
});

page.on("menu-listen", function(data){
    menuor.visible = false;
    var len = this.len;
    if (data.state == 1) {
        camera.capture(720, -1, 72, false, function(data){
            gv_data.addOne({"$+": "", "$s": data}, 0);
            gv_imgs.refreshItems();
        });
    } else if (data.state == 2) {
        album.select(len, 720, -1, 72, function(datas){
            if (datas.length == 0) return;
            gv_data.addData(datas.map(function(v, i){
                return {"$+": i, "$s": v};
            }), 0);
            gv_imgs.refreshItems();
        });
    }
});

var icons = "data://icons";
var icons_zip = "data://icons.zip";

var action_ok = ui("action_ok");
var tb_message = ui("tb_message");

action_ok.on("touch", function(){
    if (pbar.visible) return;
    page.hideKeyboard();
    add_body.Message = tb_message.text.trim();
    if (add_body.Message === "") return nf.toast("请输入发表内容");
    var data = [], len = gv_data.getCount() - 1;
    for (var i = 0; i < len;) data.push(i++);
    var imgs = gv_data.getData(data).map(function(v){
        return v["$s"];
    });
    if (imgs.length == 0) return hupload.fire("success", {head: {code: "000000"}, body: []});
    storage.copy(imgs, icons, function(data){
        this.zip(icons, icons_zip, function(data){
            this.deleteDir(icons);
            hupload.upload(icons_zip);
            pbar.visible = true;
        });
    });
});
