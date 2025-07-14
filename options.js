document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
        if (geminiApiKey) {
            document.getElementById("api-key").value = geminiApiKey;
        }
    });

    document.getElementById("save-button").addEventListener("click", () => {
        const apiKey = document.getElementById("api-key").value.trim();
        if (!apiKey) return;

        chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
            const successMessage = document.getElementById("success-message");
            successMessage.style.display = "block";
            setTimeout(() => {
                successMessage.style.display = "none";
            }, 2000);
        });
    });
});
