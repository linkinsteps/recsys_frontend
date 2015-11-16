var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'richanchor.com@gmail.com',
        pass: 'TheRichAnchor'
    },
    tls: {
        rejectUnauthorized: false
    }
});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'RecSys'
    });
});

router.post('/contactus', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');

    var plainText = '';
    plainText += 'Name: ' + req.body.name + ' \n';
    plainText += 'Email address: ' + req.body.email + ' \n';
    plainText += 'Phone: ' + req.body.phone + ' \n';
    plainText += 'Organization: ' + req.body.org + ' \n';
    plainText += 'Message: ' + req.body.msg + ' \n';
    
    var htmlStr = '';
    htmlStr += '<b>Name</b>: ' + req.body.name + ' <br />';
    htmlStr += '<b>Email address</b>: ' + req.body.email + ' <br />';
    htmlStr += '<b>Phone</b>: ' + req.body.phone + ' <br />';
    htmlStr += '<b>Organization</b>: ' + req.body.org + ' <br />';
    htmlStr += '<b>Message</b>: ' + req.body.msg + ' <br />';

    try {
        // send mail with defined transport object
        transporter.sendMail({
            from: 'RichAnchor Team <info@richanchor.com>',
            to: 'richanchor.com@gmail.com',
            cc: [
                'anhtuan9288@gmail.com',
                'giang.taquynh@gmail.com',
                'ducdhm@gmail.com',
                'xuta.le@gmail.com',
                'linkinsteps@gmail.com'
            ],
            subject: 'Contact from richanchor.com',
            text: plainText,
            html: htmlStr
        }, function (error, info) {
            if (error) {
                res.json({
                    status: false,
                    error: error
                });
            } else {
                console.log('Message sent: ' + info.response);
    
                res.json({
                    status: true
                });
            }
        });
    } catch (e) {
        res.json({
            status: false,
            error: e
        });
    }
});

module.exports = router;
