var https = require('https')
	, util = require('util')
	, url = require('url');

// This is a map from client_secret:client_id to an array of notifications awaiting an accessToken to be issued by WNS
// for sending notifications on behalf of the application associated with that credential pair.
// If there are no pending notifications, the client_secret:client_id entry in this map is 'undefined'.

var pendingNotifications = {};

// maps template name to the number of image elements and text elements it requries
// based on tile notification templates from http://msdn.microsoft.com/en-us/library/windows/apps/hh761491.aspx
// and toast notification templates from http://msdn.microsoft.com/en-us/library/windows/apps/hh761494.aspx

var templateSpecs = {
	TileSquareBlock: [0, 2],
	TileSquareText01: [0, 4],
	TileSquareText02: [0, 2],
	TileSquareText03: [0, 4],
	TileSquareText04: [0, 1],
	TileWideText01: [0, 5],
	TileWideText02: [0, 9],
	TileWideText03: [0, 1],
	TileWideText04: [0, 1],
	TileWideText05: [0, 5],
	TileWideText06: [0, 10],
	TileWideText07: [0, 9],
	TileWideText08: [0, 10],
	TileWideText09: [0, 2],
	TileWideText10: [0, 9],
	TileWideText11: [0, 10],
	TileSquareImage: [1, 0],
	TileSquarePeekImageAndText01: [1, 4],
	TileSquarePeekImageAndText02: [1, 2],
	TileSquarePeekImageAndText03: [1, 4],
	TileSquarePeekImageAndText04: [1, 1],
	TileWideImage: [1, 0],
	TileWideImageCollection: [5, 0],
	TileWideImageAndText01: [1, 1],
	TileWideImageAndText02: [1, 2],
	TileWideBlockAndText01: [0, 6],
	TileWideBlockAndText02: [0, 3],
	TileWideSmallImageAndText01: [1, 1],
	TileWideSmallImageAndText02: [1, 5],
	TileWideSmallImageAndText03: [1, 1],
	TileWideSmallImageAndText04: [1, 2],
	TileWideSmallImageAndText05: [1, 2],
	TileWidePeekImageCollection01: [5, 2],
	TileWidePeekImageCollection02: [5, 5],
	TileWidePeekImageCollection03: [5, 1],
	TileWidePeekImageCollection04: [5, 1],
	TileWidePeekImageCollection05: [6, 2],
	TileWidePeekImageCollection06: [6, 1],
	TileWidePeekImageAndText01: [1, 1],
	TileWidePeekImageAndText02: [1, 5],
	TileWidePeekImage01: [1, 2],
	TileWidePeekImage02: [1, 5],
	TileWidePeekImage03: [1, 1],
	TileWidePeekImage04: [1, 1],
	TileWidePeekImage05: [2, 2],
	TileWidePeekImage06: [2, 1],
	ToastText01: [0, 1],
	ToastText02: [0, 2],
	ToastText03: [0, 2],
	ToastText04: [0, 3],
	ToastImageAndText01: [1, 1],
	ToastImageAndText02: [1, 2],
	ToastImageAndText03: [1, 2],
	ToastImageAndText04: [1, 3]
};

// WNS response codes from http://msdn.microsoft.com/en-us/library/windows/apps/hh465435.aspx#send_notification_response

var responseCodes = {
	400: 'One or more headers were specified incorrectly or conflict with another header.',
	401: 'The cloud service did not present a valid authentication ticket. The OAuth ticket may be invalid.',
	403: 'The cloud service is not authorized to send a notification to this URI even though they are authenticated.',
	404: 'The channel URI is not valid or is not recognized by WNS.',
	405: 'Invalid method (GET, DELETE, CREATE); only POST is allowed.',
	406: 'The cloud service exceeded its throttle limit.',
	410: 'The channel expired.',
	413: 'The notification payload exceeds the 5000 byte size limit.',
	500: 'An internal failure caused notification delivery to fail.',
	503: 'The server is currently unavailable.'
};

// valid badge values from http://msdn.microsoft.com/en-us/library/windows/apps/br212849.aspx

var badges = ['none','activity','alert','available','away','busy','newMessage','paused','playing','unavailable','error'];

