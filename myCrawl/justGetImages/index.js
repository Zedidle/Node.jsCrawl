var L = require('L');
var fs = require('fs');
var rmdir = require('rmdir');
var cheerio = require('cheerio');
var request = require('request');

var website = 'https://www.fuhaodq.com';


// L(__dirname);
// 图片绝对存储地址
// var dist = __dirname+'/images/';
// 当前运行目录路径
var dist = './images/';

// 图片下载间隔，单位ms，避免同时发起过多请求导致网络阻塞
var imgDownloadSpace = 10;

var isRmInitialImages = true;

if(isRmInitialImages){
	rmdir(dist);
}

if (!fs.existsSync(dist)) {
	L('Create folder:',dist);
    fs.mkdirSync(dist);
}

request(website, function (error, response, body) {
	L('error:', error); // Print the error if one occurred
	L('statusCode:', response && response.statusCode); // Print the response status code if a response was received
	// L('body:', body); // Print the HTML for the Google homepage.
	var $ = cheerio.load(body);
	var images = $('img');

	downloadImages(images);
});


function downloadImages(images){
	var imgUrlReg = /^(http:\/\/|https:\/\/).*(\.gif|\.jpg|\.png)$/;

	var i = 0;

	(function lambda(images,i){
		if(images[i]){
			var imageUrl = images[i].attribs.src;
			// if imageUrl is a right image's url
			if(imgUrlReg.test(imageUrl)){
				// var imageUrl = 'https://www.fuhaodq.com/d/file/xiansheng/2014-12-12/1418371854103852.jpg';
				L('Downloading:',imageUrl);

				request(imageUrl)
				.pipe(fs.createWriteStream(`${dist}${Date.now() + imageUrl.slice(-4)}`));
			}

			setTimeout(function(){
				lambda(images,++i);
			},imgDownloadSpace);
		}
	})(images,i);
	
}