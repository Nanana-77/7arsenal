function changeImage(image){

    document.getElementById("mainImage").src = image.src;

}

const categoryButtons = document.querySelectorAll(".category-button");
const productCards = document.querySelectorAll(".product-grid .card");

categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        const selectedCategory = button.dataset.category;

        categoryButtons.forEach(categoryButton => {
            const isActive = categoryButton === button;
            categoryButton.classList.toggle("is-active", isActive);
            categoryButton.setAttribute("aria-pressed", String(isActive));
        });

        productCards.forEach(card => {
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
    soldout: "完売・受注生産",
    test: "試作中",
    secret: "計画中"
};

fetch(sheetURL)
    .then(response => response.text())
    .then(csv => {

        const rows = csv.trim().split("\n");
        rows.shift(); // 見出しを削除

        rows.forEach(row => {

            const [id, status] = row.split(",").map(item => item.trim());

            console.log("ID:", id);
            console.log("Status:", status);

            const items = document.querySelectorAll(`[data-product="${id}"]`);
            console.log("見つかった要素数:", items.length);

            items.forEach(item => {

                const badge = item.querySelector(".badge");

                if (!badge) return;

                badge.className = `badge ${status}`;
                badge.textContent = statusText[status] || status;

            });

        });

    })
    .catch(error => console.error(error));
