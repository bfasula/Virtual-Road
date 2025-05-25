import {parseXML,gpxArray} from './parsegpx.js';
window.playVideo=playVideo
window.pauseVideo=pauseVideo
window.slowVideo=slowVideo
window.speedVideo=speedVideo
window.selectVideo=selectVideo
window.openFullscreen=openFullscreen
    var myVideo = document.getElementById("myVid");
export var gpxfile;
export let syncsGreater=0;
export let syncsLess=0;
export let videoDirectory="Videos/";


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
    logger("***Starting video");
    myVideo.muted=true;
    myVideo.play(); 
} 
export function pauseVideo() { 
    logger("***Pausing video");
 myVideo.pause(); 
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
    
    let diff=myVideo.currentTime-gpxseconds;
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
    //logger("seekVideo:playbackrate "+rate);
    myVideo.playbackRate =  rate
     
}
export function seekVideo(gpxseconds, syncSeconds) {
    let diff=myVideo.currentTime-gpxseconds;
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
            myVideo.currentTime = gpxseconds;
            logger("****Syncing video " + gpxseconds);
         }
    }
export function fastSeekVideo(gpxseconds) {
    
    if (Math.abs(myVideo.currentTime-gpxseconds) > 5) {
            myVideo.fastSeek(gpxseconds)
         }
    }
