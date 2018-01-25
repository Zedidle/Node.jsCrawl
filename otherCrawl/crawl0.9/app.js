/** 
 * Created by Administrator on 2017/7/8. 
 */ 
var fs = require('fs'); 
var request = require("request"); 
var cheerio = require("cheerio"); 
var async = require('async'); 

//目标网址(域名) 
var url = 'http://xyzh.yau.edu.cn'; 


//本地存储目录 
var dir = './images1'; 
var setting = require('./setting'); 
var timeout = 100; 



// 封装了一层函数 
function fetchre(url) { 
  requestall(url); 
} 


//发送请求 
function requestall(url) { 
  request({ 
    uri: url, 
    headers: setting.header 
  }, function (error, response, body) { 
    if (error) { 
      console.log(error); 
    } else { 
      console.log(response.statusCode); 
      if (!error && response.statusCode == 200) { 
        var $ = cheerio.load(body); 
        var photos = []; 
        $('img').each(function () { 
// 判断地址是否存在 
          if ($(this).attr('src')) { 
            var src = $(this).attr('src'); 
            var end = src.substr(-4, 4).toLowerCase();   //也就是扩展名
            if (end == '.jpg' || end == '.png' ) { 
              if (IsURL(src)) { 
                photos.push(src); 
              } 
            } 
          } 
        }); 
        downloadImg(photos, dir, setting.download_v); 

        // 利用href递归爬虫,每一层递归都会赋予一个新的下载时间
        $('a').each(function () { 
          var murl = $(this).attr('href'); 
          // console.log(murl)
          if (IsURL(murl)) { 
            setTimeout(function () { 
            fetchre(murl); 
            }, timeout); 
            timeout += setting.ajax_timeout; 
          } else { 
            setTimeout(function () { 
            	console.log(murl)
              //设置各种递归情况    
              if(isNull(murl)){
                //排除无效链接
                return;
              }else if(isHttp(murl)){  
                let mark = 0;
                for(let i=0;i<murl.length;i++){
                  if(murl[i]==='/'){
                    mark+=1;
                    if(mark>=3){
                      fetchre(murl.substr(0,i+1));   //如果是以http开头的http,分层连接
                    }
                  }
                }
              }else{
                //以开始的域名作为根目录的情况进行递归
                fetchre(url +'/'+ murl);
              }
            }, timeout); 
            timeout += setting.ajax_timeout; 
          }
        }) 
      } 
    } 
  }); 

} 

// 下载图片 
function downloadImg(photos, dir, asyncNum) { 
  // console.log("即将异步并发下载图片，当前并发数为:" + asyncNum); 
  async.mapLimit(photos, asyncNum, function (photo, callback) { 
    var filename = (new Date().getTime()) + photo.substr(-4, 4);   //substr(-4,4)就是扩展名
    if (filename) { 
      console.log('正在下载' + photo); 
      // 默认 
      // 防止pipe错误 
      request(photo) 
        .on('error', function (err) { 
          console.log(err); 
        }) 
        .pipe(fs.createWriteStream(dir + "/" + filename)); 
      console.log('下载完成'); 
      callback(null, filename); 
    } 
  }, function (err, result) { 
 if (err) { 
  console.log(err); 
    } else { 
      console.log(" all right ! "); 
      // console.log(result); 
    } 
  }) 
} 

// 判断是否为完整地址 
function IsURL(str_url) { 
  var strRegex = '^((https|http|ftp|rtsp|mms)?://)'; 
  var re = new RegExp(strRegex); 
  if (re.test(str_url)) { 
    return (true); 
  } else { 
    return (false); 
  } 
}
//判断是否为无效链接
function isNull(murl){
  if(murl===undefined||murl.substr(0,11)==='javascript:'||murl==='#'||murl==='/'||murl.substr(0,2)==='..'){
    return true;
  }else{
    return false;
  }
}
//判断是否以http开头
function isHttp(murl){
  if(murl.substr(0,4)=='http'){
    return true;
  }else{
    return false;
  }
}

requestall(url); 