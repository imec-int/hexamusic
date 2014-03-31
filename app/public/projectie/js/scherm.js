var u;

$(document).ready(function() {
  initUnity();
  initSockets();
});

function initUnity (argument) {
  var config = {
    width: 1280,
    height: 720,
    params: { enableDebugging:"0" }

  };

  u = new UnityObject2(config);

  var $missingScreen = jQuery("#unityPlayer").find(".missing");
  var $brokenScreen = jQuery("#unityPlayer").find(".broken");
  $missingScreen.hide();
  $brokenScreen.hide();

  u.observeProgress(function (progress) {
    switch(progress.pluginStatus) {
      case "broken":
        $brokenScreen.find("a").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          u.installPlugin();
          return false;
        });
        $brokenScreen.show();
      break;
      case "missing":
        $missingScreen.find("a").click(function (e) {
          e.stopPropagation();
          e.preventDefault();
          u.installPlugin();
          return false;
        });
        $missingScreen.show();
      break;
      case "installed":
        $missingScreen.remove();
      break;
      case "first":
      break;
    }
  });
  u.initPlugin(jQuery("#unityPlayer")[0], "Hackathon-web.unity3d");

}

function initSockets () {
  socket = io.connect(window.location.hostname);
  //socket debug info:
  socket.on('reconnecting', function(seconds){
    console.log('reconnecting in ' + seconds + ' seconds');
  });
  socket.on('reconnect', function(){
    console.log('reconnected');
  });
  socket.on('reconnect_failed', function(){
    console.log('failed to reconnect');
  });
  // add ourselves to the 'scherm' room AFTER we're connected !!!
  socket.on('connect', function() {
    socket.emit('join', 'scherm' );
  });

  socket.on('projectie', function (data) {
    //console.log(data['projectie'])
    //console.log(data['projectie'][7]);
    //u.getUnity().SendMessage("MAINSCRIPT","SetScaleX",data['projectie'][0]/110);
    //u.getUnity().SendMessage("MAINSCRIPT","SetScaleY",data['projectie'][1]/130);
    //u.getUnity().SendMessage("MAINSCRIPT","SetScaleZ",data['projectie'][2]/120);
    //u.getUnity().SendMessage("MAINSCRIPT","SetSpacingX",data['projectie'][3]/50);
    //u.getUnity().SendMessage("MAINSCRIPT","SetSpacingY",data['projectie'][4]/66);
    //u.getUnity().SendMessage("MAINSCRIPT","SetCubesX",data['projectie'][5]/1);
    //u.getUnity().SendMessage("MAINSCRIPT","SetCubesY",data['projectie'][6]/1);
    //u.getUnity().SendMessage("MAINSCRIPT","SetColor",data['projectie'][7]);
    u.getUnity().SendMessage("MAINSCRIPT", "Beat", "");
    //console.log('beat');
  });

  socket.on('ctrl', function(data){
    u.getUnity().SendMessage("MAINSCRIPT", "SetColor", data['bgcolor']);
    //console.log(data['bgcolor']);
  });

  socket.on('twitter', function(data){
    console.log(data.msg);
    var twtext = data.msg.tag.split(" ");
    var splittext = "";

    function splitText(text){
      var length = 0;
      for(var i = 0; i < text.length; i++){
        length += text[i].length //add word length
        splittext += ( twtext[i] + " " );
        if(length > 20){
          splittext += "\n";
          length = 0;
        }
      }
    }

    splitText(twtext);
    u.getUnity().SendMessage("MAINSCRIPT", "SetTag", splittext);
    u.getUnity().SendMessage("MAINSCRIPT", "SetTagValue", data.msg.count);
  });

  socket.on('leap', function(data){
    console.log(data.msg.palm[0]);
    u.getUnity().SendMessage("MAINSCRIPT", "SetRotateX",data.msg.palm[2]/10);
    u.getUnity().SendMessage("MAINSCRIPT", "SetRotateY",data.msg.palm[2]/10);
  })
}