WNS
===
This fork enables custom path to audio file with:

```javascript
var wns = require('wns');

var channelUrl = '{url to your application notification channel}';
var options = {
	client_id: '{your Package Security Identifier}',
	client_secret: '{your Client Secret}'
	audio: '{ src : "ms-appx:///" + "path_to_audio_file" }'
};

wns.sendToastText02(channelUrl, 'Yes!', 'It worked!', clientOptions, function(error, result) {
	if (error)
		console.error(error);
	else
		console.log(result);
});
```