var request = require('request');
var fs = require('fs')
var url = 'https://sf-sponsor.b0.upaiyun.com/e1979e5baf0ed8cd94ce7e657c3d0ac5.png';
request(url) 
        .on('error', function (err) { 
          console.log(err); 
        }) 
        .pipe(fs.createWriteStream("./images/fkjsal.png"));  //写入流