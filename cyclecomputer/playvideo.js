import {parseXML,gpxArray,youtubeVideoId,resetYoutubeVideoId} from './parsegpx.js';
window.playVideo=playVideo
window.pauseVideo=pauseVideo
window.slowVideo=slowVideo
window.speedVideo=speedVideo
window.selectVideo=selectVideo
window.openFullscreen=openFullscreen
    var myVideo = document.getElementById("myVid");
 var youtubePlayer = document.getElementById("youtubePlayer");
export var gpxfile;
export let syncsGreater=0;
export let syncsLess=0;
export let videoDirectory="Videos/";
//export let youtubePlayer;

export  function selectVideo() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = ['.mp4','MP4']

    input.onchange = e => { 
    /*
    file.name // the file's name including extension
file.size // the size in bytes
file.type // file type ex. 'application/pdf'
*/
        const file = event.target.files[0]; // Get the selected file
            if (file) {
                const videoURL = URL.createObjectURL(file); // Create an object URL
                const videoPlayer = document.getElementById('myVid');
                videoPlayer.src = videoURL; // Set the video source
                //videoPlayer.play(); // Auto-play the video
                resetYoutubeVideoId();
            }

      
}

input.click();

    }

export  function selectVideo2() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = ['.mp4','MP4']

    input.onchange = e => { 
    /*
    file.name // the file's name including extension
file.size // the size in bytes
file.type // file type ex. 'application/pdf'
*/
    let file  = e.target.files[0]; 
    console.log("File selected " + file);
     //document.getElementById('myVid').innerHTML = file.name;
    document.getElementById("myVid").src=videoDirectory+file.name;
     
    //myVideo = file.name;
    myVideo = document.getElementById("myVid");
    logger("filename "+file.name);
    logger("new file " + myVideo.innerHTML)
    gpxfile=(file.name).replace("mp4","gpx");
      logger("gpx file " + gpxfile);
        var newfile = new File(["foo"], gpxfile, {
  type: "text/plain",
});
   
    //parseXML(videoDirectory+gpxfile);
       // parseXML(newfile)
    logger("gpxArray " + gpxArray);   
    //openFullScreen();
      resetYoutubeVideoId();
    
}

input.click();

    }

export function openFullscreen() {
     myVideo = document.getElementById("myVid");
  if (myVideo.requestFullscreen) {
    myVideo.requestFullscreen();
  } else if (myVideo.webkitRequestFullscreen) { /* Safari */
    myVideo.webkitRequestFullscreen();
  } else if (myVideo.msRequestFullscreen) { /* IE11 */
    myVideo.msRequestFullscreen();
  }
}
export function playVideo() { 
     //myVideo.innerHTML = "TBLoop.MP4"
     logger("***Starting video");
    myVideo.muted=true;
    //myVideo.volume=0;
     if (youtubeVideoId == null) {
    myVideo.play(); 
         } else {
         youtubePlay();
         }
} 
export function pauseVideo() { 
    logger("***Pausing video");
      if (youtubeVideoId == null) {
 myVideo.pause(); 
          } else {
          youtubePause();
          }
} 
export function slowVideo( ) {
    myVideo.playbackRate = .5;
}
export function speedVideo() {
    myVideo.playbackRate = 1.25;
}
function logger(text) {
    console.log("playvideo:"+text);
    }
export function changeVideoSpeed(rate,gpxseconds, currentSeconds) {
     console.log("seekVideo:playbackrate "+rate);
    let diff;
     if (youtubeVideoId == null) {
          diff=myVideo.currentTime-gpxseconds;
         } else {
          diff = youtubePlayer.getCurrentTime()-gpxseconds;
         }
     if (diff > 1) { // fast
                rate = rate - diff/10;
    } else if (diff < -1) { // slow
          rate = rate + diff/10;
        }
        
    if (rate < 0.10) {
        rate = 0.10;
        }
    if (rate > 2.0) {
        rate = 2.0;
        }
    console.log("seekVideo:playbackrate "+rate);
    if (youtubeVideoId == null) {
    myVideo.playbackRate =  rate
        } else {
        youtubeSetSpeed(rate);
        }
     
}
export function seekVideo(gpxseconds, syncSeconds) {
    var diff=0;
    //player.getDuration();    // total length
    if (youtubeVideoId == null) {
        diff=myVideo.currentTime-gpxseconds;
        } else {
        diff = youtubePlayer.getCurrentTime()-gpxseconds;
        }
    if (diff < -syncSeconds) { // videos too slow
        syncsLess++;
        }
    if (diff > syncSeconds) { // videos too fast
        syncsGreater++;
        }
    diff=Math.abs(diff);
   // logger("seekVideo:gpxsec " + gpxseconds + " video time " + myVideo.currentTime + " diff " + diff
    //           +"syncs< "+syncsLess + " syncs> "+syncsGreater);
     if (diff > syncSeconds) {
          if (youtubeVideoId == null) {
            myVideo.currentTime = gpxseconds;
              } else {
              youtubeSeekVideo(gpxseconds);
              }
            logger("****Syncing video " + gpxseconds + " diff " + diff);
         }
    }
export function fastSeekVideo(gpxseconds) {
    
    if (Math.abs(myVideo.currentTime-gpxseconds) > 5) {
            myVideo.fastSeek(gpxseconds)
         }
    }



export    function onYouTubeIframeAPIReady2(id) {
      youtubePlayer = new YT.Player('youtubePlayer', {
        height: '800',
        width: '1600',
        videoId: id,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0
        },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
      });
    
    }

function onPlayerReady(event) {
    //event.target.playVideo();
    console.log("Youtube player ready");
  }

  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
      console.log("Youtube Video finished");
    }
  }

export    function youtubePlay() {
    
      youtubePlayer.playVideo();
    }

export    function youtubePause() {
      youtubePlayer.pauseVideo();
    }

export    function youtubeSetSpeed(speed) {
    
     console.log("Using speed " +speed);
      //youtubePlayer.setPlaybackRate(getClosestPlaybackRate(Number(speed)));
    setNearestPlaybackRate(Number(speed));
    }

function setNearestPlaybackRate(rate) {
  if (!youtubePlayer || !youtubePlayer.getAvailablePlaybackRates) return;

  const rates = youtubePlayer.getAvailablePlaybackRates();
  if (!rates.length) return;

  const nearest = rates.reduce((a, b) =>
    Math.abs(b - rate) < Math.abs(a - rate) ? b : a
  );
console.log("Using rate " +nearest);
  youtubePlayer.setPlaybackRate(nearest);
}




export    function youtubeSetVideoId(id) {
    console.log("Video id "+id);
    youtubePlayer.loadVideoById(id);
       // youtubePlayer.cueVideoById(id);
        };

export function youtubeSeekVideo(seconds) {
    youtubePlayer.seekTo(seconds, true);
    }

export    function youtubeExtractVideoId(url) {
    const match = url.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
    }

// Example
const id = youtubeExtractVideoId(
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
);

//player.loadVideoById(id);