// valid notification types from http://msdn.microsoft.com/en-us/library/windows/apps/hh465435.aspx

var types = ['wns/toast', 'wns/badge', 'wns/tile', 'wns/raw'];

// valid toast audio sources from http://msdn.microsoft.com/en-us/library/windows/apps/br230842.aspx

var audioSourcePrefix = 'ms-winsoundevent:Notification.';
var audioSources = [
	'Default',
	'IM',
	'Mail',
	'Reminder',
	'SMS',
	'Alarm',
	'Looping.Alarm2',
	'Looping.Call',
	'Looping.Call2'
];

// toast durations from http://msdn.microsoft.com/en-us/library/windows/apps/br230846.aspx

var durations = [ 'long', 'short' ];

// creates a tile or a toast request template given the number of image and text entries in the template
// this is a private method that controls its inputs and does not need any XML escaping.

var createTemplate = function (type, name, imageCount, textCount) {
	// contains placeholder for optional attributes
	var template = '<' + type + '%s><visual><binding template="' + name + '">';
	for (var i = 0; i < imageCount; i++)
		template += '<image id="' + (i + 1) + '" src="%s" alt="%s"/>';
	for (var i = 0; i < textCount; i++)
		template += '<text id="' + (i + 1) + '">%s</text>';
	// contains placeholder for optional <audio> element
	template += '</binding></visual>%s</' + type + '>';

	return template;
};

var onError = function (context, error) {
	if (context.callback)
		context.callback(error);
}

var releasePendingNotifications = function (context, error) {
	var key = getClientKey(context);
	var pendingContexts = pendingNotifications[key];
	delete pendingNotifications[key];
	if (error) 
		pendingContexts.forEach(function (item) {
			onError(item, error);
		});
	else 
		pendingContexts.forEach(function (item) {
			item.newAccessToken = context.newAccessToken;
			sendNotificationNow(item);
		});
}

var getClientKey = function (context) {
	return context.options.client_secret + ':' + context.options.client_id;
};

var obtainAccessToken = function (context) {

	// queue up the context until the accessToken is obtained

	var key = getClientKey(context);
	if (pendingNotifications[key]) {
		pendingNotifications[key].push(context);
		return;
	}
	else
		pendingNotifications[key] = [ context ];

	// construct x-www-form-urlencoded payload for OAuth accessToken request

	var payload = url.format({
		query: {
			grant_type: 'client_credentials',
			client_id: context.options.client_id,
			client_secret: context.options.client_secret,
			scope: 'notify.windows.com'
		}
	}).substring(1); // strip leading ?

	// make the request for accessToken to live.com 

	var options = {
		host: 'login.live.com',
		path: '/accesstoken.srf',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': payload.length
		}
	};

	var completed;
	var req = https.request(options, function (res) {
		var body = '';
		res.on('data', function (chunk) { body += chunk; });
		res.on('end', function () {
			if (!completed) {
				completed = true;
				if (res.statusCode === 200) {
					var tokenResponse;
					try {
						tokenResponse = JSON.parse(body);
						if (typeof tokenResponse.access_token !== 'string' || tokenResponse.token_type !== 'bearer')
							throw new Error('Invalid response');
					}
					catch (e) {
						var error = new Error('Unable to obtain access token for WNS. Invalid response body: ' + body);
						error.statusCode = res.statusCode;
						error.headers = res.headers;
						error.innerError = e;
						return releasePendingNotifications(context, error);
					}

					context.newAccessToken = tokenResponse.access_token;
					releasePendingNotifications(context);
				}
				else {
					var error = new Error('Unable to obtain access token for WNS. HTTP status code: ' + res.statusCode
						+ '. HTTP response body: ' + body);
					error.statusCode = res.statusCode;
					error.headers = res.headers;
					error.innerError = body;
					releasePendingNotifications(context, error);
				}
			}
		});
	});

	req.on('error', function (error) {
		if (!completed) {
			completed = true;
			var result = new Error('Unable to send reqeust for access token to Windows Notification Service: ' + error.message);
			result.innerError = error;
			releasePendingNotifications(context, result);
		}
	});

	req.write(payload);
	req.end();
};

