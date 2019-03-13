var express = require('express');
var app = express();
var svgCaptcha = require('svg-captcha');
const cookieParase = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var querystring = require('querystring');
var mysql = require('mysql');
// var exec = require('child_process').exec;
app.use(cookieParase('sessionpw'));
app.use(session({
    secret: 'sessionpw',//与cookieParser中的一致
    resave: true,
    saveUninitialized:true
}));

app.use(express.static('layui'));
// app.use(express.static('css'));
// app.use(express.static('js'));

// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// 获取验证码
function getCaptcha(req, res, next){
    var captcha = svgCaptcha.create({ 
     // 翻转颜色 
     inverse: false, 
     // 字体大小 
     fontSize: 36, 
     // 噪声线条数 
     noise: 2, 
     // 宽度 
     width: 80, 
     // 高度 
     height: 30, 
    }); 
    // 保存到session,忽略大小写 
    req.session.captcha = captcha.text.toLowerCase(); 
    console.log('验证码:'+req.session.captcha); //0xtg 生成的验证码
    console.log('客户端ip:'+req.connection.remoteAddress);
    //保存到cookie 方便前端调用验证
    //res.cookie('captcha', req.session); 
    res.setHeader('Content-Type', 'image/svg+xml');
    res.write(String(captcha.data));
    res.end();
};

function returnTips(req,res,info){
    res.setHeader('Content-Type','text/html;charset=utf8');
    res.end(info);
}

var returnFile = require('./returnFile');
var ReturnFile = new returnFile();
ReturnFile.sendFiles(app);

app.get('/getCaptcha', function(req, res, next) {
    return getCaptcha(req, res, next);
});

app.post('/register',urlencodedParser,function(req,res){
    var info = {
        "captcha":req.body['captcha'],
        "inputUserName":req.body['inputUserName'],
        "inputPassword":req.body['inputPassword']
    };

    if(req.session.captcha!=info.captcha){
        returnTips(req,res,'captchaErr');
        return;
    }

    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : 'root',              
        password : '19961026',       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
    connection.connect();   
    //var sql = 'INSERT INTO UserInfo(Uno, password, Permissions) VALUES(?,?,?);CREATE USER ?@"localhost" IDENTIFIED BY ?';

    var sql = 'CREATE USER ?@"localhost" IDENTIFIED BY ?';
    var sqlParams = [info.inputUserName,info.inputPassword];
    connection.query(sql,sqlParams,function (err, result) {   
        if(err){
            console.log('[INSERT ERROR] - ',err.message);
            res.send("err");
            return;
        }
    });

    var sql1 = 'INSERT INTO userInfo(Uno, Password, Permissions) VALUES(?,?,?)';
    var sqlParams1 = [info.inputUserName,info.inputPassword,'NULL'];
    connection.query(sql1,sqlParams1,function (err, result) {   
        if(err){
            console.log('[INSERT ERROR] - ',err.message);
            res.send("err");
            return;
        }
        res.send('registerOK');
    });

    connection.end();

    // let connection1 = mysql.createConnection({     
    //     host     : 'localhost',       
    //     user     : 'yxm',              
    //     password : '123456',       
    //     port: '3306',                   
    //     database: 'MySQL' 
    // });     
    // connection1.connect();   
    // //var sql = 'CREATE USER "'+info.inputUserName+'"@"localhost" IDENTIFIED BY "'+info.inputPassword+'"';
    // var sql1 = 'CREATE USER ?@"localhost" IDENTIFIED BY ?';
    // var sqlParams1 = [info.inputUserName,info.inputPassword];
    // connection1.query(sql1,sqlParams1,function (err, result) {
    //     if(err){
    //         console.log('[INSERT ERROR] - ',err.message);
    //         returnTips(req,res,"err");
    //         return;
    //     }else{
    //         returnTips(req,res,"ok_register");
    //     }
    // });
    // connection1.end();
});

