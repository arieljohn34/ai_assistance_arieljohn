// Main JavaScript for AI Assistant
document.addEventListener("DOMContentLoaded", () => {
    const chatBox = document.getElementById("chat-box");
    const promptInput = document.getElementById("prompt-input");
    const sendBtn = document.getElementById("send-btn");
    const offlineBanner = document.getElementById("offline-banner");

    // Offline/Online detection
    window.addEventListener("online", () => offlineBanner.classList.add("d-none"));
    window.addEventListener("offline", () => offlineBanner.classList.remove("d-none"));

    // ✅ ONLY ONE appendMessage function (using marked.js)
    function appendMessage(sender, text) {
        const div = document.createElement("div");
        div.className = `message ${sender}`;
        
        // Convert Markdown to HTML using marked for the AI, plain text for the user
        const formattedText = sender === "ai" ? marked.parse(text) : text;

        div.innerHTML = `<span class="badge ${sender === "user" ? "bg-primary" : "bg-secondary"}">
            ${sender === "user" ? "You" : "AI"}</span>
            <div class="message-content mt-1">${formattedText}</div>`;
            
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function sendPrompt() {
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        appendMessage("user", prompt);
        promptInput.value = "";

        try {
            const res = await fetch("/api/chat/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            if (data.response) {
                appendMessage("ai", data.response);
            } else {
                appendMessage("ai", "Error: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            appendMessage("ai", "Network error. Please check your connection.");
        }
    }

    sendBtn.addEventListener("click", sendPrompt);
    promptInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendPrompt();
    });
});