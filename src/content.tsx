import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const disapperObserver = new MutationObserver(() => {
  // It's called when extension started.
  try {
    const chatHist =
      document.getElementsByTagName("nav")[0].children[1].children[1].lastChild;
    if (chatHist == null) {
      throw new Error();
    }
    disapperObserver.observe(document, { childList: true, subtree: true });
  } catch {
    // console.log("extension end");
    disapperObserver.disconnect();
    observer.observe(document, { childList: true, subtree: true });
  }
});

const observer = new MutationObserver(() => {
  try {
    const chatHist =
      document.getElementsByTagName("nav")[0].children[1].children[1].lastChild;
    if (chatHist == null) {
      throw new Error();
    }
    observer.disconnect();
    // console.log("Extension start111");
    // main Process
    const root = document.createElement("div");
    root.id = "crx-root";
    root.className = "dark:text-gray-100 text-gray-800";
    // document.body.appendChild(root);
    chatHist.after(root);

    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    disapperObserver.observe(document, { childList: true, subtree: true });
  } catch {
    observer.observe(document, { childList: true, subtree: true });
  }
});
observer.observe(document, { childList: true, subtree: true });
