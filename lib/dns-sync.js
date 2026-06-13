'use strict';

var util = require('util'),
    path = require('path'),
    shell = require('shelljs'),
    debug = require('debug')('dns-sync');

// https://nodejs.org/api/dns.html#dns_dns_resolve_hostname_rrtype_callback
var RRecordTypes = [
    'A',
    'AAAA',
    'NS',
    'NAPTR',
    'CNAME',
    'SOA',
    'SRV',
    'PTR',
    'MX',
    'TXT',
    'ANY'];

/* RFC 1123: https://datatracker.ietf.org/doc/html/rfc1123
 * For a hostname to be valid:
 *   1. It needs to have less than 254 chars (255 - 1 for the omitted delimiter of root label)
 *   2. Each label should have less than 64 chars but less 63 for right-most label
 *   3. Labels are delimited by a period
 *   4. Labels start and end with alphanumeric but can have - in middle
 */
const validLabelPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
function isValidHostName(hostname) {
    if (typeof hostname !== 'string') return false;

    let cleanHostname = hostname.endsWith('.') ? hostname.slice(0, -1) : hostname;
    if (cleanHostname.length >= 254) return false;

    return cleanHostname
      .split('.')
      .every(label => validLabelPattern.test(label));
}
/**
 * Resolve hostname to IP address,
 * returns null in case of error
 */
module.exports = {
    lookup: function lookup(hostname) {
        return module.exports.resolve(hostname);
    },
    resolve: function resolve(hostname, type) {
        var nodeBinary = process.execPath;

        if (!isValidHostName(hostname)) {
            console.error('Invalid hostname:', hostname);
            return null;
        }
        if (typeof type !== 'undefined' && RRecordTypes.indexOf(type) === -1) {
            console.error('Invalid rrtype:', type);
            return null;
        }

        var scriptPath = path.join(__dirname, "../scripts/dns-lookup-script"),
            response,
            cmd = util.format('"%s" "%s" %s %s', nodeBinary, scriptPath, hostname, type || '');

        response = shell.exec(cmd, {silent: true});
        if (response && response.code === 0) {
            return JSON.parse(response.stdout);
        }
        debug('hostname', "fail to resolve hostname " + hostname);
        return null;
    }
};
