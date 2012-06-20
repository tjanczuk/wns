wns
===

Send push notifications from a node.js application to a Windows 8 device using [Windows Notification Services](http://msdn.microsoft.com/en-us/library/windows/apps/hh913756.aspx). 

This module helps you take care of the interaction #5 on the diagram below: 

<img src="http://i.msdn.microsoft.com/dynimg/IC554245.png"/>

## What you need

* Register your cloud service (web application) at https://manage.dev.live.com/build. Your application will be assigned a Package Security Identifier (SID) and Client Secret. These allow your web application to be authenticated to the Windows Notificaton Service.  
* A channel URL to send notifications to. This is normally created from within your Windows 8 application running on a particular device and securely passed to your web application. The channel URL uniquely identifies the instance of an application running on a particular device.  

## Your first notification

Install ```wns``` module with

```
npm install wns
```

Then send a notification to your Windows 8 application with

```
var wns = require('wns');

var channelUrl = '{url to your application's notification channel}';
var options = {
	client_id: '{your Package Security Identifier}',
	client_secret: '{your Client Secret}'	
};

wns.sendTileSquareBlock(channelUrl, 'Yes!', 'It worked!', options, function (error, result) {
	if (error)
		console.error(error);
	else
		console.log(result);
});
```

## Notification types

Windows Notification Service supports [tile](http://msdn.microsoft.com/en-us/library/windows/apps/hh761491.aspx), [toast](http://msdn.microsoft.com/en-us/library/windows/apps/hh761494.aspx) and [badge](http://msdn.microsoft.com/en-us/library/windows/apps/br212849.aspx) notification types. The ```wns``` module offers methods to send each type of notification. 

### Tile and toast notifications

For tile notifications, use one of the following methods:

* sendTileSquareBlock
* sendTileSquareText01
* sendTileSquareText02
* sendTileSquareText03
* sendTileSquareText04
* sendTileWideText01
* sendTileWideText02
* sendTileWideText03
* sendTileWideText04
* sendTileWideText05
* sendTileWideText06
* sendTileWideText07
* sendTileWideText08
* sendTileWideText09
* sendTileWideText10
* sendTileWideText11
* sendTileSquareImage
* sendTileSquarePeekImageAndText01
* sendTileSquarePeekImageAndText02
* sendTileSquarePeekImageAndText03
* sendTileSquarePeekImageAndText04
* sendTileWideImage
* sendTileWideImageCollection
* sendTileWideImageAndText01
* sendTileWideImageAndText02
* sendTileWideBlockAndText01
* sendTileWideBlockAndText02
* sendTileWideSmallImageAndText01
* sendTileWideSmallImageAndText02
* sendTileWideSmallImageAndText03
* sendTileWideSmallImageAndText04
* sendTileWideSmallImageAndText05
* sendTileWidePeekImageCollection01
* sendTileWidePeekImageCollection02
* sendTileWidePeekImageCollection03
* sendTileWidePeekImageCollection04
* sendTileWidePeekImageCollection05
* sendTileWidePeekImageCollection06
* sendTileWidePeekImageAndText01
* sendTileWidePeekImageAndText02
* sendTileWidePeekImage01
* sendTileWidePeekImage02
* sendTileWidePeekImage03
* sendTileWidePeekImage04
* sendTileWidePeekImage05
* sendTileWidePeekImage06

For toast notifications, use one of the following methods:

* sendToastText01
* sendToastText02
* sendToastText03
* sendToastText04
* sendToastImageAndText01
* sendToastImageAndText02
* sendToastImageAndText03
* sendToastImageAndText04

Each of the methods that send tile and toast notifications have two altenative parameter signatures:

```
sendXYZ(channel, payload, [options], [callback])
sendXYZ(channel, string1, string2, ..., [options], [callback])
```

In both cases the meaning of ```channel```, ```options```, and ```callback``` is the same:

* ```channel``` [required] - the notification channel URL of the target instance of a Windows 8 application.
* ```options``` [optional] - allows specifying web application credentials to authenticate the web application to Windows Notification Service. If this parameter is not specified, the ```WNS_CLIENT_ID``` environment variable must be set to the Package Security Identifier (SID), and the ```WNS_CLIENT_SECRET``` environment variable must be set to the Client Secret of the web application. 
  * ```client_id``` [optional] - Package Security Identifier (SID) or the web application. If absent, the value must be provided through ```WNS_CLIENT_ID``` environment variable.
  * ```client_secret``` [optional] - Client Secret of the web application. If absent, the value must be provided through the ```WNS_CLIENT_SECRET``` environment variable.
  * ```accessToken``` [optional] - OAuth access token to be used to send notifications. This is normally issued by Windows Notification Service during one of the prior calls to send a notification and passed to the applicaton through the ```callback``` parameter.
  * ```headers``` [optional] - any additional HTTP request headers to include in the request sent to Windows Notification Service. For a list of available HTTP request headers see [here](http://msdn.microsoft.com/en-us/library/windows/apps/hh465435.aspx).
* ```callback``` [optional] - a callback function that will be invoked with two parameters: (error, result), where only one is present at any time. The ```error``` parameter is an instance of ```Error``` while ```result``` is a regular object. Both contain the following members:
  * ```statusCode``` [optional] - the HTTP response status code from Windows Notification Service (for definitions see [here](http://msdn.microsoft.com/en-us/library/windows/apps/hh465435.aspx#send_notification_response)).
  * ```headers``` [optional] - the HTTP response headers (for WNS specific HTTP response headers see [here](http://msdn.microsoft.com/en-us/library/windows/apps/hh465435.aspx#send_notification_response)).
  * ```innerError``` [optional] - in case of an error this may contain more information about the condition.
  * ```newAccessToken``` [optional] - if a new OAuth access token had been obtained in the course of processing the request, it will be provided here. Subsequent calls to ```sendXYZ``` functions should specify this value in the ```options.accessToken``` field. 

The two ```sendXYZ``` method overrides differ in how notification parametrs are specified. Each kind of tile or toast notification contains a specific number of images and text fields. Each image is specified with two strings: its URL and its alternative text. Each text field is specified with just one string. 

The overload that accepts a sequence of ```string1, string2, ...``` parameters requires each of these parameters to be a string corresponding to an image or text field definition. The order of these fields must match the document order of a specific field in the [tile](http://msdn.microsoft.com/en-us/library/windows/apps/hh761491.aspx) or [toast](http://msdn.microsoft.com/en-us/library/windows/apps/hh761494.aspx) notification schema corresponding to the method name (e.g. ```sendTileSquarePeekImageAndText01``` requires a total of 6 parameters in that order: 1 to specify the image URL, 1 to specify the image alt text, and 4 simple text parameters). 

The overload that accepts the ```payload``` parameter requires that ```payload``` is an object. Fields of the object allow specification of image and text parameters using the following naming convention:

* ```image{N}src``` specifies the URL of the N-th image in document order, starting from 1
* ```image{N}alt``` specifies the alt text of the N-th image in document order, starting from 1
* ```text{N}``` specifies the value of the N-th text field in document order, starting from 1
* any parameters that are missing are assumed to be empty strings
* any extra parameters not required by a particular tile or toast template are ignored

For example:

```
var channel = '{channel_url}';
var currentAccessToken;

wns.sendTileSquarePeekImageAndText01(
	channel,
	{
		image1src: 'http://foobar.com/dog.jpg',
		image1alt: 'A dog',
		text1: 'This is a dog',
		text2: 'The dog is nice',
		text3: 'The dog bites',
		text4: 'Beware of dog'
	},
	{
		client_id: '{your Package Security Identifier}',
		client_secret: '{your Client Secret}',
		accessToken: currentAccessToken
	}, 
	function (error, result) {
		currentAccessToken = error ? error.newAccessToken : result.newAccessToken;
	});
```

### Badge notifications

To send a badge notification, use this method:

```
wns.sendBadge(channel, value, [options], [callback])
```

The meaning and behavior of ```channel```, ```options```, and ```callback``` is the same as for tile and toast notifications.

The ```value``` can be either a simple string or number, in which case it can assume values specified [here](http://msdn.microsoft.com/en-us/library/windows/apps/br212849.aspx), or it can be an object with 2 properties:

* ```value``` [required] - one of the values specified [here](http://msdn.microsoft.com/en-us/library/windows/apps/br212849.aspx).
* ```version``` [optional] - badge schema version (by default 1).

For example:

```
var channel = '{channel_url}';
wns.sendBadge(channel, 'alert');
```

### Low level notifications

There is one more method that allows sending pre-formatted notifiction messages that adhere to the tile, toast, or badge schema:

```
wns.send(channel, payload, type, [options], [callback])
```

 The caller takes responsibility for providing a pre-formatted string with XML of the notification as the ```payload``` parameter. The ```type``` parameter specifies the type of the notification as one of the string values specified [here](http://msdn.microsoft.com/en-us/library/windows/apps/hh465435.aspx#pncodes_x_wns_type).
 
## Running tests
 
Tests are using mocha and nock which are listed as dev dependencies. To run tests invoke mocha from the root of the repository:
 
```
mocha
```