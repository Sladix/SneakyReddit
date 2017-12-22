import ext from "./utils/ext";

/*
* Template types :
* t3 => submission
*/

var chromeTemplate = {
  injectionSelector : ".scroll-list-section-body",
  templates : {
    t3 : `<div class="scroll-list-item top-level-item expand" data-id="##id##">
      <div class="an b9">
        <div class="jS">
          <div class="iG Kc"><img class="gi" src = "https://ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/avatars/avatar_tile_a_28.png"/></div>
          <div class="hY lq ss">##author##</div>
          <div class="rv">
          <div class="l9">
            <div class="g6">
              ##title##
            </div>
            <ul class="iK eZ" aria-label="Actions sur les éléments" role="toolbar" jstcache="87">
              <li class="dU action actionIcon AK ew IDHmlf itemIconPin load-comment" data-id="##id##"><img src="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/1x/btw_ic_pin_black_24dp.png" srcset="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/2x/btw_ic_pin_black_24dp_2x.png 2x" aria-hidden="true"></li>
              <li class="dU action actionIcon AK ew qt cCDEtf itemIconSnooze"><img src="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/1x/btw_ic_snooze_black_24dp.png" srcset="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/2x/btw_ic_snooze_black_24dp_2x.png 2x" aria-hidden="true" jstcache="93"></li>
              <li class="dU action actionIcon AK ew yGmXKc itemIconTrash"><img src="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/1x/btw_ic_mark_trash_black_24dp.png" srcset="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/2x/btw_ic_mark_trash_black_24dp_2x.png 2x" aria-hidden="true" jstcache="93"></li>
              <li class="dU action actionIcon AK ew LX5qPe gyUykd itemIconDone"><img src="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/1x/btw_ic_done_black_24dp.png" srcset="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/2x/btw_ic_done_black_24dp_2x.png 2x" aria-hidden="true" jstcache="93"></li>
              <li class="dU action actionIcon AK ew actionMoveToMenu cCDEtf itemIconOverflow"><img src="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/1x/btw_ic_overflow_black_24dp.png" srcset="//ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/2x/btw_ic_overflow_black_24dp_2x.png 2x" aria-hidden="true" jstcache="93"></li>
            </ul>
          </div>
          </div>
          <div class="expanded"></div>
          <div class="comments"></div>
        </div>
      </div>
    </div>`,
    t1: `<div>
      ##body##
      <p>user : ##author##</p>
    </div>`
  },
  actions : [
    {
      name : "expand",
      trigger : ".expand",
      classList : ['scroll-list-item-open'],
      target : ".expanded"
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
      if(request.type == "inbox"){
        let requestedPath = 'r/france/';
        ext.tabs.query({active: true, currentWindow: true}, function(tabs) {
          var activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, { action: 'inject', template : chromeTemplate, requestedPath : requestedPath },function(){
            sendResponse({ action: "inject"});
          });
        });
      }else{
        sendResponse({ action: "error", message : "The type "+request.type+" is not yet implemented"});
      }
    }
  }
);
