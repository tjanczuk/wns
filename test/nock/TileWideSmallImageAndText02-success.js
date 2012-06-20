exports.setupMockScopes = function (nock) { var scopes = []; var scope; scope = 
nock('https://login.live.com:443')
  .post('/accesstoken.srf', "grant_type=client_credentials&client_id=ms-app%3A%2F%2Fs-1-15-2-3004590818-3540041580-1964567292-460813795-2327965118-1902784169-2945106848&client_secret=N3icDsX5JXArJJR6AdTQZ86RITXQnMmA&scope=notify.windows.com")
  .reply(200, "{\"token_type\":\"bearer\",\"access_token\":\"EgAfAQMAAAAEgAAACoAAjIxGh75LDOuDqZiZIEHXTlkryn5A/7K43rTMFPSa8Pna1scigoESeS/fQAyakaKI67dZ9MP4gul5gCewShUvW4USjm8RSGCrkQbzkRlUk0jFIlJy9LUofJz9bOETi8sCV4hlJKEEhiYJAqj3SCMUrp7r6/AexWLw97nDKIy6pzWOAFoAjgAAAAAAys8LTMbn4E/G5+BP60gEABAAMTMxLjEwNy4xNzQuMjQ4AAAAAABeAG1zLWFwcDovL3MtMS0xNS0yLTMwMDQ1OTA4MTgtMzU0MDA0MTU4MC0xOTY0NTY3MjkyLTQ2MDgxMzc5NS0yMzI3OTY1MTE4LTE5MDI3ODQxNjktMjk0NTEwNjg0OAA=\"}", { 'cache-control': 'no-store',
  'content-length': '425',
  'content-type': 'application/json',
  server: 'Microsoft-IIS/7.5',
  ppserver: 'PPV: 30 H: BAYIDSLGN1S49 V: 0',
  date: 'Tue, 19 Jun 2012 20:57:42 GMT',
  connection: 'close' });
scopes.push(scope);scope = 
nock('https://bn1.notify.windows.com:443')
  .post('/?token=AgUAAACQRWJECxiyMVoNBsJefU%2bZypA7bASncWnSeSP9WA2zBXKnyb1%2fWUCg%2bTr7%2fspFEBK0b25eCDYgxdjVq%2bCoqqz6P68y6uLsnlnDtRbig9dzDWM30D5BNI7PmG7H7vsgCSU%3d', "<tile><visual><binding template=\"TileWideSmallImageAndText02\"><image id=\"1\" src=\"http://textParam1.com\" alt=\"http://textParam2.com\"/><text id=\"1\">http://textParam3.com</text><text id=\"2\">http://textParam4.com</text><text id=\"3\">http://textParam5.com</text><text id=\"4\">http://textParam6.com</text><text id=\"5\">http://textParam7.com</text></binding></visual></tile>")
  .reply(200, "", { 'content-length': '0',
  'x-wns-notificationstatus': 'received',
  'x-wns-msg-id': '52E69D693600457B',
  'x-wns-debug-trace': 'BN1WNS1011135',
  date: 'Tue, 19 Jun 2012 20:57:42 GMT' });
scopes.push(scope);return scopes; };