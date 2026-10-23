function changeImage(image){

    document.getElementById("mainImage").src = image.src;

}

const categoryButtons = document.querySelectorAll(".category-button");
categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        const selectedCategory = button.dataset.category;

        categoryButtons.forEach(categoryButton => {
            const isActive = categoryButton === button;
            categoryButton.classList.toggle("is-active", isActive);
            categoryButton.setAttribute("aria-pressed", String(isActive));
        });

        document.querySelectorAll(".product-grid .card").forEach(card => {
            card.hidden = selectedCategory !== "all" && card.dataset.category !== selectedCategory;
        });
    });
});

const siteRoot = new URL(".", document.currentScript.src);
const homePageUrl = new URL("index.html", siteRoot);
const isHomePage = location.pathname === siteRoot.pathname || location.pathname === homePageUrl.pathname;

if (document.querySelector("header") && !document.querySelector(".breadcrumbs")) {
    const breadcrumb = document.createElement("nav");
    breadcrumb.className = "breadcrumbs";
    breadcrumb.setAttribute("aria-label", "パンくずリスト");

    const breadcrumbList = document.createElement("ol");
    breadcrumbList.className = "breadcrumb-list";

    const addBreadcrumb = (label, href, isCurrent = false) => {
        const item = document.createElement("li");
        if (isCurrent) {
            const current = document.createElement("span");
            current.textContent = label;
            current.setAttribute("aria-current", "page");
            item.appendChild(current);
        } else {
            const link = document.createElement("a");
            link.textContent = label;
            link.href = href;
            item.appendChild(link);
        }
        breadcrumbList.appendChild(item);
    };

    if (isHomePage) {
        addBreadcrumb("ホーム", null, true);
    } else if (location.pathname === new URL("news.html", siteRoot).pathname) {
        addBreadcrumb("ホーム", homePageUrl.href);
        addBreadcrumb("お知らせ", null, true);
    } else {
        addBreadcrumb("ホーム", homePageUrl.href);
        addBreadcrumb("作品一覧", new URL("index.html#product", siteRoot).href);

        const kitDetailsPath = new URL("products/ls-arii/", siteRoot).pathname;
        if (location.pathname.startsWith(kitDetailsPath)) {
            addBreadcrumb("LS(アリイ)製銃剣改修キット", new URL("products/ls-arii.html", siteRoot).href);
        }

        const pageTitle = document.title.split("|")[0].trim();
        addBreadcrumb(pageTitle, null, true);
    }

    breadcrumb.appendChild(breadcrumbList);
    document.querySelector("header").insertAdjacentElement("afterend", breadcrumb);
}

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8BMJVJDYwKlPgG3u4QReL1l45KmchvkWXeQs5Z9LHbe0gHTwxZAcxCF_6NSoUcLdAFcE8nEIN8Iyz/pub?output=csv";
const statusText = {
    stock: "在庫あり",
    plan: "製作中",
    soldout: "在庫なし・受注生産",
    test: "試作中",
    secret: "計画中"
};

const inventoryStatusById = new Map();
function applyInventoryStatuses(){
    document.querySelectorAll("[data-product]").forEach(item => {
        const status = inventoryStatusById.get(item.dataset.product);
        if (!status) return;
        let badge = item.querySelector("[data-inventory-status]");
        if (!badge) badge = item.querySelector(".badge:not(.kit-part-badge)");
        if (!badge) {
            badge = document.createElement("span");
            item.prepend(badge);
        }
        badge.dataset.inventoryStatus = "";
        badge.className = `badge inventory-status-badge ${status}`;
        badge.textContent = statusText[status] || status;
    });
}

fetch(sheetURL)
    .then(response => response.text())
    .then(csv => {

        const rows = csv.trim().split(/\r?\n/);
        rows.shift(); // 見出しを削除

        rows.forEach(row => {

            const [id, status] = row.split(",").map(item => item.trim());
            if (!id || !status) return;

            inventoryStatusById.set(id, status);
        });
        applyInventoryStatuses();

    })
    .catch(error => console.error(error));

