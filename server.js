/* eslint-disable no-undef */
var express = require('express');
var cors = require('cors')
var crypto = require('crypto')
var Sequelize = require('sequelize')
// var bodyParser = required('body-parser');
var app = express();
// app.use(bodyParser.json({type:"*/*"}));
var mysql = require('mysql')
var sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded());
app.use(express.json());
app.use(cors())
// set port
app.listen(3000, function () {
    console.log('App is running on port 3000');
});

module.exports = app;
let sequelize = new Sequelize('userinfo', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

sequelize.authenticate().then(() => {
    console.log('Connect has been establish')
}).catch(err => {
    console.error('Unable to database', err)
})
const user = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    phone: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    authKey: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    isAuthenticated: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }

})

// sequelize.sync({
//     force:true
// })

/*user.create({
    name: 'Teju',
    phone: 5467867,
    email: 'kmksdml',
    authKey: 875606806,
    isAuthenticated: false
}).then(users => {
    return users.id;
}).catch(function (err){
    console.log("create failed",err)
    return 0;
})*/

app.get('/', function (req, res) {
    return res.send({
        error: true, message: 'hello'
    })
});

//create route

app.post('/create',cors(), function (req, res) {
    console.log(req.body.name);
    var seed = crypto.randomBytes(10);
    var token = crypto.createHash('sha1').update(seed + req.body.email).digest('hex');

    // const a = user.findOne({
    //     attributes: ['authKey']
    // }).then((auth) => {
    //     return auth;
    // })
   // console.log(a);

    user.create({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        authKey: token,
        isAuthenticated: false

    }).then((results) => {
       
         var authUrl = 'http://localhost:3000/verify?authKey='+ results.authKey;
        // console.log(authUrl)
        sendgrid.send({
                    to: results.email,
                    from: 'tejumadeadetunji@gmail.com',
                    subject: 'Comfire your email',
                    html: '<a target=_blank href=/"' + authUrl +'/">Comfirm your email</a>'
                }).then((json)=> {
                    console.log(json)
                }).catch(err => {
                    console.log(err)
                })
       

           
        console.log('Succesfull');
        return res.send({ error: false, data: results, message: 'userslist' });
        //add mail
       

    }).catch(err => {
        console.error('Unable to create new user', err)
    })

    
   // console.log(user.authKey)
/*
    sendgrid.send({
        to: user.email,
        from: 'tejumadeadetunji@gmail.com',
        subject: 'Comfire your email',
        html: '<a target=_blank href=/"' + authUrl +'/">Comfirm your email</a>'
    }).then((json)=> {
        console.log(json)
    }).catch(err => {
        console.log(err)
    })*/
})

// verify 
app.get('/verify', function(req,res){
    user.findOne({
        where:{
            authKey: req.query.authKey,
        },
    }).then((user) => {
        user.update({isAuthenticated:true})
        console.log('worked')
        res.send({user:user})

        // var authUrl = 'http://localhost:3000/verify?authKey='+ user.authKey;

        sendgrid.send({
            to: user.email,
            from: 'tejumadeadetunji@gmail.com',
            subject: 'Email commfirmed',
            html: '<a target=_blank href=/"' + authUrl +'/">Comfirm your email</a>'
        }).then((json)=> {
            console.log(json)
        }).catch(err => {
            console.log(err)
        })

        // add mail
    }).catch(err => {
        console.log(err)
        res.send({error:'error'})
    })
})


// db connections
/* ar mysql = required('mysql')
var dbconn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'userdetails'
});

dbconn.connect();


//api


//retrive all users
app.get('/users', cors(), function (req, res) {
    dbconn.query('SELECT * FROM users', function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'userslist' });
    });
});

//add user
// app.post('/user', function (req, res) {




// save user info into database
app.post('/user', cors(), function (req, res) {
    var seed = crypto.randomBytes(10);
    var token = crypto.createHash('sha1').update(seed + req.body.email).digest('hex');
    // if (!req.body.name) {
    //     return res.status(400).send({
    //         error: true, message: 'Please provide user'
    //     });
    // } (req.body.id,req.body.name,req.body.phone,req.body.email,req.body.verifKey,req.body.verified)
    console.log(token)
    //console.log(seed)
    // let b = 7352758
    dbconn.query(" INSERT INTO users(id, name, phone, email, verifKey, verified) VALUES(?,?,?,?,?,?)", [req.body.id,req.body.name,req.body.phone,req.body.email,token,req.body.verified], function (error, results, fields) {
    if (error) throw error;
    //console.log("not workng");
    return res.send({ error: false, data: results, message: 'done' });
});
});
// to verify email
app.get('/verify_email', function(req,res){
    dbconn.query('SELECT * FROM users WHERE verifKey= ?',[req.query.token] , function(error,user){
        if (error) throw error;
        dbconn.query('UPDATE userdetails.users SET verified ="1" WHERE users.verifKey=?',[req.query.token]);

        res.send({error: false, data:user});
    })
})
//json format with cully braces {"id": 2,"name": "tmi","phone": 8023374263,"email": "tolddsr@gmail","verified": 0}*/