app.post("/Login",urlencodedParser,function(req,res){  
    var info = {
        "captcha":req.body['captcha'],
        "inputUserName":req.body['inputUserName'],
        "inputPassword":req.body['inputPassword']
    };
    //console.log(info);
    if(req.session.captcha!=info.captcha){
        returnTips(req,res,'captchaErr');
        return;
    }
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : info.inputUserName,              
        password : info.inputPassword,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect(function(err){
       if(err){
           console.log(err);
            returnTips(req,res,'info_err');
            return;
       }else{
            // req.session.logged_in = true;
            req.session.user = info.inputUserName;
            req.session.password = info.inputPassword;
            res.cookie('user', req.session.user);
            //console.log(req.session);
            //req.session = 1; // This too
            returnTips(req,res,'ok');
       }
   });   

    // var sql = "SELECT * FROM yxm_user WHERE yxm_userName = ?";
    // var sqlParams = [info.inputUserName];
    // connection.query(sql,sqlParams,function (err, result) {
    //     if(err){
    //         console.log('[SELECT ERROR] - ',err.message);
    //         returnTips(req,res,'err');
    //         return;
    //     }else {
    //         bcrypt.compare(info.inputPassword,result[0].yxm_password,function(err,flag){
    //             tryLogin(flag);
    //         });
    //     }
    //     function tryLogin(pwFlag){
    //         if(result[0]==undefined || !pwFlag) {
    //             returnTips(req,res,'info_err');
    //             return;
    //         }
    //         console.log('登录用户：'+req.connection.remoteAddress);
    //         console.log(result);
    //         returnTips(req,res,'ok');
    //         //res.sendFile(__dirname+"/"+"index.html");
    //         //returnTips(req,res,__dirname+"/"+"index.html");
    //     }
    // });
    connection.end();
});


app.get("/getDriverInfo",urlencodedParser,function(req,res){
    // if(req.session.user==undefined){
    //     returnTips(req,res,'info_err');
    //     return;
    // }
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '19961026',
        port: '3306',
        database: 'DriveSystem'
    });
    connection.connect();
    var sql = "SELECT * FROM view_DI";
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            returnTips(req,res,'err');
            return;
        }else {
            console.log(result);
            var data = [['驾驶员编号','姓名','性别','出生日期','身份证号','档案编号','准驾车型','失效日期']];
            var len = result.length;
            for(var i=0; i<len; i++){
                data.push([result[i].Dno,result[i].Dname,result[i].Dsex,result[i].Dage,result[i].Did,result[i].DfileNo,
                    result[i].Dallow,result[i].DfailureTime]);
            }
            res.send(data);
        }

    });
    connection.end();
});

app.post("/getDriverInfo",urlencodedParser,function(req,res){  
    if(req.session.user==undefined){
        returnTips(req,res,'info_err');
        return;
    }
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
    connection.connect();   
    var sql = "SELECT * FROM view_DI";
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            returnTips(req,res,'err');
            return;
        }else {
            console.log(result);
            var data = [['驾驶员编号','姓名','性别','出生日期','身份证号','档案编号','准驾车型','失效日期']];
            var len = result.length;
            for(var i=0; i<len; i++){
                data.push([result[i].Dno,result[i].Dname,result[i].Dsex,result[i].Dage,result[i].Did,result[i].DfileNo,
                    result[i].Dallow,result[i].DfailureTime]);
            }
            res.send(data);
        }

    });
    connection.end();
});

app.post("/selectDriverInfo",urlencodedParser,function(req,res){
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();   
    var sql = "SELECT * FROM view_DI WHERE Dno = ?";
    var sqlParams = [req.body['Dno']];
    connection.query(sql,sqlParams,function (err, result) {
        if(err || result[0]==undefined){
            //console.log('[SELECT ERROR] - ',err.message);
            returnTips(req,res,'err');
            return;
        }else {
            console.log(result);
            var data = [['驾驶员编号','姓名','性别','出生日期','身份证号','档案编号','准驾车型','失效日期']];
            data.push([result[0].Dno,result[0].Dname,result[0].Dsex,result[0].Dage,result[0].Did,result[0].DfileNo,
                result[0].Dallow,result[0].DfailureTime]);
            console.log(data);
            res.send(data);
        }

    });
    connection.end();
});

