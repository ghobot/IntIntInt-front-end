// Pullr Intel Vibrant Project 2012 Greg Dorsainville, StepanBoltalin, Alexander kozovski
//Helped by code from  Brian Chirls, Chris Allick, and Clea Barnett
// this version is refactored and streamlined from the functionalpullr_v4 (fallback for demo with skipping issue).

     var vpl = []; //starts with countdown clock
     var jsonUrl = ""; //website with json
     var items = [];  // information of videos
     var containers = []; //array of video containers on page
     var timeCodeArray = [];
     var youtubeIdArray = [];
     var timeCodeArraySeconds = [];
     var myvids = [];
     var vidcount = 0;
     var playing = 0;
     //var durs =  3  ; //[ '7.72', '7.869', '7.901', '7.23' , '7.13','7.23' , '7' ];
     var getPlotsState = false; //initialize get plots state
     var done = false;
     var buffering = 0;
     var hasPlayed; //ytid place holder
     var currentTimeElapsed;


    console.log ("variables initiated");

function getYoutubeArray (json) { //creates an array from the json data
  var regex=/[\w\d]+#t=[\w]{2,}/g;
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
    var currentVideo = video;
    var timeCodeSplit = currentVideo.split(/#t=/);  //find the time of each id.
    var timeCode = timeCodeSplit[1];
    timeCodeArray.push(timeCode);
    var timeRegex = /[\d]+m\d\d/; //regex matches the 99m99 and ignores the "s"
    var timeCode1 = timeCode.match(timeRegex);
    var timeCodeSecondsString = timeCode1.toString().split(/m/); //to split the seconds and minutes, we must make the object a string
    var timeCodeSeconds = 60*(Number(timeCodeSecondsString[0])) + (Number(timeCodeSecondsString[1])); //the minutes are converted toseconds
    var ytid = timeCodeSplit[0];
    youtubeIdArray.push(ytid);
    timeCodeArraySeconds.push(timeCodeSeconds);
    //var durs = '4';
    //durs.push(dur);
}

function createUrlInfo() {
    $.each(youtubeIdArray, function (i) {//visualize the array on screen and create spaceholders
            items.push('<li>' + youtubeIdArray[i] + '</li>');
            containers.push('<div class="ytVideo" id="player' + i +'"></div>');
            //console.info("new player div created");
    });
    $('<ol/>', {
      'class': 'my-new-list',
      html: items.join('')
    }).appendTo('#ytPlayerInfo');

    $(containers.join('')).appendTo('#video_grid');

      $(".ytVideo").each(function (i) {
        $(this).css('z-index' , 999-i);
      });
}

function createPlayerDivs () {
   var n = countArray();
   var i;
   for (i = 0; i<=n; i++ ) {
    containers.push('<div class="ytVideo"  id="player' + i + '"></div>');
    $(containers.join('')).appendTo('#video_grid');
     }
}

function getPlots(n) {
  var baseUrl = String(n);
  var regex1 = /pullr\.herokuapp\.com\/plots\/[\d]+/; //pullr.herokuapp.com/plots/13
  var regex2 = /pullr\.herokuapp\.com\/plots\/[\d]+\.json/; //http://pullr.herokuapp.com/plots/13.json
  var regex3 = /^\d+$/; // only a number
  var regex4 = /http:\/\/pullr\.herokuapp\.com\/plots\/[\d]+/; //urlwithout json
  var regex5 = /http:\/\/pullr\.herokuapp\.com\/plots\/[\d]+\.json/;// actual url
  var regex6 = /http:\/\/reallysmallears\.com\/vibrant\/auv\/[\d]+\.json/;

  if ( regex3.test(baseUrl) ) {
    jsonUrl = window.location.href + ".json";
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

function waiting() {
  videoReady();
  var waitingImage  = [];
  var glow = '<div id="theGlow" class="ytVideo1 zind-top pulse"></div>';
  var tint =  '<div id="theTint" class="ytVideo1 zind-top"></div>';
  var message = '<h1 id="loadscreenMessage"> Your video is processing</h1>'
  var video = '<video id="pullrAni" width="1200" height="200" class="ytVideo2 zind-1" loop preload="preload"><source src="pullr.mp4" type="video/mp4" /><source src="pullr.webm" type=' + 'video/webm;codecs="vp8, vorbis"' + '></video>';
       waitingImage.push(glow);
       waitingImage.push(tint);
       waitingImage.push(message);
       waitingImage.push(video);
       $(waitingImage.join('')).appendTo('#video_grid');
}


function videoReady() {

  $("#theGlow").remove();
  $("#theTint").remove();
  $("#loadscreenMessage").remove();
}

function getVideos() {
     $.ajax({
      url: jsonUrl,
      async: false,
      cache: false,
      dataType: 'json',
      success: function (json) {
        videoReady();
         $("#pullr_status").html('<p id="pullr_message" class="success fade-in two">Your movie will load soon!</p>');
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
          // waiting();
       $("#pullr_status").html('<p id="pullr_message" class="fail">pULLr says that movie does not exist....yet</p>');
       setTimeout(getVideos, 10000);

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
    console.info("playing = " + playing);
    hidePlayer();
}

function onPlayerReady (event) {
      vidcount++;
      //console.info("onPlayerReady fired , vidcount = " + vidcount);

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
// if (  event.data == 150 || event.data == 2 ) {
  //console.info("video did not load , vidcount = " + vidcount);
 currentTimeElapsed = -1;
  stopVideo();
//}
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
   console.log("all parameters reset");
}

function onPlayerStateChange (event) {

  //console.log("onPlayerStateChange has fired!");
  //only if a second has passed since the last check
  //trigger this one again
  var durs = 4;
  checkPlayerStatus();

  function checkPlayerStatus() {

      if ( event.data == YT.PlayerState.PLAYING  ) {

        if (myvids[ playing ].getPlayerState() != 1 && myvids[ playing ].getPlayerState() != 3 && myvids[ playing ].getPlayerState() != 5 ) {
        console.log(myvids[ playing ].getPlayerState() + "<<<<<<<<<<<<<<<<<<<<<<<<<<< getPlayerState");

          stopVideo();
          currentTimeElapsed = -1;
      }
      
          currentTimeElapsed = (checkPlayerTime() - timeCodeArraySeconds[playing]);   //

  // console.info("timeCodeArraySeconds = " +timeCodeArraySeconds [playing]);
  // console.info("currentTimeElapsed = " + currentTimeElapsed);

        if ( currentTimeElapsed > durs) {
          //console.log("player has passed interval time");
          //currentTimeElapsed = -1;
            stopVideo();
            currentTimeElapsed = -1;

    //      console.info("CHECKPLAYER STATUS: the player will now goto the next movie = " + playing);
        } else {
          //console.log("looping");
          setTimeout(checkPlayerStatus , 1000);
        }
      }


      //t = setTimeout( stopVideo, ( durs[ playing ] * 1000 ) + ( 100* hasPlayed ) );
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
        playerVars: { 'wmode' : 'transparent', 'controls' : 0,'enablejsapi' : 1 },
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

    // $('#vimeoExample').popover( trigger : 'hover' );
    var baseUrl = $("#plots").val();

    //console.log("the text area has been clicked");
    resetPlayer();
    $("#pullr_status").html('<p id="pullr_message"></p>');

    getPlotsState = getPlots(baseUrl) ; //validate plot field value

    if (getPlotsState) {
        getVideos();

    } else {
      $("#pullr_status").html('<p id="pullr_message" class="fail fade-in two">pULLr could not retrieve your movie. Please try again.</p>');
    };

 // $('footer').hover( function () {
 //   $('h1',$(this)).stop().animate({'marginLeft':'-2px'},400);
 //  },
 //  function () {
 //   $('h1',$(this)).stop().animate({'marginLeft':'-185px'},200);
 //  });

});