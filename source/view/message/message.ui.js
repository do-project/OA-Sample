var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var device = sm("do_Device");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));

var userInfo = global.getMemory("userInfo");

var deviceOS = device.getInfo().OS;
deviceOS = deviceOS == "android" || deviceOS.indexOf("iPhone") > -1;

var huanxin = deviceOS ? sm("do_HuanXinIM") : false;
var sqlite3 = mm("do_SQLite");

sqlite3.open("data://oa.db");
sqlite3.update = "UPDATE chat SET time=(datetime('NOW','localtime')),status=0 WHERE username='{{username}}' AND ref='{{ref}}';".replace("{{ref}}", userInfo.itcode);
sqlite3.select = "SELECT * FROM chat WHERE ref='{{ref}}' ORDER BY time DESC;".replace("{{ref}}", userInfo.itcode);

var listview = ui("do_listview");
var listdata = mm("do_ListData");
listview.bindItems(listdata);

var binddata = function(){
    sqlite3.query(sqlite3.select, function(data){
        if (pbar.visible) pbar.visible = false;
        else listview.rebound();
        data.forEach(function(v){
            v["visible"] = !!(v["status"] * 1);
        });
        listdata.removeAll();
        listdata.addData(data);
        listview.refreshItems();
    });
};

pbar.visible = true;
binddata();
app.on("huanxin-r-listen", binddata);

listview.on("touch", function(data){
    if (!huanxin) return nf.alert("此系统暂不支持即时消息");
    data = listdata.getOne(data);
    sqlite3.executeSync(sqlite3.update.replace("{{username}}", data["username"]));
    huanxin.enterChat({
        userID: data["username"],
        userNick: data["nickname"],
        userIcon: data["userlogo"],
        selfNick: userInfo.name,
        selfIcon: userInfo.icon,
        tag: data["username"]
    });
    binddata();
});

listview.on("pull", function(data){
    if (data.state !== 2) return;
    binddata();
});

var action_add = ui("action_add");
action_add.on("touch", function(){
    page.fire("index-listen", {view: "contact"});
});
