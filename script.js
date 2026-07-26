function changeImage(image){

    document.getElementById("mainImage").src = image.src;

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