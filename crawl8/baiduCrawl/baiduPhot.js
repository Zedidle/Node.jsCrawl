var request = require('request'),
	cheerio = require('cheerio'),
	path = require('path'),
	async = require('async'),
	md5 = require('crypto'),
	fs = require('fs'),
	urlHref = [],
	set=new Set(),
	savePath = './images/',
	len = 0,
	success = 0;
for(var i = 1; i < 53; i++) urlHref.push(`http://www.touxiang8.org/tx/list_1_${i}.html`);
getHtml(urlHref);
function getHtml(requrl) {
	var imgSrc = [];
	len = urlHref.length;
	async.mapLimit(requrl, 1, function(val, call) {
		console.log('分析地址中=>' + val);
		request.get(val, {}, function(err, res, body) {
			if(!err && res.statusCode == 200 && body && body != '') {
				var $ = cheerio.load(body);
				var img = $('img').toArray();
				var href = $('a').toArray();
				for(var i in img) {
					var zxc = urlPath(res, img[i].attribs.src);
					if(zxc != null) imgSrc.push(zxc);
					delete zxc;
				}
				for(var i in href)
					if(href[i].attribs.href && href[i].attribs.href != '/' && href[i].attribs.href != val) {
						var zxc = urlPath(res, href[i].attribs.href);
						if(zxc != null) set.add(zxc);
						delete zxc;
					}
				delete $, img, href, body;
			}
			call(null, null);
		});
	}, function(err, data) {
		if(imgSrc.length > 0) getImg(imgSrc);
		urlHref.length=0;
		urlHref=Array.from(set);
		set.clear();
		delete err, data, imgSrc;
	});
}

function urlPath(resert, imgurl) {
	if('http://' + resert.request.host != imgurl) {
		if(imgurl.match(/https|http/i)) return imgurl;
		else return 'http://' + resert.request.host + imgurl;
	} else {
		return null;
	}
}

function getImg(uri) {
	async.mapLimit(uri, 5, function(val, callback) {
		var sha = md5.createHash('sha1');
		sha.update(val);
		var key = sha.digest('hex') + '.jpg';
		fs.exists(path.join(savePath, key), function(exists) {
			if(!exists) request({
				uri: val,
				encoding: 'binary'
			}, function(err, res, body) {
				if(!err) {
					fs.writeFile(path.join(savePath, key), body, "binary", function(pngErr) {
						delete body;
						success++;
						console.log(success + ':' + val);
						callback(null, null);
					});
				} else {
					console.log('抓取失败：url=>' + val);
					callback(null, null);
				}
			});
			else {
				console.log('跳过重复文件：url=>' + val);
				callback(null, null);
			}
		})
	}, function(err, data) {
		if(urlHref.length > 0) getHtml(urlHref);
		else {
			console.log('采集程序退出，因为无可用地址！');
			process.exit(0);
		}
		delete err, data;
	});
}