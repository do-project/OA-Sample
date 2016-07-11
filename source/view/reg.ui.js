var app = sm("do_App");
var page = sm("do_Page");
var nf = sm("do_Notification");
var global = sm("do_Global");
var rootview = ui("$");
var pbar = ui(rootview.add("progressbar", "source://view/kit/pbar.ui", 0, 70));
var $U = require("url");

page.on("back", function(data){
    app.closePage(data);
});

ui("action_back").on("touch", function(){
    page.hideKeyboard();
    app.closePage();
});

var tf_itcode = ui("tf_itcode");
var tf_pwd = ui("tf_pwd");
var tf_name = ui("tf_name");
var tf_employer = ui("tf_employer");
var tf_position = ui("tf_position");
var tf_departement = ui("tf_departement");
var tf_email = ui("tf_email");
var tf_fix = ui("tf_fix");
var tf_phone = ui("tf_phone");
var action_ok = ui("action_ok");

var reg_http = mm("do_Http");
reg_http.url = $U.url.RegisterEmployer;
reg_http.method = "post";
reg_http.timeout = "60000";
reg_http.contentType = "application/json";
reg_http.on("fail", function(data){
    $U.fail(data, pbar);
}).on("success", function(data){
    pbar.visible = false;
    if (!$U.headCodeCheck(data)) return;
    nf.alert("注册成功", function(){
        page.fire("back", {login_reg: true, itcode: tf_itcode.text, pwd: tf_pwd.text});
    });
});

var anim_button = mm("do_Animation", "BUTTONTOUCHDOWN", "app");
var tips = {
    Itcode: "ID不可为空",
    pwd: "密码不可为空",
    Name: "姓名不可为空",
    Email: "邮箱不可为空",
    PhoneNumber: "手机号码不可为空"
};
action_ok.on("touch", function(){
    page.hideKeyboard();
    var body = {
        Itcode: tf_itcode.text.toLowerCase().trim(),
        pwd: tf_pwd.text.trim(),
        Name: tf_name.text.trim(),
        EmployerNumber: tf_employer.text.trim(),
        DcPosition: tf_position.text.trim(),
        DepartementName: tf_departement.text.trim(),
        Email: tf_email.text.trim(),
        FixPhoneNumber: tf_fix.text.trim(),
        PhoneNumber: tf_phone.text.trim()
    };
    for (var i in body) {
        if (!body[i]) if (tips[i]) return nf.toast(tips[i]);
    }
    pbar.visible = true;
    reg_http.body = body;
    reg_http.request();
}).on("touchDown", function(){
    this.animate(anim_button);
});

rootview.on("touch", function(){
    page.hideKeyboard();
});
