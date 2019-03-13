function returnFile(){
    this.sendFiles = function(app){
        app.get('/signUp.html',function(req,res){
            //req.
            res.sendFile(__dirname+"/"+"signUp.html");
        });
        
        // app.get('/js/public.js',function(req,res){
        //     //req.
        //     res.sendFile(__dirname+"/"+"js/public.js");
        // });
        //
        //
        // app.get('/css/public.css',function(req,res){
        //     //req.
        //     res.sendFile(__dirname+"/"+"css/public.css");
        // });
        //
        // app.get('/css/layui.css',function(req,res){
        //     //req.
        //     res.sendFile(__dirname+"/"+"css/layui.css");
        // });
        //
        // app.get('/layui.js',function(req,res){
        //     //req.
        //     res.sendFile(__dirname+"/"+"layui.js");
        // });
        //
        // app.get('/img/top_logo.png',function(req,res){
        //     res.sendFile(__dirname+"/"+"img/top_logo.png");
        // });
        
        app.get('/success_register.html',function(req,res){
            //req.
            res.sendFile(__dirname+"/"+"success_register.html");
        });

        app.get('/a.html',function(req,res){
            //req.
            res.sendFile(__dirname+"/"+"a.html");
        });
        
        app.get('/signIn.html',function(req,res){
            res.sendFile(__dirname+"/"+"signIn.html");
        });
        
        app.get('/index.html',function(req,res){
            res.sendFile(__dirname+"/"+"index.html");
        });
        
        
        app.get('/head.html',function(req,res){
            res.sendFile(__dirname+"/"+"head.html");
        });
        
        
        app.get('/left.html',function(req,res){
            res.sendFile(__dirname+"/"+"left.html");
        });
        
        
        app.get('/main.html',function(req,res){
            res.sendFile(__dirname+"/"+"main.html");
        });
        
        app.get('/changeDriverInfo.html',function(req,res){
            res.sendFile(__dirname+"/"+"changeDriverInfo.html");
        });
        
        app.get('/addDriverInfo.html',function(req,res){
            res.sendFile(__dirname+"/"+"addDriverInfo.html");
        });
        
        app.get('/examine.html',function(req,res){
            res.sendFile(__dirname+"/"+"examine.html");
        });
        
        app.get('/selectExamine.html',function(req,res){
            res.sendFile(__dirname+"/"+"selectExamine.html");
        });
        
        app.get('/changeExamine.html',function(req,res){
            res.sendFile(__dirname+"/"+"changeExamine.html");
        });
        
        app.get('/addExamine.html',function(req,res){
            res.sendFile(__dirname+"/"+"addExamine.html");
        });
        
        app.get('/Illegal.html',function(req,res){
            res.sendFile(__dirname+"/"+"Illegal.html");
        });
        
        app.get('/selectIllegal.html',function(req,res){
            res.sendFile(__dirname+"/"+"selectIllegal.html");
        });
        
        app.get('/changeIllegal.html',function(req,res){
            res.sendFile(__dirname+"/"+"changeIllegal.html");
        });
        
        app.get('/addIllegal.html',function(req,res){
            res.sendFile(__dirname+"/"+"addIllegal.html");
        });
        
        app.get('/RewardsPunishments.html',function(req,res){
            res.sendFile(__dirname+"/"+"RewardsPunishments.html");
        });
        
        app.get('/selectRewardsPunishments.html',function(req,res){
            res.sendFile(__dirname+"/"+"selectRewardsPunishments.html");
        });
        
        app.get('/changeRewardsPunishments.html',function(req,res){
            res.sendFile(__dirname+"/"+"changeRewardsPunishments.html");
        });
        
        app.get('/addRewardsPunishments.html',function(req,res){
            res.sendFile(__dirname+"/"+"addRewardsPunishments.html");
        });
        
        app.get('/priv.html',function(req,res){
            res.sendFile(__dirname+"/"+"priv.html");
        });
        
        app.get('/privErr.html',function(req,res){
            res.sendFile(__dirname+"/"+"privErr.html");
        });
        
        app.get('/Backup.html',function(req,res){
            if(req.session.user != 'root')
                res.sendFile(__dirname+"/"+"privErr.html");
            else
                res.sendFile(__dirname+"/"+"Backup.html");
        });
    };
};

module.exports = returnFile;