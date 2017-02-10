'use strict'
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var colors = require('colors');
var port = 1024;
var cache = {};

function send404(res){
	var html404 = `
		<style>body{text-align:center}</style>
		<h1>Error 404, source not found!</h1>
		<p>please check the url you typed.</p>
		<hr>
	`;
	res.writeHead('404', {'Content-Type': 'text/html'});
	res.end(html404);
}
// 发送响应数据
function sendData(res, content_type, data){
	res.writeHead('200', {'Content-Type': content_type});
	res.end(data);
}

function sendFile(res, filepath){
	var base_url = '.';
	console.log(`\n请求 ${filepath} received!`.green);
	filepath = (filepath === '/' || filepath === '/index.html') ? ('./index.html') : (base_url + filepath);
	// 充分利用缓存
	if(cache[filepath]){
		sendData(res, cache[filepath+'_content_type'], cache[filepath]);
		return;
	}
	// 读取本地静态文件
	fs.readFile(filepath, function(err, data){
		if(err){
			console.log(`读取本地静态文件${filepath}出错`.red);
			send404(res);
		}else{
			cache[filepath] = data;
			cache[filepath+'_content_type'] = mime.lookup(path.basename(filepath));
			console.log(`正在发送 ${filepath} ……`.yellow);
			sendData(res, cache[filepath+'_content_type'], data);
		}
	});
}

http.createServer(function(req, res){
	var filepath = req.url;
	sendFile(res, filepath);
}).listen(port);
console.log(`Server running at http://localhost:${port}/`.green);
