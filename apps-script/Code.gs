const PRODUCT_SHEET_NAME = "Products";
const PRODUCT_HEADERS = ["SKU", "name", "category", "price", "imageURL", "detailURL", "description", "active", "statusKey"];

function doGet(e) {
  if (e && e.parameter && e.parameter.page === "admin") {
    return HtmlService.createHtmlOutputFromFile("Admin")
      .setTitle("第七造兵廠 商品管理")
      .addMetaTag("viewport", "width=device-width, initial-scale=1");
  }

  const rows = listPublicProducts_();
  const callback = e && e.parameter ? e.parameter.callback : "";
  const payload = JSON.stringify({products: rows});
  if (callback) {
    if (!/^[$A-Z_a-z][$\w.]*$/.test(callback)) {
      return ContentService.createTextOutput("Invalid callback").setMimeType(ContentService.MimeType.TEXT);
    }
    return ContentService.createTextOutput(`${callback}(${payload});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
}

function setupCatalog() {
  const sheet = getProductSheet_();
  if (sheet.getLastRow() <= 1) {
    const initial = [
      ["BAY-001", "6kh2タイプ バヨネット", "bayonet", 4500, "images/商品/6kh21.jpg", "products/6kh2ussr.html", "6kh2タイプ銃剣", true, "6kh2ussr"],
      ["BAY-002", "6kh3タイプ バヨネット", "bayonet", 6500, "images/商品/6kh31.jpg", "products/6kh3ussr.html", "6kh3タイプ銃剣", true, "6kh3ussr"],
      ["BAY-003", "6kh4タイプ バヨネット", "bayonet", 6500, "", "products/6kh4ussr.html", "6kh4タイプ銃剣。写真準備中。", true, "6kh4ussr"],
      ["BAY-004", "56式半用銃剣", "bayonet", "", "images/商品/56h1.jpg", "products/56h.html", "", true, "56h"],
      ["BAY-005", "68式銃剣", "bayonet", "", "images/商品/681.jpg", "products/68.html", "", true, "68"],
      ["BAY-006", "gew98銃剣", "bayonet", "", "images/商品/981.jpg", "products/98.html", "", true, "gew98"],
      ["GREN-001", "F-1グレネード", "grenade", 1200, "images/商品/f11.jpg", "products/F1.html", "", true, "F1"],
      ["GREN-002", "RGD-5グレネード", "grenade", 1200, "images/商品/rgd1.jpg", "products/rgd.html", "", true, "rgd"],
      ["ACC-001", "AK系用銃剣吊り", "bayonet", 500, "images/商品/turi1.jpg", "products/turi.html", "合皮／本革、ブラウン／グレー", true, "turi"],
      ["ACC-002", "AKリアサイトシリーズ", "other", 1000, "images/商品/sight1.jpg", "products/sight.html", "ソ連・北朝鮮・東ドイツ・中国・イラク", true, "sight"],
      ["KIT-001", "改造キット（6kh4版）", "bayonet", 3500, "images/商品/ls-arii-1.jpg", "products/ls-arii/kaizou-set.html", "", true, ""],
      ["KIT-002", "改造キット（6kh3・6kh4版）", "bayonet", 6500, "images/商品/ls-arii-1.jpg", "products/ls-arii/kaizou-set-6kh3-6kh4.html", "", true, ""],
      ["KIT-003", "鞘", "other", 2000, "images/商品/ls-arii-3.jpg", "products/ls-arii/saya.html", "", true, ""],
      ["KIT-004", "刀身単品", "other", 1000, "images/商品/ls-arii-4.jpg", "products/ls-arii/toushin.html", "", true, ""],
      ["KIT-005", "ストラップ", "other", 300, "", "products/ls-arii/strap.html", "", true, ""]
    ];
    sheet.getRange(2, 1, initial.length, PRODUCT_HEADERS.length).setValues(initial);
  }
  return `商品一覧を準備しました（${Math.max(0, sheet.getLastRow() - 1)}件）。`;
}

function adminLogin(password) {
  const properties = PropertiesService.getScriptProperties();
  const expected = properties.getProperty("ADMIN_PASSWORD");
  if (!expected) throw new Error("スクリプトプロパティ ADMIN_PASSWORD を設定してください。");
  if (String(password) !== expected) throw new Error("パスワードが正しくありません。");
  const token = Utilities.getUuid();
  const changeRequired = expected === "1989";
  CacheService.getScriptCache().put(`admin:${token}`, JSON.stringify({changeRequired}), 1800);
  return {token, changeRequired};
}

function changeAdminPassword(token, newPassword) {
  const auth = getAdminSession_(token);
  if (!auth || !auth.changeRequired) throw new Error("パスワード変更が必要な状態ではありません。");
  if (String(newPassword).length < 12) throw new Error("新しいパスワードは12文字以上にしてください。");
  PropertiesService.getScriptProperties().setProperty("ADMIN_PASSWORD", String(newPassword));
  CacheService.getScriptCache().put(`admin:${token}`, JSON.stringify({changeRequired:false}), 1800);
  return {ok:true};
}

function listAdminProducts(token) {
  requireAdmin_(token);
  return listPublicProducts_();
}

function saveProduct(token, product) {
  requireAdmin_(token);
  const clean = normalizeProduct_(product);
  const sheet = getProductSheet_();
  const values = sheet.getDataRange().getValues();
  const row = values.findIndex((item, index) => index > 0 && String(item[0]) === clean.sku);
  const entry = [clean.sku, clean.name, clean.category, clean.price, clean.imageURL, clean.detailURL, clean.description, clean.active, clean.statusKey];
  if (row > 0) sheet.getRange(row + 1, 1, 1, entry.length).setValues([entry]);
  else sheet.appendRow(entry);
  return listPublicProducts_();
}

function deleteProduct(token, sku) {
  requireAdmin_(token);
  const sheet = getProductSheet_();
  const values = sheet.getDataRange().getValues();
  const row = values.findIndex((item, index) => index > 0 && String(item[0]) === String(sku));
  if (row > 0) sheet.deleteRow(row + 1);
  return listPublicProducts_();
}

function requireAdmin_(token) {
  const session = getAdminSession_(token);
  if (!session) throw new Error("ログインの有効期限が切れました。もう一度ログインしてください。");
  if (session.changeRequired) throw new Error("初期パスワードの変更が必要です。");
}

function getAdminSession_(token) {
  if (!token) return null;
  const value = CacheService.getScriptCache().get(`admin:${token}`);
  return value ? JSON.parse(value) : null;
}

function getProductSheet_() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("スクリプトプロパティ SPREADSHEET_ID を設定してください。");
  const spreadsheet = SpreadsheetApp.openById(id);
  let sheet = spreadsheet.getSheetByName(PRODUCT_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(PRODUCT_SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(PRODUCT_HEADERS);
  return sheet;
}

function listPublicProducts_() {
  const sheet = getProductSheet_();
  if (sheet.getLastRow() < 2) return [];
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, PRODUCT_HEADERS.length).getValues();
  return values.filter(row => row[0] && row[7] !== false && String(row[7]).toLowerCase() !== "false")
    .map(row => ({
      sku: String(row[0]), name: String(row[1]), category: String(row[2]),
      price: row[3] === "" ? null : Number(row[3]), imageURL: String(row[4]),
      detailURL: String(row[5]), description: String(row[6]), active: row[7] !== false,
      statusKey: String(row[8] || "")
    }));
}

function normalizeProduct_(product) {
  const item = product || {};
  const clean = {
    sku: String(item.sku || "").trim(), name: String(item.name || "").trim(),
    category: String(item.category || "other").trim(),
    price: item.price === "" || item.price == null ? "" : Number(item.price),
    imageURL: String(item.imageURL || "").trim(), detailURL: String(item.detailURL || "").trim(),
    description: String(item.description || "").trim(), active: item.active !== false,
    statusKey: String(item.statusKey || "").trim()
  };
  if (!clean.sku || !clean.name) throw new Error("商品番号と商品名は必須です。");
  if (!["bayonet", "grenade", "other"].includes(clean.category)) throw new Error("カテゴリが不正です。");
  if (clean.price !== "" && (!Number.isFinite(clean.price) || clean.price < 0)) throw new Error("価格は0以上の数値にしてください。");
  return clean;
}