app.post("/deleteDriverInfo",urlencodedParser,function(req,res){
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();   
    var sql = "DELETE FROM view_DI WHERE Dno = ?";
    var sqlParams = [req.body['Dno']];
    connection.query(sql,sqlParams,function (err, result) {
        if(err || result.affectedRows==0){
            console.log(err);
            returnTips(req,res,'err');
            return;
        }else {
            res.send('OK');
        }

    });
    connection.end();
});

app.post("/updateDriverInfo",urlencodedParser,function(req,res){
    var info = {
        Dno:req.body['Dno'],
        Property:req.body['Property'],
        newValue:req.body['newValue']
    }
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();  
   var Property = info.Property; 
    var sql = "UPDATE view_DI SET "+ Property+" = ? WHERE Dno = ?";
    var sqlParams = [info.newValue,info.Dno];
    connection.query(sql,sqlParams,function (err, result) {
        //console.log(result);
        if(err || result.changedRows==0){
            //console.log('[UPDATE ERROR] - ',err.message);
            returnTips(req,res,'err');
            return;
        }else{
            res.send('OK');
        }
    });
    connection.end();
});

app.post("/addDriverInfo",urlencodedParser,function(req,res){
    var info = {
        Dno:req.body['Dno'],
        Dname:req.body['Dname'],
        Dsex:req.body['Dsex'],
        Dage:req.body['Dage'],
        Did:req.body['Did'],
        DfileNo:req.body['DfileNo'],
        Dallow:req.body['Dallow'],
        DfailureTime:req.body['DfailureTime']
    }
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();  
    var sql = "INSERT INTO view_DI(Dno,Dname,Dsex,Dage,Did,DfileNo,Dallow,DfailureTime) VALUES(?,?,?,?,?,?,?,?)";
    var sqlParams = [info.Dno,info.Dname,info.Dsex,info.Dage,info.Did,info.DfileNo,info.Dallow,info.DfailureTime];
    connection.query(sql,sqlParams,function (err, result) {
        if(err || result.affectedRows==0){
            returnTips(req,res,'err');
            return;
        }else{
            res.send('OK');
        }
    });
    connection.end();
});

app.post("/getExamine",urlencodedParser,function(req,res){  
    if(req.session.user==undefined){
        returnTips(req,res,'info_err');
        return;
    }
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
    connection.connect();   
    var sql = "SELECT * FROM view_E";
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            returnTips(req,res,'err');
            return;
        }else {
            var data = [['驾驶员编号','姓名','审验年份','审验单位','审验情况']];
            var len = result.length;
            for(var i=0; i<len; i++){
                data.push([result[i].Dno,result[i].Dname,result[i].ExamineTime,result[i].ExamineUnits,result[i].ExamineCase]);
            }
            // console.log(data);
            res.send(data);
        }

    });
    connection.end();
});

app.post("/selectAllExamine",urlencodedParser,function(req,res){
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();   
    var sql = "SELECT * FROM view_E WHERE Dno = ?";
    var sqlParams = [req.body['Dno']];
    connection.query(sql,sqlParams,function (err, result) {
        if(err || result[0]==undefined){
            //console.log('[SELECT ERROR] - ',err.message);
            returnTips(req,res,'err');
            return;
        }else {
            console.log(result);
            var data = [['驾驶员编号','姓名','审验年份','审验单位','审验情况']];
            for(var i=0; i<result.length;i++) {
                data.push([result[i].Dno,result[i].Dname,result[i].ExamineTime,result[i].ExamineUnits,result[i].ExamineCase]);
            }
            console.log(data);
            res.send(data);
        }

    });
    connection.end();
});

