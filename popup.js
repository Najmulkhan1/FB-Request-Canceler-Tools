// UI Elements
const countDisplay = document.getElementById('count');
const statusDisplay = document.getElementById('status');

// প্রতি ৫০০ মিলিসেকেন্ডে UI আপডেট হবে স্টোরেজ থেকে
setInterval(() => {
  chrome.storage.local.get(['cancelCount', 'isRunning'], (data) => {
    countDisplay.innerText = data.cancelCount || 0;
    statusDisplay.innerText = data.isRunning ? "Running..." : "Stopped";
  });
}, 500);

// Start Button
document.getElementById('startBtn').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.storage.local.set({ isRunning: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: startAutoCancel
  });
});

// Stop Button
document.getElementById('stopBtn').addEventListener('click', async () => {
  chrome.storage.local.set({ isRunning: false });
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: stopAutoCancel
  });
});

// Clear Button
document.getElementById('clearBtn').addEventListener('click', () => {
  chrome.storage.local.set({ cancelCount: 0 });
});

// --- এই ফাংশনটি ফেসবুক পেজে রান হবে ---
function startAutoCancel() {
  if (window.cancelInterval) clearInterval(window.cancelInterval);

  window.cancelInterval = setInterval(() => {
    // বাটন খুঁজে বের করা
    const buttons = document.querySelectorAll('div[aria-label="Cancel Request"], div[aria-label="Cancel"]');
    
    if (buttons.length > 0) {
      const targetButton = buttons[0];
      targetButton.click();
      
      // বাটনটি ক্লিক হওয়ার পর ফেসবুকের ডোম থেকে মুছে গেছে কিনা চেক করা
      setTimeout(() => {
        if (!document.body.contains(targetButton)) {
          // সরাসরি স্টোরেজ থেকে বর্তমান কাউন্ট নিয়ে ১ যোগ করা
          chrome.storage.local.get(['cancelCount'], (result) => {
            let current = result.cancelCount || 0;
            chrome.storage.local.set({ cancelCount: current + 1 });
          });
        }
      }, 800); // কনফার্মেশনের জন্য সময় একটু বাড়ানো হয়েছে

    } else {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, 2500); // সেফটির জন্য ২.৫ সেকেন্ড বিরতি
}

function stopAutoCancel() {
  if (window.cancelInterval) {
    clearInterval(window.cancelInterval);
  }
}