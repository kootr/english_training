/**
 * 英語音読トレーナー - データAPI (Code.gs)
 *
 * この版のGASは「画面」を持たず、例文データをJSONで返すAPIに徹します。
 * 画面(index.html)はGitHub Pagesなど別の場所に置き、そこからこのAPIを呼びます。
 * こうするとGASのiframeの外で画面が動くので、音声認識(マイク)が使えます。
 *
 * --- スプレッドシートの想定フォーマット (1行目は見出し) ---
 *   A列: category   B列: english   C列: japanese
 */

var SHEET_NAME = 'Sheet1';

/**
 * GitHub Pages等の別ドメインから呼ばれるため、JSONPで返します。
 * 呼び出し例: https://script.google.com/.../exec?callback=xxx
 *
 * GASはCORSヘッダーを自由に設定できないため、
 * <script>タグで読み込めるJSONP(コールバック関数で包む方式)を使います。
 */
function doGet(e) {
  var callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : '';
  var payload;

  try {
    payload = JSON.stringify(getPhrases());
  } catch (err) {
    payload = JSON.stringify({ error: String(err && err.message ? err.message : err) });
  }

  if (callback) {
    // JSONP: callback(...) の形で返す
    return ContentService
      .createTextOutput(callback + '(' + payload + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  // callbackなしでアクセスされたときは素のJSONを返す(動作確認用)
  return ContentService
    .createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * スプレッドシートから例文を読み込んで配列で返す。
 */
function getPhrases() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('「' + SHEET_NAME + '」というシートが見つかりません。SHEET_NAME を確認してください。');
  }

  var values = sheet.getDataRange().getValues();
  var phrases = [];

  for (var i = 1; i < values.length; i++) {
    var category = String(values[i][0]).trim();
    var english  = String(values[i][1]).trim();
    var japanese = String(values[i][2]).trim();
    if (english === '' || japanese === '') continue;
    phrases.push({ cat: category || 'その他', en: english, ja: japanese });
  }

  return phrases;
}
