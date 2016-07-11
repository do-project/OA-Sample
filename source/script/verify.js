var stack = {
    phone: /^(\+86)?1\d{10}$/,
    email: /^(?:[a-zA-Z0-9]+[_\+\.]?)*[a-zA-Z0-9]+@(?:([a-zA-Z0-9]+[_\-]?)*[a-zA-Z0-9]+\.)+([a-zA-Z]{2,})+$/i,
    date: /^((?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29))(\s(?:[01]\d|2[0-3])\:[0-5]\d\:[0-5]\d)?$/,
    http: /^(http[s]?|ftp|mms):\/\/?(\w+\.)+\w+[\w_.\/\w]*$/,
    double: /^[-]?\d*[\.]?\d*$/,
    ZHCN: /^([\u4e00-\u9fa5]+[\.]?)?[\u4e00-\u9fa5]+$/
};

var run = function(cell){
    var v = cell[0];
    var p = cell[1];
    var m = cell[2];
    var pl = p.split(":");
    var ml = m.split(":");
    var req, patt;
    if (pl[0] == "!") {
        req = true;
        patt = pl[1];
    } else {
        req = false;
        patt = pl[0];
    }
    if (req && v === "") return [false, ml[0]];
    else if (!req && v === "") return [true , ml[0]];
    return [stack[patt].test(v) , ml[1]];
};

module.exports.run = run;