var sendNotificationNow = function (context) {
	var accessToken = context.newAccessToken || context.options.accessToken;
	var channelUrl = url.parse(context.channel);

	// contruct the request to WNS

	var options = {
		hostname: channelUrl.hostname,
		path: channelUrl.path,
		method: 'POST',
		headers: {
			'Content-Type': 'text/xml',
			'Content-Length': Buffer.byteLength(context.payload, 'utf8'),
			'X-WNS-Type': context.type,
			'Authorization': 'Bearer ' + accessToken
		}
	};

	// add or override headers

	if (typeof context.options.headers === 'object') {
		for (var h in context.options.headers)
			options.headers[h] = context.options.headers[h];
	}

	// send the request

	var completed;
	var req = https.request(options, function (res) {
		var body = '';
		res.on('data', function (chunk) { body += chunk; });
		res.on('end', function () {
			if (!completed) {
				completed = true;
				if (context.callback) {

					var setDataOnResult = function (result) {
						result.headers = res.headers;
						result.statusCode = res.statusCode;
						result.newAccessToken = context.newAccessToken;
					};

					if (res.statusCode === 200 && res.headers['x-wns-notificationstatus'] === 'received') {
						
						// success

						var result = {};
						setDataOnResult(result);
						context.callback(null, result);
					}
					else if (res.statusCode === 401 && !context.newAccessToken) {
						
						// accessToken may have expired - try once to obtain a new one

						obtainAccessToken(context);
					}
					else {

						// failure

						var result = new Error(responseCodes[res.statusCode] 
							|| ('Windows Notification Service returned HTTP status code ' + res.statusCode
								+ ' with x-wns-notificationstatus value of ' + res.headers['x-wns-notificationstatus']));
						setDataOnResult(result);
						context.callback(result);
					}
				}
			}
		});
	});

	req.on('error', function (error) {
		if (!completed) {
			completed = true;
			var result = new Error('Unable to send HTTPS request to Windows Notification Service: ' + error.message);
			result.innerError = error;
			onError(context, result);
		}
	});

	req.write(context.payload);
	req.end();
};

var sendNotification = function (context) {
	// if accessToken is in the process of being obtained, queue up the notification for later processing
	// otherwise send the notification now

	var key = getClientKey(context);
	if (pendingNotifications[key])
		pendingNotifications[key].push(context);
	else
		sendNotificationNow(context);
};

// Low level API to send any pre-formatted string notification payload to a WNS channel
// signature: (channel, payload, type, [options], [callback])
// channel - [required] channel URI to send notification to
// payload - [required] string payload to send (XML)
// type - [required] WNS notification type (one of wns/tile, wns/badge, wns/toast, and wns/raw)
// options - [optional] credentials for calling WNS; if absent, WNS_CLIENT_ID and WNS_CLIENT_SECRET environement
// 		     variables must be set
// options.client_id - [optional] client_id of the application registered with WNS; if absent, WNS_CLIENT_ID
//			 environement variable must be set
// options.client_secret - [optional] client_secret of the application registered with WNS; if absent, WNS_CLIENT_SECRET
//			 environment variable must be set
// options.accessToken - [optional] access token to use against WNS
// options.headers - [optional] HTTP headers to add to the WNS notification request
// callback - [optional] function (error, data); data.newAccessToken contains new access token if one was obtained 
exports.send = function () {
	var channel = Array.prototype.shift.apply(arguments);
	var payload = Array.prototype.shift.apply(arguments);
	var type = Array.prototype.shift.apply(arguments);
	var options = typeof arguments[0] === 'object' ? Array.prototype.shift.apply(arguments) : {};
	var callback = arguments[0];

	if (!options.client_id)
		options.client_id = process.env.WNS_CLIENT_ID;

	if (!options.client_secret)
		options.client_secret = process.env.WNS_CLIENT_SECRET;

	if (typeof options.accessToken !== 'string' && typeof options.accessToken !== 'undefined')
		throw new Error('If options.accessToken is specified, it must be a string.');

	if (typeof channel !== 'string') 
		throw new Error('The channel parameter must be the channel URI string.');

	if (typeof payload !== 'string') 
		throw new Error('The payload parameter must be the notification payload string.');

	if (!types.some(function (item) { return type === item; }))
		throw new Error('The type parameter must specify the notification type. The value of ' + type 
			+ ' is not in the set of valid value types: ' + JSON.stringify(types));

	if (typeof options.client_secret !== 'string' || typeof options.client_id !== 'string')
		throw new Error('The options.client_id and options.client_secret must be specified as strings '
			+ 'or the WNS_CLIENT_ID and WNS_CLIENT_ID environment variables must be set.');

	if (callback && typeof callback !== 'function')
		throw new Error('The callback parameter, if specified, must be the callback function.');

	var context = {
		options: options,
		channel: channel,
		payload: payload,
		callback: callback,
		type: type
	};

	if (options.accessToken)
		sendNotification(context);
	else
		obtainAccessToken(context);
};

