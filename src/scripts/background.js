import ext from "./utils/ext";

/*
* Template types :
* t3 => submission
*/

var chromeTemplate = {
  injectionSelector : ".scroll-list-section-body",
  templates : {
    t3 : `<div class="scroll-list-item top-level-item sr-item">
      <div class="an b9">
        <div>
          <div class="jS expand" style="flex-flow: wrap row;" data-id="##id##">
            <div class="iG Kc"><img class="gi" src = "https://ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/avatars/avatar_tile_%%%getFirstLetter_##author##%%%_28.png"/></div>
            <div class="hY lq ss">
            ##author##
            <span class="qi score"> (%%%intValue_##num_comments##%%%)</span>
            </div>
            <div class="rv">
              <div class="l9">
                <div class="g6">
                  ##title##
                </div>
                <ul class="iK eZ" aria-label="Actions sur les éléments" role="toolbar" jstcache="87">
                  <li class="dU action actionIcon AK ew IDHmlf itemIconPin open-url" data-url="##url##"><img src="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/1x/btw_ic_pin_black_24dp.png" srcset="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/2x/btw_ic_pin_black_24dp_2x.png 2x" aria-hidden="true"></li>
                  <li class="dU action actionIcon AK ew qt cCDEtf itemIconSnooze"><img src="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/1x/btw_ic_snooze_black_24dp.png" srcset="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/2x/btw_ic_snooze_black_24dp_2x.png 2x" aria-hidden="true" jstcache="93"></li>
                  <li class="dU action actionIcon AK ew yGmXKc itemIconTrash"><img src="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/1x/btw_ic_mark_trash_black_24dp.png" srcset="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/2x/btw_ic_mark_trash_black_24dp_2x.png 2x" aria-hidden="true" jstcache="93"></li>
                  <li class="dU action actionIcon AK ew LX5qPe gyUykd itemIconDone"><img src="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/1x/btw_ic_done_black_24dp.png" srcset="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/2x/btw_ic_done_black_24dp_2x.png 2x" aria-hidden="true" jstcache="93"></li>
                  <li class="dU action actionIcon AK ew actionMoveToMenu cCDEtf itemIconOverflow"><img src="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/1x/btw_ic_overflow_black_24dp.png" srcset="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/2x/btw_ic_overflow_black_24dp_2x.png 2x" aria-hidden="true" jstcache="93"></li>
                </ul>
              </div>
            </div>
          </div>
          <div class="self-text">##selftext##</div>
          <div class="expanded"></div>
        </div>
      </div>
    </div>`,
    t1: `<div class="sr-comment">
      ##body##
      <span>user : ##author##</span>
      <div class="children">##replies##</div>
      <span class="load-replies"></span>
    </div>`
  },
  styles : `
    .sr-item .expand{
      cursor: pointer;
    }
    .sr-item .score{
      margin-left:3px;
    }
    .sr-item .self-text,
    .sr-item .expanded{
      display:none;
    }
    .sr-item .self-text:not(:empty){
      box-shadow: 0 -1px 0 #e0e0e0, 0 0 2px rgba(0,0,0,.12), 0 2px 4px rgba(0,0,0,.24);
      width: 100%;
      margin: 1rem 4.5rem;
      padding: 1rem;
    }
    .fake-open .self-text,
    .fake-open .expanded{
      display:block;
      white-space:normal;
    }
    .fake-open .expanded{
      padding: 1rem 4.5rem;
      width: 100%;
    }
    .sr-comment{
      margin-bottom:10px;
    }
    .sr-comment > .children:not(:empty) + .load-replies:before{
      content: '+';
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      width: 24px;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius:3px;
    }
    .sr-comment.active > .children:not(:empty) +  .load-replies:before{
      content: '-';
    }
    .sr-comment > .children{
      display: none;
    }
    .sr-comment.active > .children{
      display: block;
    }
  `,
  actions : [
    {
      name : "expand",
      trigger : ".expand",
      classList : ['fake-open'],
      target : ".expanded"
    },
    {
      name : "open",
      trigger : ".open-url"
    },
    {
      name : "loadReplies",
      trigger : ".load-replies",
      target : ".sr-comment",
      classList : ['active']
    }
  ]
};

ext.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.action === "perform-save") {
      console.log("Extension Type: ", "/* @echo extension */");
      console.log("PERFORM AJAX", request.data);

      sendResponse({ action: "saved" });
    }else if (request.action == "inject-signal") {
      request.currentPath = 'r/rance/';
      if(request.type == "inbox"){
        ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
          var activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, { action: 'inject', template : chromeTemplate, currentPath : request.currentPath });
          sendResponse({ action: "inject"});
        });
      }else{
        sendResponse({ action: "error", message : "The type "+request.type+" is not yet implemented"});
      }
    }
  }
);
