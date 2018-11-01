const kickoff = () => {
  chrome.tabs.query({
    active: true,
    currentWindow: true,
  }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id,
      {
        command: 'doit',
      },
      // (response) => {
      // console.log(response);
    // }
    );
  });
};

chrome.contextMenus.create({
  title: 'Load Lytics JSON',
  contexts: [
    'all',
  ],
  onclick: kickoff,
});
