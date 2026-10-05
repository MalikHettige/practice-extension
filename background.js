chrome.action.onClicked.addListener(async (tab) => {
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["picker.js"],
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "OPEN_SVG") {
    const url =
      chrome.runtime.getURL("viewer.html") + "#" + encodeURIComponent(msg.svg);
    chrome.tabs.create({ url });
  }
});