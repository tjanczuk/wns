exports.setupMockScopes = function (nock) { var scopes = []; var scope; scope = 
nock('https://login.live.com:443')
  .post('/accesstoken.srf', "grant_type=client_credentials&client_id=ms-app%3A%2F%2Fs-1-15-2-3004590818-3540041580-1964567292-460813795-2327965118-1902784169-2945106848&client_secret=N3icDsX5JXArJJR6AdTQZ86RITXQnMmA&scope=notify.windows.com")
  .reply(200, "{\"token_type\":\"bearer\",\"access_token\":\"EgAfAQMAAAAEgAAACoAAtJomBMBbaiT05C+Wb9Q9SY/9YiEMUGrrucn1UAo90MArx2GNtVNSMOu+J5jgNkkM2fknfcWgH9AlvHBHpeE7+IImyn5qii1sMwo71Ftr5pBThYyTG8I/eXliJ5u+K1n0RxNVSBdJsi73ikO/uEeCUXEIm4lEzoyRED31bT1gG9eOAFoAjgAAAAAAys8LTC7m4E8u5uBP60gEABAAMTMxLjEwNy4xNzQuMjQ4AAAAAABeAG1zLWFwcDovL3MtMS0xNS0yLTMwMDQ1OTA4MTgtMzU0MDA0MTU4MC0xOTY0NTY3MjkyLTQ2MDgxMzc5NS0yMzI3OTY1MTE4LTE5MDI3ODQxNjktMjk0NTEwNjg0OAA=\"}", { 'cache-control': 'no-store',
  'content-length': '425',
  'content-type': 'application/json',
  server: 'Microsoft-IIS/7.5',
  ppserver: 'PPV: 30 H: BAYIDSLGN1Q52 V: 0',
  date: 'Tue, 19 Jun 2012 20:50:54 GMT',
  connection: 'close' });
scopes.push(scope);scope = 
nock('https://bn1.notify.windows.com:443')
  .post('/?token=AgUAAACQRWJECxiyMVoNBsJefU%2bZypA7bASncWnSeSP9WA2zBXKnyb1%2fWUCg%2bTr7%2fspFEBK0b25eCDYgxdjVq%2bCoqqz6P68y6uLsnlnDtRbig9dzDWM30D5BNI7PmG7H7vsgCSU%3d', "<tile><visual><binding template=\"TileWideText07\"><text id=\"1\">http://textParam1.com</text><text id=\"2\">http://textParam2.com</text><text id=\"3\">http://textParam3.com</text><text id=\"4\">http://textParam4.com</text><text id=\"5\">http://textParam5.com</text><text id=\"6\">http://textParam6.com</text><text id=\"7\">http://textParam7.com</text><text id=\"8\">http://textParam8.com</text><text id=\"9\">http://textParam9.com</text></binding></visual></tile>")
  .reply(200, "", { 'content-length': '0',
  'x-wns-notificationstatus': 'received',
  'x-wns-msg-id': '40987B6654476DD7',
  'x-wns-debug-trace': 'BN1WNS1011130',
  date: 'Tue, 19 Jun 2012 20:50:54 GMT' });
scopes.push(scope);return scopes; };