app.post("/selectExamine",urlencodedParser,function(req,res){
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();   
    var sql = "SELECT * FROM view_E WHERE ExamineTime = ? AND Dno = ?";
    var sqlParams = [req.body['ExamineTime'],req.body['Dno']];
    connection.query(sql,sqlParams,function (err, result) {
        if(err || result[0]==undefined){
            //console.log('[SELECT ERROR] - ',err.message);
            returnTips(req,res,'err');
            return;
        }else {
            console.log(result);
            var data = [['驾驶员编号','姓名','审验年份','审验单位','审验情况']];
            data.push([result[0].Dno,result[0].Dname,result[0].ExamineTime,result[0].ExamineUnits,result[0].ExamineCase]);
            console.log(data);
            res.send(data);
        }

    });
    connection.end();
});

app.post("/deleteExamine",urlencodedParser,function(req,res){ 
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();   
    var sql = "DELETE FROM Examine WHERE ExamineTime = ? AND Dno = ?";
    var sqlParams = [req.body['ExamineTime'],req.body['Dno']];
    connection.query(sql,sqlParams,function (err, result) {
        if(err || result.affectedRows==0){
            returnTips(req,res,'err');
            return;
        }else {
            res.send('OK');
        }

    });
    connection.end();
});

app.post("/updateExamine",urlencodedParser,function(req,res){
    var info = {
        Dno:req.body['Dno'],
        ExamineTime:req.body['ExamineTime'],
        newValue:req.body['newValue']
    }
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
    connection.connect();   
    var sql = "UPDATE view_E SET ExamineCase = ? WHERE Dno = ? AND ExamineTime = ?";
    var sqlParams = [info.newValue,info.Dno,info.ExamineTime];
    connection.query(sql,sqlParams,function (err, result) {
        //console.log(result);
        if(err || result.changedRows==0){
            console.log('[UPDATE ERROR] - ',err.message);
            returnTips(req,res,'err');
            return;
        }else{
            res.send('OK');
        }
    });
    connection.end();
});

app.post("/addExamine",urlencodedParser,function(req,res){
    var info = {
        Dno:req.body['Dno'],
        ExamineTime:req.body['ExamineTime'],
        ExamineUnits:req.body['ExamineUnits'],
        ExamineCase:req.body['ExamineCase']
    }
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();  
   //console.log(info.Dno+info.ExamineTime+info.ExamineUnits+info.ExamineCase);
    var sql = "INSERT INTO view_E(Dno,ExamineTime,ExamineUnits,ExamineCase) VALUES(?,?,?,?)";
    var sqlParams = [info.Dno,info.ExamineTime,info.ExamineUnits,info.ExamineCase];
    connection.query(sql,sqlParams,function (err, result) {
        if(err || result.affectedRows==0){
            returnTips(req,res,'err');
            return;
        }else{
            res.send('OK');
        }
    });
    connection.end();
});

app.post("/getIllegal",urlencodedParser,function(req,res){  
    if(req.session.user==undefined){
        returnTips(req,res,'info_err');
        return;
    }
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
    connection.connect();   
    var sql = "SELECT * FROM view_I";
    connection.query(sql,function (err, result) {
        if(err){
            console.log(err.message);
            returnTips(req,res,'err');
            return;
        }else {
            var data = [['事件编号','时间描述','处理结果','扣分情况','吊销情况']];
            var len = result.length;
            for(var i=0; i<len; i++){
                data.push([result[i].Ino,result[i].Idescribe,result[i].Processing,result[i].DePoints,result[i].Revoked]);
            }
            // console.log(data);
            res.send(data);
        }

    });
    connection.end();
});