// Optional shared product catalog URL.
const sharedCatalogApiUrl = "";

const orderablePages = {
    "products/6kh2ussr.html": {sku:"BAY-001", name:"6kh2タイプ バヨネット", price:4500, unpaintedPrice:4000, type:"bayonet"},
    "products/6kh3ussr.html": {sku:"BAY-002", name:"6kh3タイプ バヨネット", price:6500, unpaintedPrice:5000, type:"bayonet"},
    "products/6kh4ussr.html": {sku:"BAY-003", name:"6kh4タイプ バヨネット", price:6500, type:"bayonet", orderable:false},
    "products/F1.html": {sku:"GREN-001", name:"F-1グレネード", price:1200},
    "products/rgd.html": {sku:"GREN-002", name:"RGD-5グレネード", price:1200},
    "products/turi.html": {sku:"ACC-001", name:"AK系用銃剣吊り", options:[{label:"素材・色", choices:[{label:"合皮・ブラウン", sku:"ACC-001-S-B", price:500},{label:"合皮・グレー", sku:"ACC-001-S-G", price:500},{label:"本革・ブラウン", sku:"ACC-001-L-B", price:800},{label:"本革・グレー", sku:"ACC-001-L-G", price:800}]}]},
    "products/sight.html": {sku:"ACC-002", name:"AKリアサイトシリーズ", options:[{label:"製造国", choices:[{label:"ソ連", sku:"ACC-002-USSR", price:1000},{label:"北朝鮮", sku:"ACC-002-DPRK", price:1000},{label:"東ドイツ", sku:"ACC-002-GDR", price:1000},{label:"中国", sku:"ACC-002-CHN", price:1000},{label:"イラク", sku:"ACC-002-IRQ", price:1000}]}]},
    "products/ls-arii/kaizou-set.html": {sku:"KIT-001", name:"改修セット（6kh4）", price:3500, unpaintedPrice:3000, type:"kit", bodyModel:"6kh4", hangers:1},
    "products/ls-arii/kaizou-set-6kh3-6kh4.html": {sku:"KIT-002", name:"改修セット（6kh3・6kh4）", price:6500, unpaintedPrice:5500, type:"kit", bodyModel:"6kh3", hangers:2},
    "products/ls-arii/6kh3-body.html": {sku:"KIT-006", name:"6kh3本体", price:3500, unpaintedPrice:3000, type:"bayonet", bodyModel:"6kh3"},
    "products/ls-arii/saya.html": {sku:"KIT-003", name:"6kh4鞘単品", price:1500},
    "products/ls-arii/toushin.html": {sku:"KIT-004", name:"刀身単品", price:1000, type:"blade"},
    "products/ls-arii/strap.html": {sku:"KIT-005", name:"ストラップ", price:300},
    "products/ls-arii/ken-tsuri.html": {sku:"ACC-001", name:"AK系用銃剣吊り", options:[{label:"素材・色", choices:[{label:"合皮・ブラウン", sku:"ACC-001-S-B", price:500},{label:"合皮・グレー", sku:"ACC-001-S-G", price:500},{label:"本革・ブラウン", sku:"ACC-001-L-B", price:800},{label:"本革・グレー", sku:"ACC-001-L-G", price:800}]}]}
};

const relativePagePath = Object.keys(orderablePages).find(path =>
    location.pathname === new URL(path, siteRoot).pathname
);
const currentOrderProduct = orderablePages[relativePagePath];

const addProductNumber = (element, number) => {
    if (!element || element.querySelector(".product-number")) return;
    const label = document.createElement("p");
    label.className = "product-number";
    label.textContent = `商品番号：${number}`;
    element.appendChild(label);
};

