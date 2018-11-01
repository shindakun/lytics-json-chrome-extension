// CSS for tooltip
const injectStyles = (rule) => {
  let div = $('<div />', {
    html: '&shy;<style>' + rule + '</style>'
  }).appendTo('body');
}

injectStyles('.tooltippy { position: relative; display: inline-block; }');
injectStyles('.tooltippy .tooltippytext { font-family: monospace; \
  font-size: 14px; visibility: hidden; width: 500px; word-wrap: break-word; \
  white-space: pre-wrap; background-color: #555; color: #fff; \
  padding: 5px 0 5px 5px; border-radius: 6px; position: absolute; z-index: 1; \
  left: 50%; margin-left: -20px; opacity: 0; transition: opacity 0.3s; }');
injectStyles('.tooltippy .tooltippytext::after { content: ""; \
position: absolute; top: 100%; left: 50%; margin-left: -5px; \
border-width: 5px; border-style: solid; \
border-color: #555 transparent transparent transparent; }');
injectStyles('.tooltippy:hover .tooltippytext { visibility: visible; \
  opacity: 1; }');

const lyticsApi = 'https://api.lytics.io/api/';

// getJsonFromAPI endpoint
async function getJsonFromAPI(endpoint) {
  let response = await fetch(endpoint, {
    headers: new Headers({
      'Authorization': window.localStorage.auth_token
    })
  });
  let json = await response.json();

  return json;
}

// doit does the actual heavy lifting, grabs account data then camapaign or
// audience objects
const doit = () => {
  let section = document.location.pathname.split('/')[1];
  let guid = document.location.pathname.split('/')[2];
  let aid = document.location.search.split('=')[1];

  if (section == 'programs') {
    getJsonFromAPI(lyticsApi + 'account/' + aid).then((res) => {
      return res.data;
    }).then((accountData) => {
      getJsonFromAPI(lyticsApi + 'program/campaign/' + guid + '?account_id=' +
        accountData.id).then((res) => {
        addToPage(res.data, 'div.container div.grid.mb-xl');
      });
      return accountData;
    }).then((accountData) => {
      getJsonFromAPI(lyticsApi + 'program/campaign/variation?account_id=' +
        accountData.id).then((res) => {
        let variations = [];

        // loop through response
        res.data.forEach((data) => {
          if (data.campaign_id === guid) {
            variations[data.variation] = data;
          }

          // get on up outta here
          return variations;
        });

        // get on up outta here
        return variations;
      }).then((variations) => {
        if (variations.length === 1) {
          addToPage(variations[0],
            'div.col-2-3 div.section header.section__header span.h6');
        } else if (variations.length > 1) {

          // loop through variations and write them to the UI
          variations.forEach((data) => {
            addToPage(data, 'button.tabs__tab.variation-' + data.variation);
          });
        }
      });
    });
  } else if (section == 'audiences' && guid != '') {
    getJsonFromAPI(lyticsApi + 'account/' + aid).then((res) => {
      return res.data;
    }).then((accountData) => {
      getJsonFromAPI(lyticsApi + 'segment/' + guid + '?account_id=' +
        accountData.id).then(res => {
        addToPage(res.data, 'div h2.segment-name');
      });
      return accountData;
    });
  }
}

// addToPage adds our HTML elements to the page so we can hover over them
const addToPage = (text, selector) => {
  let myDiv = document.createElement('div');
  myDiv.classList.add('tooltippy');
  myDiv.innerHTML = '<svg class="fill-light-primary icon icon--info-2" \
    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"> \
    <path d="M12.5 4.5c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 12.5c0 .3-.2.5-.5.5h-1c-.3 0-.5-.2-.5-.5v-6c0-.3.2-.5.5-.5h1c.3 0 .5.2.5.5v6zm0-8c0 .3-.2.5-.5.5h-1c-.3 0-.5-.2-.5-.5V8c0-.3.2-.5.5-.5h1c.3 0 .5.2.5.5v1z"> \
    </path> \
    </svg>';

  let myPre = document.createElement('pre');
  myPre.classList.add('tooltippytext');

  let str = JSON.stringify(text, null, 2);

  // much secure
  str = str.replace(/</g, '&lt;');
  str = str.replace(/>/g, '&gt;')
  
  myPre.innerHTML = str;
  myDiv.append(myPre);

  document.querySelector(selector).before(myDiv);
}

chrome.runtime.onMessage.addListener((request) => {
    if (request.command === 'doit') {
      doit();
    }
  });