app.post("/selectIllegal",urlencodedParser,function(req,res){
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();   
    var sql = "SELECT * FROM view_I WHERE Ino = ?";
    var sqlParams = [req.body['Ino']];
    connection.query(sql,sqlParams,function (err, result) {
        if(err || result[0]==undefined){
            //console.log('[SELECT ERROR] - ',err.message);
            returnTips(req,res,'err');
            return;
        }else {
            console.log(result);
            var data = [['事件编号','时间描述','处理结果','扣分情况','吊销情况']];
            data.push([result[0].Ino,result[0].Idescribe,result[0].Processing,result[0].DePoints,result[0].Revoked]);
            res.send(data);
        }

    });
    connection.end();
});

app.post("/selectFuzzyIllegal",urlencodedParser,function(req,res){
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();   
    var sql = "SELECT * FROM view_I WHERE Idescribe LIKE '%"+req.body['Idescribe']+"%'";
    //var sqlParams = [req.body['Idescribe']];
    connection.query(sql,function (err, result) {
        if(err || result[0]==undefined){
            //console.log('[SELECT ERROR] - ',err.message);
            returnTips(req,res,'err');
            return;
        }else {
            console.log(result);
            var data = [['事件编号','时间描述','处理结果','扣分情况','吊销情况']];
            var len = result.length;
            for(var i=0; i<len; i++){
                data.push([result[i].Ino,result[i].Idescribe,result[i].Processing,result[i].DePoints,result[i].Revoked]);
            }
            // console.log(data);
            res.send(data);
        }

    });
    connection.end();
});

app.post("/deleteIllegal",urlencodedParser,function(req,res){ 
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();   
    var sql = "DELETE FROM view_I WHERE Ino = ?";
    var sqlParams = [req.body['Ino']];
    connection.query(sql,sqlParams,function (err, result) {
        if(err || result.affectedRows==0){
            returnTips(req,res,'err');
            return;
        }else {
            res.send('OK');
        }

    });
    connection.end();
});

app.post("/updateIllegal",urlencodedParser,function(req,res){
    var info = {
        Ino:req.body['Ino'],
        Property:req.body['Property'],
        newValue:req.body['newValue']
    }
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
    connection.connect();   
    var Property = info.Property;
    console.log(Property);
    var sql = 'UPDATE view_I SET '+Property+' = ? WHERE Ino = ?';
    var sqlParams = [info.newValue,info.Ino];
    connection.query(sql,sqlParams,function (err, result) {
        //console.log(result);
        if(err || result.changedRows==0){
            // console.log('[UPDATE ERROR] - ',err.message);
            returnTips(req,res,'err');
            return;
        }else{
            res.send('OK');
        }
    });
    connection.end();
});

app.post("/addIllegal",urlencodedParser,function(req,res){
    var info = {
        Ino:req.body['Ino'],
        Idescribe:req.body['Idescribe'],
        Processing:req.body['Processing'],
        DePoints:req.body['DePoints'],
        Revoked:req.body['Revoked']
    }
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();  
   //console.log(info.Dno+info.ExamineTime+info.ExamineUnits+info.ExamineCase);
    var sql = "INSERT INTO view_I(Ino,Idescribe,Processing,DePoints,Revoked) VALUES(?,?,?,?,?)";
    var sqlParams = [info.Ino,info.Idescribe,info.Processing,info.DePoints,info.Revoked];
    connection.query(sql,sqlParams,function (err, result) {
        if(err || result.affectedRows==0){
            returnTips(req,res,'err');
            return;
        }else{
            res.send('OK');
        }
    });
    connection.end();
});

app.post("/getRewardsPunishments",urlencodedParser,function(req,res){  
    if(req.session.user==undefined){
        returnTips(req,res,'info_err');
        return;
    }
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
    connection.connect();   
    var sql = "SELECT * FROM view_IR";
    connection.query(sql,function (err, result) {
        if(err){
            console.log(err.message);
            returnTips(req,res,'err');
            return;
        }else {
            var data = [['事件编号','驾驶员编号','姓名','奖惩单位','奖惩日期','车牌号码','事件描述','处理结果','扣分情况','吊销情况']];
            var len = result.length;
            for(var i=0; i<len; i++){
                data.push([result[i].Ino,result[i].Dno,result[i].Dname,result[i].RPUnits,result[i].RPTime,result[i].LicensePlate,result[i].Idescribe,result[i].Processing,result[i].DePoints,result[i].Revoked]);
            }
            // console.log(data);
            res.send(data);
        }

    });
    connection.end();
});