if (currentOrderProduct) {
    const info = document.querySelector(".product-info");
    addProductNumber(info, currentOrderProduct.sku);
}

const CART_STORAGE_KEY = "7arsenal-cart-v1";
const GOOGLE_ORDER_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeDbF79hc3UA5Cm3W9uLHqvxWRmMGQDSyhO6-l0fP5D-TMFLA/viewform?usp=publish-editor";
let cart = [];
try {
    cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(cart)) cart = [];
} catch {
    cart = [];
}

const saveCart = () => localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
const yen = amount => `¥${Number(amount).toLocaleString("ja-JP")}`;

const createCartItem = (sku, name, price, variant = "") => ({sku, name, price, variant, quantity:1});
const addCartItem = item => {
    const existing = cart.find(line => line.sku === item.sku);
    if (existing) existing.quantity += 1;
    else cart.push(item);
    saveCart();
    renderCart();
};

const cartWidget = document.createElement("details");
cartWidget.className = "cart-widget";
cartWidget.innerHTML = `
    <summary><span>カート <b class="cart-count">0</b></span><span>合計 <b class="cart-total">¥0</b></span><span class="cart-toggle-state">開く ▼</span></summary>
    <div class="cart-panel">
        <div class="cart-panel-header">
            <h2>ご注文内容</h2>
            <button type="button" class="cart-close" aria-label="カートを閉じる">閉じる ×</button>
        </div>
        <div class="cart-lines"></div>
        <p class="cart-shipping-note">送料は別途確認となります。</p>
        <p class="cart-coupon-note"></p>
        <div class="cart-fee-modes" role="group" aria-label="販売形式・手数料">
            <strong>販売形式（いずれか1つ）</strong>
            <label><input type="checkbox" name="sale-mode" value="direct" checked> 直接取引（手数料なし）</label>
            <label><input type="checkbox" name="sale-mode" value="mercari"> メルカリ（販売手数料10%分を加算）</label>
            <label><input type="checkbox" name="sale-mode" value="yahoo"> Yahoo!フリマ（販売手数料5%分を加算）</label>
        </div>
        <form class="order-form">
            <p class="order-total">合計（送料別）<strong>¥0</strong></p>
            <button type="submit" class="order-submit">Googleフォームで注文する</button>
            <p class="order-mail-note">フォームが別画面で開きます。氏名・返信用メール・販売形式を入力し、下の注文内容を貼り付けて送信してください。</p>
            <label class="order-summary-label" hidden>フォームに貼り付ける注文内容
                <textarea class="order-summary" rows="9" readonly></textarea>
            </label>
            <button type="button" class="copy-order-summary" hidden>注文内容をコピー</button>
        </form>
    </div>`;
document.body.appendChild(cartWidget);

cartWidget.querySelector(".cart-close").addEventListener("click", () => {
    cartWidget.open = false;
    cartWidget.querySelector("summary").focus();
});

const renderCart = () => {
    const lines = cartWidget.querySelector(".cart-lines");
    lines.replaceChildren();
    cart.forEach((item, index) => {
        const line = document.createElement("div");
        line.className = "cart-line";
        const title = document.createElement("div");
        title.className = "cart-line-title";
        title.textContent = `${item.sku} · ${item.name}${item.variant ? `（${item.variant}）` : ""}`;
        const price = document.createElement("span");
        price.textContent = item.quoteRequired ? `価格確認 × ${item.quantity}` : `${yen(item.price)} × ${item.quantity}`;
        const controls = document.createElement("div");
        controls.className = "cart-line-controls";
        controls.innerHTML = `<button type="button" data-cart-action="minus" data-index="${index}" aria-label="数量を減らす">−</button><button type="button" data-cart-action="plus" data-index="${index}" aria-label="数量を増やす">＋</button><button type="button" data-cart-action="remove" data-index="${index}">削除</button>`;
        line.append(title, price, controls);
        lines.appendChild(line);
    });
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartWidget.querySelector(".cart-count").textContent = count;
    cartWidget.querySelector(".cart-shipping-note").textContent = `${cart.some(item => item.quoteRequired) ? "価格未定の商品は確認後にご案内します。" : ""}送料は別途確認となります。`;
    updateCartTotal();
};

