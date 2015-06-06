var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

/* GET home page. */
router.get('/', function (req, res, next) {
    var url = 'http://vbuzz.vn/';

    var data = {
        title: 'Locally vBuzz'
    };

    request(url, function (error, response, html) {
    	if (!error) {
    		var $ = cheerio.load(html);

            $('.content-home1-col.col-1 .style-1').filter(function () {
                var bigContent = $(this);
                var a = bigContent.find('a');
                var img = a.find('img');

                data.big = {
                    href: a.attr('href').replace(url, '/'),
                    img: img.attr('src'),
                    text: a.find('.link').text(),
                    summary: a.next().text()
                };
            });

            $('.content-home1-col.col-1 .style-2').filter(function () {
                var smallContent = $(this);
                var smallData = [];

                smallContent.find('.t3-content').each(function () {
                    var small = $(this);
                    var a = small.find('a');
                    var img = a.find('img');

                    smallData.push({
                        href: a.attr('href').replace(url, '/'),
                        img: img.attr('src'),
                        text: a.find('.h2Title').text()
                    });
                });

                data.small = smallData;
            });

            $('.content-home1-col.col-2 .style-3 ul').filter(function () {
                var mediumData = [];

                $(this).find('li').each(function (i) {
                    var medium = $(this);

                    if (i === 0) {
                        var a = medium.find('a');
                        var img = a.find('img');

                        mediumData.push({
                            href: a.attr('href').replace(url, '/'),
                            img: img.attr('src'),
                            text: a.find('.h2Title').text()
                        });
                    } else {
                        var h2 = medium.find('h2');
                        var a = h2.find('a');

                        mediumData.push({
                            href: a.attr('href').replace(url, '/'),
                            text: a.text()
                        });
                    }
                });

                data.medium = mediumData;
            });

            res.render('index', data);
    	}
    });
});

function handleDetails(req, res) {
    var VBUZZ_URL = 'http://vbuzz.vn';
    var url = VBUZZ_URL + '/';
    var cat = req.params['cat'];
    var subcat = req.params['subcat'];
    var topic = req.params['topic'];

    url = url + cat + '/';

    if (subcat) {
        url = url + subcat + '/';
    }

    url = url + topic;

    var data = {};

    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            $('.title-post-ct').filter(function () {
                var title = $(this).text();

                data.title = title + ' | Locally vBuzz';
                data.post = {
                    title: title
                };
            });

            $('.meta-time').filter(function () {
                data.post.time = $(this).text();
            });

            $('.drc-gt').filter(function () {
                data.post.summary = $(this).text();
            });

            $('.list-lq').filter(function () {
                var related = $(this);
                related.find('a').each(function () {
                    var a = $(this);
                    var href = a.attr('href');

                    a.attr('href', href.replace(VBUZZ_URL, ''));
                });

                data.post.related = related.html();
            });

            $('.content-nd').filter(function () {
                var content = $(this);

                content.find('img').each(function () {
                    var img = $(this);
                    var src = img.attr('src');

                    img.attr('src', VBUZZ_URL + src)
                })

                data.post.content = content;
            });

            $('.hotnews .style-news-lis-6').filter(function () {
                var hots = $(this);

                hots.find('a').each(function () {                    
                    var a = $(this);
                    var href = a.attr('href');

                    a.attr('href', href.replace(VBUZZ_URL, ''));
                })

                data.post.hots = hots;
            });

            $('.tag-news').filter(function () {
                data.post.tags = $(this).html();
            });

            res.render('detail', data);
        }
    });
}

/* GET detail page. */
router.get('/:cat/:subcat/:topic', function (req, res, next) {
    handleDetails(req, res);
});

router.get('/:cat/:topic', function (req, res, next) {
    handleDetails(req, res);
});


module.exports = router;