app.post("/pointsRewardsPunishments",urlencodedParser,function(req,res){
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();   
    var sql = "SELECT Dno, Dname, Year(RPTime) AS year, COUNT(DePoints) AS num, SUM(DePoints) AS sum FROM view_IR WHERE Dno= ? AND DePoints > 0 GROUP BY Year(RPTime)";
    var sqlParams = [req.body['Dno']];
    connection.query(sql,sqlParams,function (err, result) {
        if(err || result[0]==undefined){
            returnTips(req,res,'err');
            return;
        }else {
            var data = [['驾驶员编号','姓名','年份','扣分次数','扣分总计']];
            var len = result.length;
            for(var i=0; i<len; i++){
                data.push([result[i].Dno,result[i].Dname,result[i].year,result[i].num,result[i].sum]);
            }
            console.log(data);
            res.send(data);
        }

    });
    connection.end();
});

app.post("/selectRewardsPunishments",urlencodedParser,function(req,res){
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();   
    var sql = "SELECT * FROM view_IR WHERE Dno = ?";
    var sqlParams = [req.body['Dno']];
    connection.query(sql,sqlParams,function (err, result) {
        if(err || result[0]==undefined){
            returnTips(req,res,'err');
            return;
        }else {
            console.log(result);
            var data = [['事件编号','驾驶员编号','姓名','奖惩单位','奖惩日期','车牌号码','事件描述','处理结果','扣分情况','吊销情况']];
            var len = result.length;
            for(var i=0; i<len; i++){
                data.push([result[i].Ino,result[i].Dno,result[i].Dname,result[i].RPUnits,result[i].RPTime,result[i].LicensePlate,result[i].Idescribe,result[i].Processing,result[i].DePoints,result[i].Revoked]);
            }
            console.log(data);
            res.send(data);
        }

    });
    connection.end();
});

app.post("/deleteRewardsPunishments",urlencodedParser,function(req,res){ 
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();   
    var sql = "DELETE FROM RewardsPunishments WHERE Ino = ? AND Dno = ?";
    var sqlParams = [req.body['Ino'],req.body['Dno']];
    connection.query(sql,sqlParams,function (err, result) {
        if(err || result.affectedRows==0){
            returnTips(req,res,'err');
            return;
        }else {
            res.send('OK');
        }

    });
    connection.end();
});

app.post("/updateRewardsPunishments",urlencodedParser,function(req,res){
    var info = {
        Ino:req.body['Ino'],
        Dno:req.body['Dno'],
        Property:req.body['Property'],
        newValue:req.body['newValue']
    }
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
    connection.connect();   
    var Property = info.Property;
    var sql = 'UPDATE view_IR SET '+Property+' = ? WHERE Ino = ? AND Dno=?';
    var sqlParams = [info.newValue,info.Ino,info.Dno];
    connection.query(sql,sqlParams,function (err, result) {
        //console.log(result);
        if(err || result.changedRows==0){
            returnTips(req,res,'err');
            return;
        }else{
            res.send('OK');
        }
    });
    connection.end();
});

app.post("/addRewardsPunishments",urlencodedParser,function(req,res){
    var info = {
        Ino:req.body['Ino'],
        Dno:req.body['Dno'],
        RPUnits:req.body['RPUnits'],
        RPTime:req.body['RPTime'],
        LicensePlate:req.body['LicensePlate']
    }
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
   connection.connect();  
   //console.log(info.Dno+info.ExamineTime+info.ExamineUnits+info.ExamineCase);
    var sql = "INSERT INTO view_IR(Ino,Dno,RPUnits,RPTime,LicensePlate) VALUES(?,?,?,?,?)";
    var sqlParams = [info.Ino,info.Dno,info.RPUnits,info.RPTime,info.LicensePlate];
    connection.query(sql,sqlParams,function (err, result) {
        if(err || result.affectedRows==0){
            returnTips(req,res,'err');
            return;
        }else{
            res.send('OK');
        }
    });
    connection.end();
});