const selectedSaleMode = () => cartWidget.querySelector('input[name="sale-mode"]:checked')?.value || "direct";
const getCartTotals = () => {
    const base = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const feeRate = selectedSaleMode() === "mercari" ? 0.10 : selectedSaleMode() === "yahoo" ? 0.05 : 0;
    const fee = Math.ceil(base * feeRate);
    return {base, fee, total:base + fee};
};

function updateCartTotal(){
    const {base, fee, total} = getCartTotals();
    const freeShipping = base >= 10000;
    cartWidget.querySelector(".cart-total").textContent = yen(total);
    const quoteNote = cart.some(item => item.quoteRequired) ? " ※価格未定品を除く" : "";
    cartWidget.querySelector(".order-total strong").textContent = `${yen(total)}（商品 ${yen(base)}${fee ? ` + 手数料 ${yen(fee)}` : ""}・${freeShipping ? "送料0円" : "送料別"}）${quoteNote}`;
    cartWidget.querySelector(".cart-coupon-note").textContent = freeShipping ? "送料無料クーポン 7ARS-FREESHIP を適用できます。" : `商品本体価格あと${yen(10000 - base)}で送料無料クーポン対象です。`;
}

cartWidget.addEventListener("change", event => {
    if (event.target.matches('input[name="sale-mode"]') && event.target.checked) {
        cartWidget.querySelectorAll('input[name="sale-mode"]').forEach(input => {
            if (input !== event.target) input.checked = false;
        });
        updateCartTotal();
    } else if (event.target.matches('input[name="sale-mode"]') && !event.target.checked && !cartWidget.querySelector('input[name="sale-mode"]:checked')) {
        event.target.checked = true;
    }
});

cartWidget.addEventListener("click", event => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;
    const index = Number(button.dataset.index);
    if (!cart[index]) return;
    if (button.dataset.cartAction === "plus") cart[index].quantity += 1;
    if (button.dataset.cartAction === "minus") cart[index].quantity -= 1;
    if (button.dataset.cartAction === "remove" || cart[index].quantity <= 0) cart.splice(index, 1);
    saveCart();
    renderCart();
});

