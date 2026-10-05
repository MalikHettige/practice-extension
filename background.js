chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["picker.js"],
    });
  } catch (err) {
    // Restricted pages (brave://, chrome://, web store) can't be scripted
    chrome.action.setBadgeText({ tabId: tab.id, text: "!" });
    setTimeout(
      () => chrome.action.setBadgeText({ tabId: tab.id, text: "" }),
      2000
    );
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "OPEN_SVG") {
    const url =
      chrome.runtime.getURL("viewer.html") + "#" + encodeURIComponent(msg.svg);
    chrome.tabs.create({ url });
  }
});