app.post("/priv",urlencodedParser,function(req,res){  
    if(req.session.user!='root'){
        returnTips(req,res,'info_err');
        return;
    }
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
    connection.connect();   
    var sql = "SELECT * FROM userInfo";
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }else {
            console.log(result);
            var data = [['用户账号','权限']];
            var len = result.length;
            for(var i=0; i<len; i++){
                data.push([result[i].Uno,result[i].Permissions]);
            }
            res.send(data);
        }

    });
    connection.end();
});

app.post("/grantPriv",urlencodedParser,function(req,res){ 
    var info = {
        Uno:req.body['Uno'],
        table:req.body['table'],
        operate:req.body['operate'],
    } 
    console.log(info);
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
    connection.connect();   
    var sql = "GRANT "+ info.operate+" ON "+info.table+" TO "+info.Uno+"@'localhost'";
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[Priv ERROR] - ',err.message);
            returnTips(req,res,'err');
            return;
        }else{
            console.log('OK grant');
            returnTips(req,res,'OK');
        }

    });

    var sql1 = "UPDATE view_User SET Permissions = ? WHERE Uno = ?";
    var sqlParams = [info.operate,info.Uno];
    connection.query(sql1,sqlParams,function (err, result) {
        if(err){
            console.log('[Priv ERROR] - ',err.message);
            return;
        }else{
            console.log('OK');
        }

    });

    connection.end();
});

app.post("/revokePriv",urlencodedParser,function(req,res){ 
    var info = {
        Uno:req.body['Uno'],
        table:req.body['table'],
        operate:req.body['operate'],
    } 
    var connection = mysql.createConnection({     
        host     : 'localhost',       
        user     : req.session.user,              
        password : req.session.password,       
        port: '3306',                   
        database: 'DriveSystem' 
    });     
    connection.connect();   
    var sql = "REVOKE "+ info.operate+" ON "+info.table+" FROM "+info.Uno+"@'localhost'";
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[Priv ERROR] - ',err.message);
            returnTips(req,res,'err');
            return;
        }else{
            console.log('OK');
            returnTips(req,res,'OK revoke');
        }

    });

    // var sql1 = "UPDATE userInfo SET Permissions = ? WHERE Uno = ?";
    // var sqlParams = [info.operate,info.Uno];
    // connection.query(sql1,sqlParams,function (err, result) {
    //     if(err){
    //         console.log('[Priv ERROR] - ',err.message);
    //         return;
    //     }else{
    //         console.log('OK');
    //     }

    // });

    connection.end();
});

app.get('/backup',function(req,res){

    //需要执行的命令字符串
    var cli = 'mysqldump -u' + req.session.user+' -p driveSystem > ./backup/driveSystem.sql';

    exec(cli,{encoding:'utf8'},function (err,stdout,stderr){
        if (err){
            console.log(err);
            returnTips(req,res,'err');
            return;
        }
        console.log('stdout'+stdout);
        returnTips(req,res,'OK');
    });
});

app.get('/recovery',function(req,res){

    //需要执行的命令字符串
    var cli = 'mysql -u' + req.session.user+' -p driveSystem < ./backup/driveSystem.sql';

    exec(cli,{encoding:'utf8'},function (err,stdout,stderr){
        if (err){
            console.log(err);
            returnTips(req,res,'err');
            return;
        }
        console.log('stdout'+stdout);
        console.log('stderr'+stderr);
        returnTips(req,res,'OK');
    });
});

var server = app.listen(9826,function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
});