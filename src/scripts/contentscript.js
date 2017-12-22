import ext from "./utils/ext";

let templateData = {};
let requestedPath = '';
let app = null;
let appDatas = {};


const getJSON = function(url, successHandler, errorHandler) {
	const xhr = typeof XMLHttpRequest != 'undefined'
		? new XMLHttpRequest()
		: new ActiveXObject('Microsoft.XMLHTTP');
	xhr.open('get', url, true);
	xhr.onreadystatechange = function() {
		var status;
		var data;
		// https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
		if (xhr.readyState == 4) { // `DONE`
			status = xhr.status;
			if (status == 200) {
				data = JSON.parse(xhr.responseText);
				successHandler && successHandler(data);
			} else {
				errorHandler && errorHandler(status);
			}
		}
	};
	xhr.send();
};

const htmlToElement = (html) => {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

const actions = {
  expand : function(action,clicked,rootEl){
    // Add the needed classes
    if(action.classList){
      rootEl.classList.toggle(action.classList);
    }
    // Get the item ID
    var id = clicked.dataset.id;
    if(!clicked.dataset.loaded){
      let target = rootEl.querySelector(action.target);
      fetchReddit(requestedPath+id,function(data){
        processItemData(data[1].data,target);
        clicked.dataset.loaded = true;
      })
    }
  }
};

var processItemData = (data,el = null) => {
  data.children.forEach((item)=>{
    // Get item type
    let type = item.kind;
    // Check if a template exist for this type
    if(templateData.templates[type]){
      // Create a copy of the template
      let templatePart = (' ' + templateData.templates[type]).slice(1);
      // Find all tags to be replaced
      let tags = templatePart.match(/##(.*)##/g);
      let valid = false;
      tags.forEach((tag) => {
        // get the original property name
        let naked = tag.replace(/#/g,'');
        if(item.data && item.data[naked]){
          // replace the tag by the json value
          templatePart = templatePart.replace(tag,item.data[naked]);
          valid = true;
        }
      });
      // If at least one tag is replace, we add the element
      if(valid){
        let element = htmlToElement(templatePart);
        templateData.actions.forEach((action) => {
          // If the action exists we add listeners
          if(actions[action.name]){
            let toListen = (element.classList.contains(action.trigger.replace('.','')))?element:element.querySelector(action.trigger);
            // If a listenner must be set, set it
            if(toListen){
              toListen.addEventListener('click',(e)=>{
                actions[action.name](action,e.currentTarget,element);
                e.preventDefault();
                e.stopPropagation();
              });
            }
          }
        });
        if(el == null){
          el = app;
        }
        el.appendChild(element);
      }
    }
  });
}

var assignDataToTemplate = (data) => {
  if(data.constructor === Array){
    data.forEach((d)=>{
      assignDataToTemplate(d);
    })
  }else if(data.kind && data.kind == "Listing"){
      processItemData(data.data);
  }
};

var fetchReddit = (path,callback) => {
   let url = 'https://www.reddit.com/'+path+'.json';
   getJSON(url,(data) => {
     callback(data);
   },
   (status) => {
     console.log("Error code : "+status);
   }
   )
};

var injectApp = () => {
  if(app == null){
    var injectionSpot = document.querySelector(templateData.injectionSelector);
    app = document.createElement('div');
    app.id = "sneaky-reddit-app";
    injectionSpot.appendChild(app);
  }

  updateAppData();
};

var updateAppData = () => {
  if(!requestedPath){
    return;
  }
  // reset app html
  app.innerHTML = '';
  fetchReddit(requestedPath,assignDataToTemplate);
};

var extractType = () => {
  var url = document.location.href;
  let type = 'default';
  if(url.match(/inbox\.google/)){
    type = 'inbox';
  }
  if(url.match(/mantis\./)){
    type = 'mantis';
  }

  return type;
};

console.log("Script injected");

function onRequest(request, sender, sendResponse) {
  if (request.action === 'process-page') {
    let data = {
      type : extractType()
    };
    sendResponse(data);
  }else if (request.action === 'inject') {
    templateData = request.template;
    requestedPath = request.requestedPath;
    injectApp();
  }else if (request.action == "changePath"){
    requestedPath = request.requestedPath;
    updateAppData();
  }
};

ext.runtime.onMessage.addListener(onRequest);