// Send a badge to a WNS channel
// signature: (channel, value, [options], [callback])
// channel - [required] channel URI to send notification to
// value - [required] string identifier of the badge, 1-99 numeric badge, or an object with value.value and value.version
// value.value - string identifier of the badge, 1-99 numeric badge
// value.version - [optional] badge schema version
// callback - [optional] function (error, data); data.newAccessToken contains new access token if one was obtained 
// options - [optional] credentials for calling WNS; if absent, WNS_CLIENT_ID and WNS_CLIENT_SECRET environement
// 		     variables must be set
// options.client_id - [optional] client_id of the application registered with WNS; if absent, WNS_CLIENT_ID
//			 environement variable must be set
// options.client_secret - [optional] client_secret of the application registered with WNS; if absent, WNS_CLIENT_SECRET
//			 environment variable must be set
// options.accessToken - [optional] access token to use against WNS
// options.headers - [optional] HTTP headers to add to the WNS notification request
exports.sendBadge = function () {
	var channel = Array.prototype.shift.apply(arguments);
	var value = Array.prototype.shift.apply(arguments);
	var options = typeof arguments[0] === 'object' ? Array.prototype.shift.apply(arguments) : {};
	var callback = arguments[0];

	var realValue;
	var realVersion;

	if (typeof value === 'object') {
		realValue = value.value;
		realVersion = value.version || 1;
	}
	else {
		realValue = value;
		realVersion = 1;
	}

	if (typeof realValue !== 'string' && isNaN(realValue)) 
		throw new Error('The badge value must be a string or a number.');

	if (!isNaN(realValue)) {
		if (realValue < 1 || realValue > 99)
			throw new Error('The badge numeric value must be in the 1-99 range.');
	}
	else if (!badges.some(function (badge) { return badge === realValue; })) 
		throw new Error('The badge value must be either an integer in the 1-99 range or one of '  
			+ JSON.stringify(badges));

	var badge = '<badge value="' + realValue + '" version="' + realVersion + '"/>';

	return exports.send(channel, badge, 'wns/badge', options, callback);
}

var createAudio = function (type, options) {
	if (type !== 'toast' || typeof options.audio !== 'object')
		return '';

	if (typeof options.audio.loop !== 'boolean' && typeof options.audio.loop !== 'undefined')
		throw new Error('The options.audio.loop must be a boolean value.');

	if (typeof options.audio.silent !== 'boolean' && typeof options.audio.silent !== 'undefined')
		throw new Error('The options.audio.silent must be a boolean value.');

	if (typeof options.audio.src === 'string') {
		if (!audioSources.some(function (src) {
			return src === options.audio.src || (audioSourcePrefix + src) === options.audio.src;
		}))
			throw new Error('The options.audio.src must be a string value from the following set: '
			+ JSON.stringify(audioSources));
	}
	else if (typeof options.audio.silent !== 'undefined')
		throw new Error('The options.audio.src must be a string value from the following set: '
			+ JSON.stringify(audioSources));

	var result = '<audio';
	if (options.audio.src)
		result += ' src="' 
				+ (options.audio.src.indexOf(audioSourcePrefix) === 0 ? options.audio.src : audioSourcePrefix + options.audio.src) 
				+ '"';
	if (options.audio.silent)
		result += ' silent="' + options.audio.silent + '"';
	if (options.audio.loop)
		result += ' loop="' + options.audio.loop + '"';
	result += '/>';

	return result;
};

