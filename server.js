var turbo = require('turboexpress');

var server = turbo({
	document_root:__dirname
})

server.start();