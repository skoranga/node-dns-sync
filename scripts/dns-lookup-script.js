'use strict';

var dns = require('dns'),
    debug = require('debug')('dns-sync');

for (var i = 0; i < process.argv.length; i++) {
	if (process.argv[i].indexOf('dns-lookup-script') >= 0) {
		var name = process.argv[i + 1];
		var type = process.argv[i + 2] || 'A';
	}
}

dns.resolve(name, type, function (err, ip) {
    if (err) {
        process.exit(1);
        debug(err);
    } else {
        debug(name, 'resolved to', ip);
        process.stdout.write(JSON.stringify(ip));
    }
});