const form = cartWidget.querySelector(".order-form");
form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!cart.length) {
        alert("カートに商品を追加してください。");
        return;
    }
    const {base, fee, total} = getCartTotals();
    const modeNames = {direct:"直接取引", mercari:"メルカリ", yahoo:"Yahoo!フリマ"};
    const orderLines = cart.map(item => `${item.sku} ${item.name}${item.variant ? `（${item.variant}）` : ""} ×${item.quantity}：${item.quoteRequired ? "価格確認・見積もり希望" : yen(item.price * item.quantity)}`);
    const uniquePart = window.crypto?.randomUUID ? crypto.randomUUID().slice(0, 8).toUpperCase() : Math.random().toString(36).slice(2, 10).toUpperCase();
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${uniquePart}`;
    const shippingCoupon = base >= 10000 ? "7ARS-FREESHIP（送料無料）" : "対象外（商品本体価格10,000円未満）";
    const body = [
        `注文番号：${orderNumber}`,
        `販売形式：${modeNames[selectedSaleMode()]}`,
        "",
        "注文商品：",
        ...orderLines,
        "",
        `商品小計：${yen(base)}`,
        `サイト手数料分：${yen(fee)}`,
        `合計：${yen(total)}`,
        `送料：${base >= 10000 ? "送料無料" : "別途確認"}`,
        `送料無料クーポン：${shippingCoupon}`
    ].join("\n");
    const summaryLabel = cartWidget.querySelector(".order-summary-label");
    const summaryField = cartWidget.querySelector(".order-summary");
    const copyButton = cartWidget.querySelector(".copy-order-summary");
    summaryField.value = body;
    summaryLabel.hidden = false;
    copyButton.hidden = false;
    copyButton.textContent = "注文内容をコピー";
    cartWidget.querySelector(".order-mail-note").textContent = "別画面のフォームに氏名・返信用メール・販売形式を入力し、下の注文内容を貼り付けてください。";
    const formTab = window.open("about:blank", "_blank");
    try {
        await navigator.clipboard.writeText(body);
        cartWidget.querySelector(".order-mail-note").textContent = "注文内容をコピーしました。別画面のフォームの注文内容欄に貼り付けてください。";
        copyButton.textContent = "もう一度コピー";
    } catch {
        summaryField.focus();
        summaryField.select();
    }
    if (formTab) formTab.location.href = GOOGLE_ORDER_FORM_URL;
    else location.href = GOOGLE_ORDER_FORM_URL;
});

cartWidget.querySelector(".copy-order-summary").addEventListener("click", async () => {
    const summaryField = cartWidget.querySelector(".order-summary");
    try {
        await navigator.clipboard.writeText(summaryField.value);
        cartWidget.querySelector(".order-mail-note").textContent = "注文内容をコピーしました。フォームの注文内容欄に貼り付けてください。";
    } catch {
        summaryField.focus();
        summaryField.select();
        cartWidget.querySelector(".order-mail-note").textContent = "注文内容を選択しました。コピーしてフォームに貼り付けてください。";
    }
});

if (currentOrderProduct?.orderable === false) {
    const info = document.querySelector(".product-info");
    const notice = document.createElement("p");
    notice.className = "prototype-note";
    notice.textContent = "試作中のため、現在カートへの追加はできません。";
    info.appendChild(notice);
} else if (currentOrderProduct) {
    const info = document.querySelector(".product-info");
    const controls = document.createElement("div");
    controls.className = "product-order-controls";
    let currentSku = currentOrderProduct.sku;
    let currentPrice = currentOrderProduct.price;
    let variant = "";

    if (currentOrderProduct.type === "bayonet") {
        const model = currentOrderProduct.bodyModel || {"BAY-001":"6kh2", "BAY-002":"6kh3", "BAY-003":"6kh4"}[currentOrderProduct.sku];
        controls.innerHTML = `
            <fieldset><legend>刀身素材（同一価格）</legend>
                <label><input type="radio" name="blade-material" value="PLA+" checked> PLA+</label>
                <label><input type="radio" name="blade-material" value="シルクPLA"> シルクPLA</label>
            </fieldset>
            <label class="paint-style-option">塗装仕様
                <select name="paint-style"><option value="B">ベークライト塗装</option><option value="G">東独風ブラック</option></select>
            </label>
            <label class="unpainted-option"><input type="checkbox" name="unpainted"> ${model}ガレージキット版（未塗装・未組立）にする</label>
            <button type="button" class="add-to-cart-button">カートに追加</button>`;
        const updateVariant = () => {
            const material = controls.querySelector('input[name="blade-material"]:checked').value;
            const unpainted = controls.querySelector('input[name="unpainted"]').checked;
            const paint = controls.querySelector('select[name="paint-style"]');
            paint.disabled = unpainted;
            const paintCode = unpainted ? "U" : paint.value;
            const paintName = unpainted ? "ガレージキット版（未塗装・未組立）" : paint.value === "B" ? "ベークライト塗装" : "東独風ブラック";
            const suffix = material === "PLA+" ? "P" : "S";
            currentSku = `${currentOrderProduct.sku}-${paintCode}-${suffix}`;
            currentPrice = unpainted ? currentOrderProduct.unpaintedPrice : currentOrderProduct.price;
            variant = `${paintName}・${material}`;
        };
        controls.addEventListener("change", updateVariant);
        updateVariant();
    } else if (currentOrderProduct.type === "blade") {
        controls.innerHTML = `
            <fieldset><legend>刀身素材（同一価格）</legend>
                <label><input type="radio" name="blade-material" value="PLA+"> PLA+</label>
                <label><input type="radio" name="blade-material" value="シルクPLA" checked> シルクPLA</label>
            </fieldset>
            <button type="button" class="add-to-cart-button">カートに追加</button>`;
        controls.addEventListener("change", () => {
            const material = controls.querySelector('input[name="blade-material"]:checked').value;
            currentSku = `${currentOrderProduct.sku}-${material === "PLA+" ? "P" : "S"}`;
            variant = material;
        });
        variant = "シルクPLA";
        currentSku = "KIT-004-S";
    } else if (currentOrderProduct.hangers) {
        const hangerInputs = Array.from({length:currentOrderProduct.hangers}, (_, index) => `
            <label class="hanger-option">
                <span><input type="checkbox" name="leather-hanger" data-hanger-index="${index}"> 本革（+¥300）</span>
                <select name="hanger-color" aria-label="剣吊り${index + 1}の色"><option value="B">ブラウン</option><option value="G">グレー</option></select>
            </label>`).join("");
        controls.innerHTML = `<div class="hanger-options"><strong>セット内の剣吊り素材・色</strong>${hangerInputs}</div>
            <label class="paint-style-option">本体の塗装仕様
                <select name="paint-style"><option value="B">ベークライト塗装</option><option value="G">東独風ブラック</option></select>
            </label>
            <label class="unpainted-option"><input type="checkbox" name="unpainted"> ${currentOrderProduct.bodyModel}本体をガレージキット版（未塗装・未組立）にする</label>
            <label class="kit-blade-option">セット刀身素材
                <select name="kit-blade"><option value="PLA+">PLA+</option><option value="シルクPLA" selected>シルクPLA</option></select>
            </label>
            <button type="button" class="add-to-cart-button">カートに追加</button>`;
        controls.addEventListener("change", () => {
            const hangers = [...controls.querySelectorAll('input[name="leather-hanger"]')];
            const colors = [...controls.querySelectorAll('select[name="hanger-color"]')];
            const selected = hangers.map((input, index) => `${input.checked ? "L" : "S"}${colors[index].value}`).join("-");
            const material = controls.querySelector('select[name="kit-blade"]').value;
            const unpainted = controls.querySelector('input[name="unpainted"]').checked;
            const paint = controls.querySelector('select[name="paint-style"]');
            paint.disabled = unpainted;
            const paintCode = unpainted ? "U" : paint.value;
            const paintName = unpainted ? "ガレージキット版（未塗装・未組立）" : paint.value === "B" ? "ベークライト塗装" : "東独風ブラック";
            currentSku = `${currentOrderProduct.sku}-${selected}-${paintCode}-${material === "PLA+" ? "P" : "S"}`;
            const bodyPrice = unpainted ? currentOrderProduct.unpaintedPrice : currentOrderProduct.price;
            currentPrice = bodyPrice + hangers.filter(input => input.checked).length * 300;
            const hangerNames = hangers.map((input, index) => `${input.checked ? "本革" : "合皮"}・${colors[index].value === "B" ? "ブラウン" : "グレー"}`).join("／");
            variant = `${paintName}・${material}・剣吊り ${hangerNames}`;
        });
        controls.dispatchEvent(new Event("change"));
    } else if (currentOrderProduct.options) {
        const optionMarkup = currentOrderProduct.options.map(option => `
            <fieldset><legend>${option.label}を選択</legend>
                ${option.choices.map((choice, index) => `<label><input type="radio" name="product-option" value="${index}" ${index === 0 ? "checked" : ""}> ${choice.label}（${yen(choice.price)}+送）</label>`).join("")}
            </fieldset>`).join("");
        controls.innerHTML = `${optionMarkup}<button type="button" class="add-to-cart-button">カートに追加</button>`;
        const updateOption = () => {
            const choice = currentOrderProduct.options[0].choices[Number(controls.querySelector('input[name="product-option"]:checked').value)];
            currentSku = choice.sku;
            currentPrice = choice.price;
            variant = choice.label;
        };
        controls.addEventListener("change", updateOption);
        updateOption();
    } else {
        controls.innerHTML = `<button type="button" class="add-to-cart-button">カートに追加</button>`;
    }

    const quantityLabel = document.createElement("label");
    quantityLabel.className = "quantity-picker";
    quantityLabel.innerHTML = `個数<input type="number" name="cart-quantity" min="1" max="99" value="1" inputmode="numeric">`;
    controls.insertBefore(quantityLabel, controls.querySelector(".add-to-cart-button"));

    const selectedNumber = document.createElement("p");
    selectedNumber.className = "selected-variant-number";
    controls.prepend(selectedNumber);
    const updateSelectedNumber = () => {
        selectedNumber.textContent = `選択中の商品番号：${currentSku}`;
    };
    controls.addEventListener("change", updateSelectedNumber);
    updateSelectedNumber();

    controls.querySelector(".add-to-cart-button").addEventListener("click", () => {
        const quantity = Math.max(1, Math.min(99, Number(controls.querySelector('input[name="cart-quantity"]').value) || 1));
        const item = createCartItem(currentSku, currentOrderProduct.name, currentPrice, variant);
        item.quantity = quantity;
        item.quoteRequired = currentOrderProduct.price == null;
        addCartItem(item);
        cartWidget.open = true;
    });
    info.appendChild(controls);
}

renderCart();

function renderSharedCatalog(response){
    const grid = document.querySelector(".products .product-grid");
    if (!grid || !Array.isArray(response?.products)) return;
    const records = response.products.filter(product => product.active !== false);
    grid.replaceChildren();
    records.forEach(product => {
        const card = document.createElement("a");
        card.className = "card";
        card.dataset.category = ["bayonet", "grenade", "other"].includes(product.category) ? product.category : "other";
        card.dataset.product = product.statusKey || "";
        card.href = product.detailURL ? (/^https?:\/\//i.test(product.detailURL) ? product.detailURL : new URL(product.detailURL, siteRoot).href) : "#product";
        if (product.statusKey) {
            const badge = document.createElement("span");
            badge.className = "badge";
            badge.dataset.inventoryStatus = "";
            badge.textContent = "在庫確認";
            card.appendChild(badge);
        }
        if (product.imageURL) {
            const image = document.createElement("img");
            image.src = /^https?:\/\//i.test(product.imageURL) ? product.imageURL : new URL(product.imageURL, siteRoot).href;
            image.alt = product.name;
            card.appendChild(image);
        } else {
            const placeholder = document.createElement("div");
            placeholder.className = "kit-card-placeholder";
            placeholder.textContent = "写真準備中";
            card.appendChild(placeholder);
        }
        const title = document.createElement("h3");
        title.textContent = product.name;
        const price = document.createElement("p");
        price.textContent = product.price == null ? "価格確認中" : `${yen(product.price)}+送`;
        card.append(title, price);
        if (product.description) {
            const description = document.createElement("p");
            description.textContent = product.description;
            card.appendChild(description);
        }
        grid.appendChild(card);
    });
    applyInventoryStatuses();
}

if (sharedCatalogApiUrl) {
    window.receiveSevenArsenalProducts = renderSharedCatalog;
    const catalogScript = document.createElement("script");
    catalogScript.src = `${sharedCatalogApiUrl}${sharedCatalogApiUrl.includes("?") ? "&" : "?"}callback=window.receiveSevenArsenalProducts`;
    catalogScript.onerror = () => console.error("共有商品一覧を取得できませんでした。");
    document.head.appendChild(catalogScript);
}
