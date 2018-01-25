var L = require('L');
var fs = require('fs');
var rmdir = require('rmdir');
var cheerio = require('cheerio');
var request = require('request');

var website = 'http://image.baidu.com/';

// 爬过的网站域名记录
var websiteRecord = [];
// 爬过的图片记录
var imageRecord = [];
var imageNumber = 0;
var websiteNumber = 0;

// L(__dirname);


// 是否开始?
var start = true;
// 是否删除原有图片?
var isRmInitialImages = true;


// 图片绝对存储地址
// var dist = __dirname+'/images/';

// 当前运行目录路径
var dist = './images/';



// 图片加入下载队列间隔，单位ms，避免同时发起过多请求导致网络阻塞
var imgInQueueSpace = 100;
// 网页跳转间隔,单位ms，避免同时过于多线下载图片,这里把一个网页当作一条线
var websiteSkipSpace = 1000;
// 图片下载间隔
var imgDownloadSpace = 100;
// 最多网页路线数量
var websiteNumberLimit = 10;
// 当前网页数量
var curWebsiteNumber = 0;
// 图片下载列表
var imagesWillBeDownload = [];
// 图片列表内数量限制
var imageQueueLimit = 10;


// 仅仅处理图片下载读列
setInterval(function(){
	if(imagesWillBeDownload.length && start){
		var img = imagesWillBeDownload.shift();
		if(imageRecord.indexOf(img) === -1){
			L('Downloading:',img,'imageNumber:'+(++imageNumber));
			imageRecord.push(img);
			request(img)
			.pipe(fs.createWriteStream(`${dist}${Date.now() + img.slice(-4)}`));
		}
	}
},imgDownloadSpace);




if(isRmInitialImages){
	rmdir(dist);
}


if (!fs.existsSync(dist)) {
	L('Create folder:',dist);
    fs.mkdirSync(dist);
}






getWebsiteImagesAndSkipToMoreWebsite(website);

function getWebsiteImagesAndSkipToMoreWebsite(website){

	if(!start){
		return 'Stoping';
	}

	if(websiteRecord.indexOf(website)===-1 && 
		curWebsiteNumber < websiteNumberLimit){
		websiteRecord.push(website);
		curWebsiteNumber++;

		request(website, function (error, response, body) {
			L('error:', error); // Print the error if one occurred
			L('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			// L('body:', body); // Print the HTML for the Google homepage.
			if(body){
				var $ = cheerio.load(body);
				var images = $('img');
				var hrefs = $('a');
				// L(hrefs);
				// L(hrefs[0]);
				// for(var i in hrefs[0]){
					// L(i,hrefs[0][i]);
				// }
				// L(images);
				downloadImages(images);

				// for(var i=0;i<hrefs.length;i++){
				// 	L(hrefs[i].attribs.href);
				// }
				curWebsiteNumber--;
				skipToOtherWebsite(hrefs);
			}

		});
	}
};



function skipToOtherWebsite(hrefs){
	var hrefReg = /^(http:\/\/|https:\/\/)/;

	for(var i=0;i<hrefs.length;i++){
		let href = hrefs[i].attribs.href;
		// L(href)
		// L(hrefReg.test(href));
		if(hrefReg.test(href)){
			setTimeout(function(){
				L('Skip to website: '+href,'websiteNumber:'+(++websiteNumber));
				getWebsiteImagesAndSkipToMoreWebsite(href);
			},websiteSkipSpace);
		}
	}
}




function downloadImages(images){
	var imgUrlReg = /^(http:\/\/|https:\/\/).*(\.gif|\.jpg|\.png)$/;

	var i = 0;

	(function lambda(images,i){
		if(images[i]){
			var imageUrl = images[i].attribs.src;
			// if imageUrl is a right image's url
			if(imgUrlReg.test(imageUrl)&&
				imagesWillBeDownload.length<imageQueueLimit){
				// var imageUrl = 'https://www.fuhaodq.com/d/file/xiansheng/2014-12-12/1418371854103852.jpg';
				imagesWillBeDownload.push(imageUrl);
				// request(imageUrl)
				// .pipe(fs.createWriteStream(`${dist}${Date.now() + imageUrl.slice(-4)}`));
			}

			setTimeout(function(){
				lambda(images,++i);
			},imgInQueueSpace);
		}
	})(images,i);
	
}