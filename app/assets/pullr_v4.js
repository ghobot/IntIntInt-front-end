//Helped by code from  Brian Chirls, Chris Allick, and Clea Barnett

     var vpl = []; //starts with countdown clock
     var jsonUrl = ""; //website with json   
     var items = [];  // information of videos
     var containers = []; //array of video containers on page
     var regex=/[\w\d]+#t=[\w]{2,}/g;
     var timeCodeArray = [];
     var youtubeIdArray = []; 
     var timeCodeArraySeconds = [];       
     var a, b, t, iframeUrl, player, dur, hasPlayed, timeCodeSplit, currentVideo, timeCode, timeRegex, timeCode1, timeCodeSecondsString, timeCodeSeconds, ytid; //ytid place holder
     var onPlayerReadyCounter = 0;
     var playlistCounter = 0;
     var myvids = [];
     var vidcount = 0;
     var playing = 0;
     var durs =  ['3']  ; //[ '7.72', '7.869', '7.901', '7.23' , '7.13', '7.23' , '7' ];
     var getPlotsState = false; //initialize get plots state
     var done = false;
     var buffering = 0;
    
    console.log ("variables initiated");

function getYoutubeArray (json) { //creates an array from the json data       
    $.each(json, function (key, val) { 
       //console.log("val: " + val );               
        vpl = val.match(regex); //search the json data for the id format globally
        //console.log("vpl = " + vpl);            
    });              
} 
    
function countArray() {
  
  if(vpl.length > 0)  {
    var n  = vpl.length;
    //console.log("the Youtube ID Array has " + n + " videos");
      return n; 
  }
}

function insertVideos (json) {
    getYoutubeArray(json);    
  }



