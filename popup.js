document.getElementById("summarize").addEventListener("click", () => {
    const resultDiv = document.getElementById("result");
    const summaryType = document.getElementById("summary-type").value;

    resultDiv.innerHTML = '<div class="loader"></div>';

    chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
        if (!geminiApiKey) {
            resultDiv.textContent = "Please set your Gemini API key in the options.";
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "GET_ARTICLE_TEXT" },
                async ({ text }) => {
                    if (!text) {
                        resultDiv.textContent = "No article text found on this page.";
                        return;
                    }

                    try {
                        const summary = await getGeminiSummary(text, summaryType, geminiApiKey);
                        resultDiv.textContent = summary || "No summary generated.";
                    } catch (error) {
                        resultDiv.textContent = "Failed to generate summary: " + error.message;
                    }
                }
            );
        });
    });
});

// 🔽 ADD BELOW — Listener for "Summarize Selected Text" button 🔽
document.getElementById("summarize-selected").addEventListener("click", () => {
    const resultDiv = document.getElementById("result");
    const summaryType = document.getElementById("summary-type").value;

    resultDiv.innerHTML = '<div class="loader"></div>';

    chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
        if (!geminiApiKey) {
            resultDiv.textContent = "Please set your Gemini API key in the options.";
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "GET_SELECTED_TEXT" },
                async ({ text }) => {
                    if (!text) {
                        resultDiv.textContent = "No text selected on this page.";
                        return;
                    }

                    try {
                        const summary = await getGeminiSummary(text, summaryType, geminiApiKey);
                        resultDiv.textContent = summary || "No summary generated.";
                    } catch (error) {
                        resultDiv.textContent = "Failed to generate summary: " + error.message;
                    }
                }
            );
        });
    });
}); // 🔼 UNTIL HERE 🔼

async function getGeminiSummary(rawText, summaryType, apiKey) {
    const max = 20000;
    const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;

    const promptMap = {
        brief: `Summarize in 2-3 sentences:\n\n${text}`,
        detailed: `Give a detailed summary of the following text:\n\n${text}`,
        bullets: `Summarize in 5-7 bullet points (start each line with "-"):\n\n${text}`
    };

    const prompt = promptMap[summaryType] || promptMap.brief;

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2 }
            })
        }
    );

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error?.message || "Failed to generate summary");
    }

    const data = await res.json();
    const rawSummary = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No summary.";

    // Remove extra spaces between full stops
    return rawSummary.replace(/\. +/g, ".");
}

document.getElementById("copy-btn").addEventListener("click", () => {
    const txt = document.getElementById("result").innerText;
    if (!txt) return;

    navigator.clipboard.writeText(txt).then(() => {
        const btn = document.getElementById("copy-btn");
        const old = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => {
            btn.textContent = old;
        }, 2000);
    });
});
