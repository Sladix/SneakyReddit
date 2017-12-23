import ext from "./utils/ext";

let templateData = {};
let currentPath = '';
let app = null;
let appDatas = {};

const choose = (array) => {
	return array[Math.floor(Math.random() * array.length)];
}

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

// List of actions template can execute
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
      fetchReddit(currentPath+id,function(data){
				// TODO : Handle multiple targets
				//processItemData(data[0].data,target);
        processItemData(data[1].data,target);
        clicked.dataset.loaded = true;
      })
    }
  },
  open : function(action,clicked,rootEl){
    // Add the needed classes
    if(action.classList){
      rootEl.classList.toggle(action.classList);
    }
    let url = clicked.dataset.url;
    window.open(url, '_blank');
  },
	loadReplies : function(action,clicked,rootEl){
		console.log("fuck off");
    // Add the needed classes
    if(action.classList){
      clicked.closest(action.target).classList.toggle(action.classList);
    }

	}
};

// Template generation helpers
const templateFunctions = {
	getRandomLetter(){
		return choose("abcdefghijklmnopqrstuvwxyz".split(""));
	},
	getFirstLetter(word){
		for (var i = 0; i < word.length; i++) {
			if(word[i].match(/[a-z0-9]/i)){
				return word[i].toLowerCase();
			}
		}
	},
	intValue(value){
		return (value)?parseInt(value):0;
	}
}

// Process the data from reddit and apply it in the template then insert in the dom
var processItemData = (data,el = null) => {
	console.log(data);
	if(data.kind && data.kind == "Listing"){
		data = data.data;
	}
	if(data.constructor === Array){
    data.forEach((d)=>{
      processItemData(d,el);
    })
  }
	let finalString = ''; // Used if we want to get raw html instead of injecting nodes to the dom
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
					if(item.data[naked].kind && item.data[naked].kind == "Listing"){
						// If we got a listing process it but as a string
						templatePart = templatePart.replace(tag,processItemData(item.data[naked],false));
					}else{
          	templatePart = templatePart.replace(tag,item.data[naked]);
					}
          valid = true;
        }else{
					templatePart = templatePart.replace(tag,'');
				}
      });
			// Find all the utilities tag
			let utilities = templatePart.match(/%%%(.*)%%%/g);
			if(utilities){
	      utilities.forEach((util) => {
	        // get the original property name
	        let naked = util.replace(/%%%/g,'');
	        if(naked[0] == '[' && naked[naked.length-1] == ']'){
						naked = JSON.parse(naked);
						templatePart = templatePart.replace(util,choose(naked));
					}
					let parts = naked.split("_");
					let arg = null;
					if(parts.length > 1){
						naked = parts[0];
						arg = parts.slice(1).join('_');
					}
					if(templateFunctions[naked]){
						templatePart = templatePart.replace(util,templateFunctions[naked](arg));
					}
	      });
			}

			if(el === null){
				el = app;
			}
			// If at least one tag is replaced AND we have an element, we add the element
			// Eitherway we return the string;
      if(valid && el){
        let element = htmlToElement(templatePart);
        templateData.actions.forEach((action) => {
          // If the action exists we add listeners
          if(actions[action.name]){
            let toListen = (element.classList.contains(action.trigger.replace('.','')))?element:element.querySelectorAll(action.trigger);
            // If a listenner must be set, set it
            if(toListen){
							if(toListen.constructor == NodeList){
								toListen.forEach((i)=>{ addListenerToItem(i,action,element) });
							}else{
								addListenerToItem(toListen,action,element);
							}
            }
          }
        });
        el.appendChild(element);
      }else{
				finalString += templatePart;
			}
    }
  });
	return finalString;
}

const addListenerToItem = (item,action,element) => {
	item.addEventListener('click',(e)=>{
		actions[action.name](action,e.currentTarget,element);
		e.preventDefault();
		e.stopPropagation();
	});
}

// Json query method
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
	let selApp = document.getElementById('sneaky-reddit-app');
	if(selApp){
		app = selApp;
	}
  if(app == null){
    var injectionSpot = document.querySelector(templateData.injectionSelector);
		// Handle the case of the injectionSpot not found

		// Append template style
		var style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = templateData.styles;
		// Append app Container
    app = document.createElement('div');
    app.id = "sneaky-reddit-app";
    injectionSpot.appendChild(style);
    injectionSpot.appendChild(app);

  }

  updateAppData();
};

// Kind of useless method, need to be integrated in processItemData (which shoud be renamed in processData)
var assignDataToTemplate = (data) => {
    processItemData(data);
};

var updateAppData = () => {
  if(!currentPath){
    return;
  }
  // reset app html
  app.innerHTML = '';
  fetchReddit(currentPath,assignDataToTemplate);
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
      type : extractType(),
			injected : (app == null)?false:true,
			path : currentPath
    };
    sendResponse(data);
  }else if (request.action === 'inject') {
    templateData = request.template;
    currentPath = request.currentPath;
    injectApp();
  }else if (request.action == "changePath"){
    currentPath = request.currentPath;
    updateAppData();
  }
};

ext.runtime.onMessage.addListener(onRequest);
