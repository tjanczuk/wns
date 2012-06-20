exports.setupMockScopes = function (nock) { var scopes = []; var scope; scope = 
nock('https://login.live.com:443')
  .post('/accesstoken.srf', "grant_type=client_credentials&client_id=ms-app%3A%2F%2Fs-1-15-2-3004590818-3540041580-1964567292-460813795-2327965118-1902784169-2945106848&client_secret=N3icDsX5JXArJJR6AdTQZ86RITXQnMmA&scope=notify.windows.com")
  .reply(200, "{\"token_type\":\"bearer\",\"access_token\":\"EgAfAQMAAAAEgAAACoAA8/s9CmFq1iE+73t8/pd/np7YEu3jV2rSSsh9hO4iOkL5/X9scTjhiUc4oy4ylP48B4GjtcCXyt+Rqy7kAaXgebzMJytUdAYN1wljP9yI/LBra1l0H1TIuXAzlxRVLOFGr4/KXlha7LWM0+J6DmjVcvRJn+25c8CWqolwyS+a1EKOAFoAjgAAAAAAys8LTJnv4E+Z7+BP60gEABAAMTMxLjEwNy4xNzQuMjQ4AAAAAABeAG1zLWFwcDovL3MtMS0xNS0yLTMwMDQ1OTA4MTgtMzU0MDA0MTU4MC0xOTY0NTY3MjkyLTQ2MDgxMzc5NS0yMzI3OTY1MTE4LTE5MDI3ODQxNjktMjk0NTEwNjg0OAA=\"}", { 'cache-control': 'no-store',
  'content-length': '425',
  'content-type': 'application/json',
  server: 'Microsoft-IIS/7.5',
  ppserver: 'PPV: 30 H: BAYIDSLGN1M26 V: 0',
  date: 'Tue, 19 Jun 2012 21:31:05 GMT',
  connection: 'close' });
scopes.push(scope);scope = 
nock('https://bn1.notify.windows.com:443')
  .post('/?token=AgUAAACQRWJECxiyMVoNBsJefU%2bZypA7bASncWnSeSP9WA2zBXKnyb1%2fWUCg%2bTr7%2fspFEBK0b25eCDYgxdjVq%2bCoqqz6P68y6uLsnlnDtRbig9dzDWM30D5BNI7PmG7H7vsgCSU%3d', "<toast><visual><binding template=\"ToastText02\"><text id=\"1\">http://textParam1.com</text><text id=\"2\">http://textParam2.com</text></binding></visual></toast>")
  .reply(200, "", { 'content-length': '0',
  'x-wns-notificationstatus': 'received',
  'x-wns-msg-id': '492FE41C42F7B80D',
  'x-wns-debug-trace': 'BN1WNS1011133',
  date: 'Tue, 19 Jun 2012 21:31:05 GMT' });
scopes.push(scope);return scopes; };