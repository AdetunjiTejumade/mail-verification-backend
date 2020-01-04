/* eslint-disable no-undef */
var express = require('express');
var cors = require('cors')
var crypto = require('crypto')
var Sequelize = require('sequelize')
// var bodyParser = required('body-parser');
var app = express();
// app.use(bodyParser.json({type:"*/*"}));
var sendgrid = require('@sendgrid/mail');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');
//console.log(SENDGRID_API_KEY)
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

    user.create({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        authKey: token,
        isAuthenticated: false

    }).then((results) => {
       
         var authUrl = 'http://localhost:3000/verify?authKey='+ results.authKey;
        // console.log(authUrl)
        //add mail
        sgMail.send({
                    to: results.email,
                    from: 'tejumadeadetunji@gmail.com',
                    subject: 'Comfire your email',
                    html: '<a target="_blank" href="' + authUrl + '">comfirm email</a> Or copy code '+ results.authKey + ''
                    
                }).then((json)=> {
                    console.log(json)
                }).catch(err => {
                    console.log(err)
                })
       

           
        console.log('Succesfull');
        return res.send('https://adetunjitejumade.github.io/mail-verification/sucess.html');
        
       

    }).catch(err => {
        console.error('Unable to create new user', err)
    })

    

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
        // add mail
        sgMail.send({
            to: user.email,
            from: 'tejumadeadetunji@gmail.com',
            subject: 'Email commfirmed',
            html: 'Email validated'
        }).then((json)=> {
            console.log(json)
        }).catch(err => {
            console.log(err)
        })

        
    }).catch(err => {
        console.log(err)
        res.send({error:'error'})
    })
})

