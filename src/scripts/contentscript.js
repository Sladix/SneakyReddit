import ext from "./utils/ext";

// var extractTags = () => {
//   var url = document.location.href;
//   if(!url || !url.match(/^http/)) return;
//
//   var data = {
//     title: "",
//     description: "",
//     url: document.location.href
//   }
//
//   var ogTitle = document.querySelector("meta[property='og:title']");
//   if(ogTitle) {
//     data.title = ogTitle.getAttribute("content")
//   } else {
//     data.title = document.title
//   }
//
//   var descriptionTag = document.querySelector("meta[property='og:description']") || document.querySelector("meta[name='description']")
//   if(descriptionTag) {
//     data.description = descriptionTag.getAttribute("content")
//   }
//
//   return data;
// }

var fetchReddit = (path) => {

}

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
}

function onRequest(request, sender, sendResponse) {
  if (request.action === 'process-page') {
    let data = {
      type : extractType()
    };
    sendResponse(data);
  }
  if (request.action === 'inject') {

  }
}

ext.runtime.onMessage.addListener(onRequest);
