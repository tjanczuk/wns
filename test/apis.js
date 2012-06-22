var wns = require('../lib/wns.js')
	, assert = require('assert');

// normalize test APIs between TDD and BDD
if (!global.describe) {
	describe = suite;
	it = test;
}

describe('wns.send', function () {
	it('fails without parameters', function () {
		assert.throws(
			wns.send,
			/The channel parameter must be the channel URI string/
		);
	});

	it ('fails with wrong channel type', function () {
		assert.throws(
			function () { wns.send({}) },
			/The channel parameter must be the channel URI string/
		);
	});

	it ('fails without payload', function () {
		assert.throws(
			function () { wns.send('http://foo') },
			/The payload parameter must be the notification payload string/
		);
	});	

	it ('fails with wrong payload type', function () {
		assert.throws(
			function () { wns.send('http://foo') },
			/The payload parameter must be the notification payload string/
		);
	});	

	it ('fails without type', function () {
		assert.throws(
			function () { wns.send('http://foo', 'payload') },
			/The type parameter must specify the notification type/
		);
	});	

	it ('fails with wrong payload type', function () {
		assert.throws(
			function () { wns.send('http://foo', 'payload') },
			/The type parameter must specify the notification type/
		);
	});		

	it ('fails without credentials', function () {
		assert.throws(
			function () { wns.send('http://foo', 'payload', 'wns/tile'); },
			/The options.client_id and options.client_secret must be specified as strings/
		);
	});		

	it ('fails with wrong callback type', function () {
		assert.throws(
			function () { wns.send('http://foo', 'payload', 'wns/tile', { client_id: 'foo', client_secret: 'bar' }, {}); },
			/The callback parameter, if specified, must be the callback function/
		);
	});				
});

describe('wns.sendBadge', function () {
	it('fails without parameters', function () {
		assert.throws(
			wns.sendBadge,
			/The badge value must be a string or a number/
		);
	});

	it ('fails with wrong channel type', function () {
		assert.throws(
			function () { wns.sendBadge({}) },
			/The badge value must be a string or a number/
		);
	});

	it ('fails without value', function () {
		assert.throws(
			function () { wns.sendBadge('http://foo') },
			/The badge value must be a string or a number/
		);
	});	

	it ('fails with too large integer value type', function () {
		assert.throws(
			function () { wns.sendBadge('http://foo', 1000) },
			/The badge numeric value must be in the 1-99 range/
		);
	});	

	it ('fails with too small integer value type', function () {
		assert.throws(
			function () { wns.sendBadge('http://foo', -1) },
			/The badge numeric value must be in the 1-99 range/
		);
	});	

	it ('fails with invalid string value type', function () {
		assert.throws(
			function () { wns.sendBadge('http://foo', 'foobar') },
			/The badge value must be either an integer in the 1-99 range or one of/
		);
	});	

	it ('fails without credentials', function () {
		assert.throws(
			function () { wns.sendBadge('http://foo', 'alert'); },
			/The options.client_id and options.client_secret must be specified as strings/
		);
	});		

	it ('fails with wrong callback type', function () {
		assert.throws(
			function () { wns.sendBadge('http://foo', 'alert', { client_id: 'foo', client_secret: 'bar' }, {}); },
			/The callback parameter, if specified, must be the callback function/
		);
	});
});

describe('wns.sendTileWideImageAndText01', function () {
	it('fails without parameters', function () {
		assert.throws(
			wns.sendTileWideImageAndText01,
			/The channel parameter must be the channel URI string/
		);
	});

	it ('fails with wrong channel type', function () {
		assert.throws(
			function () { wns.sendTileWideImageAndText01({}) },
			/The channel parameter must be the channel URI string/
		);
	});

	it ('fails without values', function () {
		assert.throws(
			function () { wns.sendTileWideImageAndText01('http://foo') },
			/The TileWideImageAndText01 WNS notification type requires 3 text parameters to be specified/
		);
	});	

	it ('fails with too few values', function () {
		assert.throws(
			function () { wns.sendTileWideImageAndText01('http://foo', 'a', 'b') },
			/The TileWideImageAndText01 WNS notification type requires 3 text parameters to be specified/
		);
	});	

	it ('fails with wrong value types', function () {
		assert.throws(
			function () { wns.sendTileWideImageAndText01('http://foo', 'a', {}) },
			/The TileWideImageAndText01 WNS notification type requires 3 text parameters to be specified/
		);
	});			

	it ('fails without credentials', function () {
		assert.throws(
			function () { wns.sendTileWideImageAndText01('http://foo', {}); },
			/The options.client_id and options.client_secret must be specified as strings/
		);
	});		

	it ('fails with wrong callback type', function () {
		assert.throws(
			function () { wns.sendTileWideImageAndText01('http://foo', {}, { client_id: 'foo', client_secret: 'bar' }, {}); },
			/The callback parameter, if specified, must be the callback function/
		);
	});
});
