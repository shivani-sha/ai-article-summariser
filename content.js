function getArticleText() {
    const article = document.querySelector("article");
    if (article) return article.innerText.trim();
  
    // Fallback: all paragraph texts
    const paragraphs = Array.from(document.querySelectorAll("p"))
      .map((p) => p.innerText.trim())
      .filter((text) => text.length > 0);
  
    return paragraphs.join("\n");
  }
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_ARTICLE_TEXT") {
      const articleText = getArticleText();
      sendResponse({ text: articleText || null });
    }
  
    if (message.type === "GET_SELECTED_TEXT") {
      const selectedText = window.getSelection().toString().trim();
      sendResponse({ text: selectedText || null });
    }
  
    return true; // needed to send async response
  });
  