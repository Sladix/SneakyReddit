import ext from "./utils/ext";
import storage from "./utils/storage";

var popup = document.getElementById("app");
var injectBtn = document.getElementById('injectBtn');

var type = 'default';

storage.get('color', function(resp) {
  var color = resp.color;
  if(color) {
    popup.style.backgroundColor = color
  }
});

// Option page
var optionsLink = document.querySelector(".js-options");
optionsLink.addEventListener("click", function(e) {
  e.preventDefault();
  ext.tabs.create({'url': ext.extension.getURL('options.html')});
});

// On click, we gather data about page
ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
  var activeTab = tabs[0];
  chrome.tabs.sendMessage(activeTab.id, { action: 'process-page' }, renderInjectOptions);
});

// Renders the different inject option based on the page's gathered datas
var renderInjectOptions = (data) => {
  var displayContainer = document.getElementById("display-container");
  displayContainer.innerHTML = `
  <p class="pageType">Detected page type : ${data.type}</p>
  <div id="messages"></div>`;
  type = data.type;
}

var renderMessage = (msg,error=true) => {
  var messagesContainer = document.getElementById("messages");
  messagesContainer.innerHTML = '';
  var el = document.createElement('p');
  el.innerText = msg;
  el.classList.add(((error)?'error':'success'));
  messagesContainer.appendChild(el);
}

// Send the inject signal to background
injectBtn.addEventListener("click", function(e) {
  e.preventDefault();
  ext.runtime.sendMessage({ action: "inject-signal", type: type }, function(response) {
    if(response && response.action === "inject") {
      renderMessage("Reddit successfully injected !",true);
    } else if (response && response.action == "error") {
      renderMessage("Error : "+response.message);
    }
  })
})