var xmlEscape = function (text) {
	return text.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;');	
}

var createToastAttributes = function (type, options) {
	if (type !== 'toast')
		return '';

	if (typeof options.launch !== 'string' && typeof options.launch !== 'undefined')
		throw new Error('The options.launch must be a string value.');

	if (typeof options.duration === 'string') {
		if (!durations.some(function (duration) {
			return duration === options.duration;
		}))
			throw new Error('The options.duration must be a string value from the following set: '
			+ JSON.stringify(durations));
	}
	else if (typeof options.duration !== 'undefined')
		throw new Error('The options.duration must be a string value from the following set: '
			+ JSON.stringify(durations));

	if (!options.duration && !options.launch)
		return '';

	var result = '';
	if (options.duration)
		result += ' duration="' + options.duration + '"';
	if (options.launch)
		result += ' launch="' + xmlEscape(options.launch) + '"';

	return result;
};

// compile the 'templateSpecs' into method for sending tile and toast notications of the form exports.send{templateName}

for (var item in templateSpecs) {
	(function () {
		var templateName = item;
		var templateSpec = templateSpecs[templateName];
		var type = templateName.indexOf('Tile') === 0 ? 'tile' : 'toast';
		var imageCount = templateSpec[0];
		var textCount = templateSpec[1];
		var template = createTemplate(type, templateName, imageCount, textCount);
		
		exports['send' + templateName] = function () {
			// signature is (channel, [payload, ]*, [options], [callback])

			var channel = Array.prototype.shift.apply(arguments);			

			if (typeof channel !== 'string') 
				throw new Error('The channel parameter must be the channel URI string.');

			// determine notification template parameters

			var params = []; 
			if (typeof arguments[0] === 'object') {
				// parameters are provided as an object; use property naming conventions to convert 
				// to a parameter array; e.g. 
				// {
				//		image1src: 'http://....',
				//		image1alt: 'Picture of a barking dog',
				//		image2src: 'http://....',
				//		image2alt: 'A bone',
				// 	    text1: 'First text entry',
				//      text2: 'Second text entry'
				// }
				
				var payload = Array.prototype.shift.apply(arguments);

				for (var i = 1; i <= imageCount; i++) {
					var src = payload['image' + i + 'src'];
					var alt = payload['image' + i + 'alt'];
					if (typeof src !== 'undefined' && typeof src !== 'string')
						throw new Error('The image' + i + 'src property of the payload argument must be a string.');
					if (typeof alt !== 'undefined' && typeof alt !== 'string')
						throw new Error('The image' + i + 'alt property of the payload argument must be a string.');

					params.push(src || '');
					params.push(alt || '');
				}

				for (var i = 1; i <= textCount; i++) {
					var text = payload['text' + i];
					if (typeof text !== 'undefined' && text !== null && typeof text !== 'string')
						text = text.toString();

					params.push(text || '');
				}
			}
			else {
				// assume parameters are provided as atomic, string arguments of the function call

				while (typeof arguments[0] === 'string') 
					params.push(Array.prototype.shift.apply(arguments));
			}

			var options = typeof arguments[0] === 'object' ? Array.prototype.shift.apply(arguments) : {};
			var callback = arguments[0];

			// validate required number of parameters was specified

			if (params.length !== (textCount + imageCount * 2))
				throw new Error('The ' + templateName + ' WNS notification type requires ' + (textCount + imageCount * 2)
					+ ' text parameters to be specified (' + imageCount + ' image(s) that require href and alt text each, and '
					+ textCount + ' text field(s)), while only ' + params.length + ' parameter(s) have been provided.');

			// XML escape text parameters and construct payload from template

			var xmlEscapedParams = [ template, '' ]; // placeholder for optional attributes of the type element

			params.forEach(function (text) {
			    xmlEscapedParams.push(xmlEscape(text));
			});

			// add optional audio element (without XML escaping since it is XML)

			xmlEscapedParams.push(createAudio(type, options));

			// add optional toast attributes

			xmlEscapedParams[1] = createToastAttributes(type, options);

			var payload = util.format.apply(this, xmlEscapedParams);

			// send notification

			return exports.send(channel, payload, 'wns/' + type, options, callback);
		};
	})();
}