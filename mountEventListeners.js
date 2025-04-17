const frames = document.querySelectorAll(".frame");

frames.forEach(frame => {
    frame.addEventListener("click", () => {
        const src = frame.querySelector("img").src;
        console.log("Clicked frame");
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "10000";

        const enlarged = document.createElement("img");
        enlarged.src = src;
        enlarged.style.maxWidth = "90vw";
        enlarged.style.maxHeight = "90vh";
        enlarged.style.borderRadius = "16px";
        enlarged.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.5)";
        enlarged.style.objectFit = "contain";
        enlarged.style.zIndex = "10000";

        const close = document.createElement("button");
        close.innerText = "×";
        close.style.position = "absolute";
        close.style.top = "20px";
        close.style.right = "30px";
        close.style.fontSize = "3rem";
        close.style.color = "#fff";
        close.style.background = "transparent";
        close.style.border = "none";
        close.style.cursor = "pointer";
        close.onclick = () => document.body.removeChild(overlay);

        overlay.appendChild(enlarged);
        overlay.appendChild(close);
        document.body.appendChild(overlay);
    });
});

const buttons = document.querySelectorAll('.expand-btn');

buttons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        const info = btn.parentElement.nextElementSibling;
        info.style.display = info.style.display === 'block' ? 'none' : 'block';
        btn.textContent = info.style.display === 'block' ? '–' : '＋';
    });
});