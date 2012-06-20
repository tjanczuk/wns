exports.setupMockScopes = function (nock) { var scopes = []; var scope; scope = 
nock('https://login.live.com:443')
  .post('/accesstoken.srf', "grant_type=client_credentials&client_id=ms-app%3A%2F%2Fs-1-15-2-3004590818-3540041580-1964567292-460813795-2327965118-1902784169-2945106848&client_secret=N3icDsX5JXArJJR6AdTQZ86RITXQnMmA&scope=notify.windows.com")
  .reply(200, "{\"token_type\":\"bearer\",\"access_token\":\"EgAfAQMAAAAEgAAACoAAVK34limO7zw8H7NUzJI2DjseS17VfM0qqMaB17qYvl6IzE2/18YiPJMkaQo1vO1V6SvYJc+462pT17aMZEcUMb9r8saPrB0xZWS+QiYhxNhcniS9tFUMimS97iMdLFIkNSFpD6dvBoLWFTw7FdA4cnx4r7zT+kaOa7EQ5o0H3w6OAFoAjgAAAAAAys8LTJ3m4E+d5uBP60gEABAAMTMxLjEwNy4xNzQuMjQ4AAAAAABeAG1zLWFwcDovL3MtMS0xNS0yLTMwMDQ1OTA4MTgtMzU0MDA0MTU4MC0xOTY0NTY3MjkyLTQ2MDgxMzc5NS0yMzI3OTY1MTE4LTE5MDI3ODQxNjktMjk0NTEwNjg0OAA=\"}", { 'cache-control': 'no-store',
  'content-length': '425',
  'content-type': 'application/json',
  server: 'Microsoft-IIS/7.5',
  ppserver: 'PPV: 30 H: BAYIDSLGN1Q23 V: 0',
  date: 'Tue, 19 Jun 2012 20:52:44 GMT',
  connection: 'close' });
scopes.push(scope);scope = 
nock('https://bn1.notify.windows.com:443')
  .post('/?token=AgUAAACQRWJECxiyMVoNBsJefU%2bZypA7bASncWnSeSP9WA2zBXKnyb1%2fWUCg%2bTr7%2fspFEBK0b25eCDYgxdjVq%2bCoqqz6P68y6uLsnlnDtRbig9dzDWM30D5BNI7PmG7H7vsgCSU%3d', "<tile><visual><binding template=\"TileWideText11\"><text id=\"1\">http://textParam1.com</text><text id=\"2\">http://textParam2.com</text><text id=\"3\">http://textParam3.com</text><text id=\"4\">http://textParam4.com</text><text id=\"5\">http://textParam5.com</text><text id=\"6\">http://textParam6.com</text><text id=\"7\">http://textParam7.com</text><text id=\"8\">http://textParam8.com</text><text id=\"9\">http://textParam9.com</text><text id=\"10\">http://textParam10.com</text></binding></visual></tile>")
  .reply(200, "", { 'content-length': '0',
  'x-wns-notificationstatus': 'received',
  'x-wns-msg-id': '3CA9943314B69BF',
  'x-wns-debug-trace': 'BN1WNS1011135',
  date: 'Tue, 19 Jun 2012 20:52:45 GMT' });
scopes.push(scope);return scopes; };