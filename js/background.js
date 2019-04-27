

function onCaptured(imageUri) {
  console.log('captured current tab');

  chrome.tabs.query(
    { currentWindow: true, active: true },
    function (tabArray) {
      console.log('tabArray', tabArray);
      chrome.tabs.sendMessage(tabArray[0].id, {type: 'screenShot', payload: imageUri}, {});
    }
  );
}

function onError(error) {
  console.log(`Error: ${error}`);
}

chrome.browserAction.onClicked.addListener(function () {
  chrome.windows.getCurrent(function (currentWindow) {
    console.log('clicked on icon');
    chrome.tabs.captureVisibleTab(windowId = currentWindow.id, onCaptured)
      .then(onCaptured, onError);
  })
});