function getYoutubeInfoArray (video) { 
    //console.info("currentVideo = " + currentVideo, "ytid = " + ytid, "timecode = " + timeCode, "timecode in Seconds = " + timeCodeSeconds);
    currentVideo = video;
    timeCodeSplit = currentVideo.split(/#t=/);  //find the time of each id. 
    timeCode = timeCodeSplit[1];
    timeCodeArray.push(timeCode);
    timeRegex = /[\d]+m\d\d/; //regex matches the 99m99 and ignores the "s"
    timeCode1 = timeCode.match(timeRegex);
    timeCodeSecondsString = timeCode1.toString().split(/m/); //to split the seconds and minutes, we must make the object a string
    timeCodeSeconds = 60*(Number(timeCodeSecondsString[0])) + (Number(timeCodeSecondsString[1])); //the minutes are converted to seconds 
    ytid = timeCodeSplit[0];             

    youtubeIdArray.push(ytid);
    timeCodeArraySeconds.push(timeCodeSeconds);
    dur = '5';
    durs.push(dur); 
} 

function createUrlInfo() {
    $.each(youtubeIdArray, function (i) {//visualize the array on screen and create spaceholders
            items.push('<li>' + youtubeIdArray[i] + '</li>');    
            containers.push('<div class="ytVideo" id="player' + i + '"></div>'); 
            //console.info("new player div created");                 
    });
    $('<ol/>', {
      'class': 'my-new-list',
      html: items.join('')
    }).appendTo('#ytPlayerInfo');

    $(containers.join('')).appendTo('#video_grid'); 
      
      $(".ytVideo").each(function (i) {
        //var n = "zind-" + (i);
        $(this).css('z-index' , 999-i);
      });        
}

function createPlayerDivs () {   
   var n = countArray();
   var i; 
   for (i = 0; i<=n; i++ ) {
    containers.push('<div class="ytVideo"  id="player' + i + '"></div>'); 
    //console.info("new player div created"); 
    $(containers.join('')).appendTo('#video_grid'); 
     }
}

function getPlots(n) {
  var baseUrl = String(n);

  //console.log("baseUrl = " + baseUrl);
 
  var regex1 = /pullr\.herokuapp\.com\/plots\/[\d]+/; // pullr.herokuapp.com/plots/13
  var regex2 = /pullr\.herokuapp\.com\/plots\/[\d]+\.json/; // http://pullr.herokuapp.com/plots/13.json
  var regex3 = /^\d+$/; // only a number
  var regex4 = /http:\/\/pullr\.herokuapp\.com\/plots\/[\d]+/; //url without json
  var regex5 = /http:\/\/pullr\.herokuapp\.com\/plots\/[\d]+\.json/; // actual url 
  var regex6 = /http:\/\/reallysmallears\.com\/vibrant\/auv\/[\d]+\.json/

  if ( regex3.test(baseUrl) ) {
    jsonUrl = "http://pullr.herokuapp.com/plots/" + baseUrl + ".json";
    //console.log("baseUrl is a number");
    return true;
  } else if (regex4.test(baseUrl)) {
   jsonUrl = baseUrl;
   return true;
  } else if (regex1.test(baseUrl)) {
    jsonUrl = 'http://' + baseUrl +'.json';
    return true; 
  } else if (regex2.test(baseUrl)) {
    jsonUrl = 'http://' + baseUrl;
    return true; 
  } else if (regex5.test(baseUrl)) {
    //console.log("baseUrl matches the full json url");    
    jsonUrl = baseUrl;
    return true;
  } else if (regex6.test(baseUrl)) {
    //console.log("test url on really small ears");    
     jsonUrl = baseUrl;
     return true;
  } else {
    return false; 
  } 
}


function getVideos() {  //change so that it is async, use on readystate 4
     $.ajax({
      url: jsonUrl,
      async: false,
      cache: false,
      dataType: 'json',
      success: function (json) { 
         $("#pullr_status").html('<p id="pullr_message" class="success fade-in two">Your movie will load soon!</p>');

          //console.log("success");

          getYoutubeArray(json);
          
          $.each(vpl , function(i) {

            var n = vpl[i];
            getYoutubeInfoArray (n); //parse the json for data
          });

          createUrlInfo();
          
          var tag = document.createElement('script');
          tag.src = "http://www.youtube.com/player_api";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          return true;
      
        },
        error: function() {
       $("#pullr_status").html('<p id="pullr_message" class="fail">pULLr says that movie does not exist.</p>');
        }     
    });
}


//*********** youtube javascript api functions ****************    

function hidePlayer () {    
    $('iframe').eq( playing ).css( 'z-index' , 1000);
    $('iframe').eq( playing - 1).css( 'z-index' , 990);
}

function playNextVideo() {
    myvids[ playing ].seekTo ( timeCodeArraySeconds[ playing ]);
    //console.info(" seek to : " + timeCodeArraySeconds[ playing ]);
    myvids[ playing ].playVideo();
    //pausecomp(1000);
    console.info("playing = " + playing);
    hidePlayer();
}
         
function onPlayerReady (event) {    
      vidcount++;
      //console.info("onPlayerReady fired , vidcount = " + vidcount);
      //bufferVideo();

  if( vidcount == myvids.length) {
    playNextVideo();
  }
}

function bufferVideo () {
  myvids[vidcount].playVideo();
  setTimeout( myvids[vidcount], 100 );

}

function pausecomp(millis) {
    var date = new Date();
    var curDate = null;

    do { curDate = new Date(); } 
    while(curDate-date < millis);
} 

function stopVideosAndRefresh() {
    myvids[ playing ].pauseVideo();
        
    if( t ) {
      clearTimeout( t );
    }

    buffer = 0;
    hasPlayed = 0;
    playing = 0;
    vidcount = 0;
    var i;
    for (i = 0; i > youtubeIdArray.length; i++) {
        var n = "#player" + i;
        $(n).html(" ");
        onYouTubePlayerAPIReady();
    }
}

function stopVideo( ) {
  clearTimeout( t );
  myvids[ playing ].pauseVideo();

  if( playing == youtubeIdArray.length - 1 ) {
    //console.info("**** playing ***** = " + playing);

    hasPlayed = 1;
    buffer = 0;
    playing = 0;
    playNextVideo();
    console.info("Looping");
  } else if ( playing < youtubeIdArray.length - 1 ) {
    playing++;
    buffer = 0;
    //console.log("the playing is less than youtubeidarray length");
    playNextVideo();

  }
}

function onPlayerError (event) { // should change this to skip the video. could be unembeddable. 
 //alert("OnError:"+event.data);
 console.log("onError:" + event.data);
 if (  event.data == 150 ) {     
  //console.info("video did not load , vidcount = " + vidcount);
  stopVideo();
} 
}
function checkPlayerTime () {

  //setTimeout (myvids[playing].getCurrentTime(), 100 ); //if i wanted to check it constantly
  var seconds = myvids[ playing ].getCurrentTime();
  //console.log("seconds = " + seconds );
  return seconds;
  
}

function resetPlayer () { //destroy all videos on the screen and reset all global parameters
  $("iframe.ytVideo").remove();

   vpl = []; //video playlist array
   jsonUrl = ""; //website with json   
   items = [];  // information of videos
   containers = []; //array of video containers on page
   timeCodeArray = [];
   youtubeIdArray = ['aKBKwSsmyOc'];//['pB5uCKkvxzo'];
   timeCodeArraySeconds = [1];  
   getPlotsState = false; //initialize get plots state
   buffering = 0;
   myvids = [];
   vidcount = 0;
   playing = 0;
   done = false;


   //console.log("all parameters reset"); 
}  

function onPlayerStateChange (event) {
 
  //console.log("onPlayerStateChange has fired!");
  checkPlayerStatus();

  function checkPlayerStatus() {
    var currentTimeElapsed = (checkPlayerTime() - timeCodeArraySeconds[playing]);   //
   console.log("currentTimeElapsed = " + currentTimeElapsed);

  if ( buffering == 0 ) {
    if ( event.data == YT.PlayerState.BUFFERING ) {
      buffering = 1;
      //console.log("buffer is has been changed to 1");
    }
  } else if ( buffering == 1 ) {
      //console.log("buffer is 1");
      if ( event.data == YT.PlayerState.PLAYING ) {     
        if ( currentTimeElapsed > durs [ playing ] && currentTimeElapsed > 2) {  
          //console.log("player has passed interval time");
            stopVideo();
          console.info("CHECKPLAYER STATUS: the player will now go to the next movie = " + playing);
        } else {
          //console.log("looping");
          setTimeout(checkPlayerStatus , 1000);
        }
      }
  }
      //t = setTimeout( stopVideo, ( durs[ playing ] * 1000 ) + ( 100 * hasPlayed ) );
}
}

function onYouTubePlayerAPIReady() {
   // console.log("onYouTubePlayerAPIReady has fired");
    $("#pullr_message").fadeOut().remove();
    var i; 
    for ( i = 0; i < youtubeIdArray.length; i++) {
      var n = "player" + i;
    myvids[i] = new YT.Player (n, {
        height: '540',
        width: '960',
        videoId:  youtubeIdArray[i],
        playerVars: { 'wmode' : 'transparent', 'controls' : 0, 'enablejsapi' : 1,  'rel': 0, 'showinfo': 0, 'egm': 0, 'showsearch': 0 ,}, 
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': onPlayerError
        }
    });
  }
//console.info ("durs = " + durs );
}

$(document).ready( function () {
  $("#plotsButton").click( function () {

    var baseUrl = $("#plots").val();

    //console.log("the text area has been clicked");
    resetPlayer();
    $("#pullr_status").html('<p id="pullr_message"></p>');

    getPlotsState = getPlots(baseUrl) ; //validate plot field value

    if (getPlotsState) {
        getVideos();
        
    } else {
      $("#pullr_status").html('<p id="pullr_message" class="fail fade-in two">pULLr could not retrieve your movie. Please try again.</p>');
    }
});
 
 $('footer').hover( function () {
   $('h1',$(this)).stop().animate({'marginLeft':'-2px'},400);
  },
  function () {
   $('h1',$(this)).stop().animate({'marginLeft':'-185px'},200);
  });

});