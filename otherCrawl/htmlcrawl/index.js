var express = require('express');
var cheerio = require('cheerio');
var superagent = require('superagent');

var app = express();

app.get('/', function (req, res, next) {
  superagent.get('http://es6.ruanyifeng.com/')
    .end(function (err, sres) {
      if (err) {
        return next(err);
      }
      var $ = cheerio.load(sres.text);
      var items = [];
      $('#topic_list .cell').each(function (idx, element) {
        //this指element
        items.push({
          href: $(this).children('.topic_title_wrapper').children('.topic_title').attr('href'),
          title:$(this).children('.topic_title_wrapper').children('.topic_title').attr('title'),
          author:$(this).children('a').children('img').attr('title')
        });
      });
      res.send(items);
    });
});


app.listen(3000, function () {
  console.log('port 3000');
});