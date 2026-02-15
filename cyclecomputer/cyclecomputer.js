import {printCSC} from './csc.js';
import {printRSC} from './rsc.js';
import {printWatts} from './ftms.js';
import {dec2bin} from './util.js';
import {CalculateVelocity} from './power_v_speed.js';
import {speedFromPower} from './power_v_speed.js';
import {playVideo,pauseVideo,changeVideoSpeed,seekVideo,syncsGreater, syncsLess,openFullscreen} from './playvideo.js';
import {parseXML,gpxArray,findGPX,printGPX,GPXPoint,loopRoute,gpxFilename,fetchGPXFromServer} from './parsegpx.js';
import {parseZWO,zwoArray,zwoPoint,powerColor,drawTimeCompleted,fetchWOFromServer} from './parsezwo.js';
import {speedFromWatts} from './speedFromWatts.js';
import { TrainerControl , TrainerData} from "./TrainerControl.js";
import { TrainerCommands } from "./TrainerCommands.js";
import {NormalizedPower} from './NormalizedPower.js';
import {updateMarkerOL} from './minimap.js';
//import {sendData} from './senddata.js';

export function modifyTrainerConnected( value ) { trainerConnected = value; }
export function modifyCadenceConnected( value ) { cadenceConnected = value; }


window.onload = function(){
   hideWorkoutCells();
      
    
};
window.onbeforeunload = function () {
    //saveGPS();
    return "Do you really want to close?";
};



const modal = document.getElementById("modal");
const openBtn = document.getElementById("openPicker");
const closeBtn = document.getElementById("closePicker");
const select = document.getElementById("gpxSelect");

openBtn.onclick = () => modal.style.display = "flex";
closeBtn.onclick = () => modal.style.display = "none";
modal.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

async function loadGPXList() {
  const files = await fetch("gpxfiles/index.json").then(r => r.json());
  files.forEach(file => {
      //console.log("file "+file);
      //format gpxfname,description,distance,climbingft,country
      const myArray = file.split(",");
    const opt = document.createElement("option");
   
    
      if (myArray.length > 1) {
          if (myArray.length > 2) {
               opt.textContent = myArray[1] + "-"+myArray[2] + " Miles";
              } else {        
                opt.textContent = myArray[1]; // use description if there is one
              }
           opt.value = "gpxfiles/" +  myArray[0];
          } else {
           opt.textContent = file.replace(".gpx", "");
           opt.value = "gpxfiles/" + file;
          }
    select.appendChild(opt);
  });
}

select.addEventListener("change", e => {
  const url = e.target.value;
  const description = select.selectedOptions[0]?.textContent?.trim() ?? "";
  if (!url) return;

  console.log("Selected:", url);
  modal.style.display = "none";
    if (url == "gpxfiles/Select From Folder") {
        selectGPX();
        } else {
    fetchGPXFromServer(url,description);
        }
  // load GPX here
});

loadGPXList();

const modalwo = document.getElementById("modalwo");
const openBtnwo = document.getElementById("openPickerwo");
const closeBtnwo = document.getElementById("closePickerwo");
const selectwo = document.getElementById("woSelect");

openBtnwo.onclick = () => modalwo.style.display = "flex";
closeBtnwo.onclick = () => modalwo.style.display = "none";
modalwo.onclick = e => { if (e.target === modalwo) modalwo.style.display = "none"; };

async function loadWOList() {
  const files = await fetch("workouts/index.json").then(r => r.json());
  files.forEach(file => {
    //  console.log(file);
    const opt = document.createElement("option");
    opt.value = "workouts/" + file;
    opt.textContent = file.replace(".zwo", "");
    selectwo.appendChild(opt);
  });
}

selectwo.addEventListener("change", e => {
  const url = e.target.value;
  if (!url) return;

  console.log("Selected:", url);
  modalwo.style.display = "none";
    if (url == "workouts/Select From Folder") {
        selectWorkout();
        } else {
    fetchWOFromServer(url);
        }
  //
});

loadWOList();








/* 🆔 SESSION ID FROM URL */
    /*
const params = new URLSearchParams(location.search);
const sessionId = params.get("session");
//const sessionId = 'abc123';
if (!sessionId) {
  document.body.innerHTML = "Missing ?session= in URL";
  throw new Error("No session id");
}
*/
export var powerFTP = Number(localStorage.getItem(".powerFTP"));
export var apikey = localStorage.getItem(".apikey");
console.log("apikey "+apikey);
let tpower=Number(powerFTP*0.65); // zone2
document.getElementById('twatts').innerHTML = (tpower).toFixed(0);
document.getElementById('twatts').style.backgroundColor=powerColor(tpower);

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 109) { // minus
        minusKey();
    }
    else if(event.keyCode == 107) { // plus
       plusKey();
    } 
    else if(event.keyCode == 38) { // up arrow
        upArrow();
    }
    else if(event.keyCode == 40) { // down arrow
        downArrow();
    }
    else if(event.keyCode == 83) { // letter s
      startTimer();
    }
    else if(event.keyCode == 71) { // letter g
      saveGPS();
    }
    else if(event.keyCode == 70) { // letter f
      connectFTMS();
    }
    else if(event.keyCode == 80) { // letter p
      connectPM();
    }
    else if(event.keyCode == 72) { // letter h
      connectHRM();
    }
    else if(event.keyCode == 75) { // letter k
     skipWorkoutInterval();  //skip the workout interal
    }
    else if(event.keyCode == 82) { // letter r
        connectRPM();  // cadence
    }
    else if(event.keyCode == 67) { // letter c
       hideElevationChart();
    }
    else if(event.keyCode == 68) { // letter d
      saveData();
    }
    else if(event.keyCode == 69) { // letter e toggle erg mode
      hideShowERG();
    }
    else if(event.keyCode == 86) { // letter v
        hideHud();
    }
    else if(event.keyCode == 87) { // letter w
        hideWorkout();
    }
    else if(event.keyCode == 77) { // letter m
        hideMap();
    }
    else if(event.keyCode == 65) { // letter a toggle autoshift 
        toggleAutoShift();
    }
    else {
        
        //alert("key "+event.keyCode);
        }
   
});
export function upArrow() {
    if (ERGMode ) {
            if (bWorkout) {
            powerFTP=Number(powerFTP)+10;
            console.log("New ftp "+powerFTP);
            //alert("Temporary ftp "+powerFTP);
            tpower=Number(zwoArray[workoutIndex].power)*powerFTP;
            document.getElementById('twatts').innerHTML = (tpower).toFixed(0);
            document.getElementById('twatts').style.backgroundColor=powerColor(tpower);
            //document.getElementById('twatts').style.opacity=0.5;
                } else {
                 tpower=Number(tpower)+10;
                 document.getElementById('twatts').innerHTML = (tpower).toFixed(0);
                 document.getElementById('twatts').style.backgroundColor=powerColor(tpower);
                    if (smartTrainerConnected) {
                        trainerCommands.sendTargetPower(tpower);
                    }
                }
            } else {
       trainerDifficulty+=10;
        if (trainerDifficulty > 100) {trainerDifficulty=100;} // up arrow
         document.getElementById('trdiff').innerHTML = trainerDifficulty;
            }
    }
export function downArrow() {
     if (ERGMode) {
            if (bWorkout) {
           powerFTP=Number(powerFTP)-10;
             console.log("New ftp "+powerFTP);
            //alert("Temporary ftp "+powerFTP);
             tpower=Number(zwoArray[workoutIndex].power)*powerFTP;
            document.getElementById('twatts').innerHTML = (tpower).toFixed(0);
            document.getElementById('twatts').style.backgroundColor=powerColor(tpower);
           //document.getElementById('twatts').style.opacity=0.5;
                } else {
                 tpower=Number(tpower)-10;
                 document.getElementById('twatts').innerHTML = (tpower).toFixed(0);
                 document.getElementById('twatts').style.backgroundColor=powerColor(tpower);
                if (smartTrainerConnected) {
                        trainerCommands.sendTargetPower(tpower);
                    }
                }
            } else {
        trainerDifficulty-=10;
        if (trainerDifficulty < 0) {trainerDifficulty=0;} // down arrow
         document.getElementById('trdiff').innerHTML = trainerDifficulty;
            }
    }
export function minusKey() {
    if (bUseVirtualWatts) {
            if (virtualPower > 10.0) {virtualPower=Number(virtualPower)-10.0;}
            } else {
        vgear--;
        if (vgear < -15) {vgear=-15;}
         document.getElementById('vgear').innerHTML = vgear;
            }
         let element = document.getElementById("virtualgear");
        element.value = vgear
    }
export function plusKey() {
     if (bUseVirtualWatts) {
             virtualPower=Number(virtualPower)+10.0;
            } else {
       vgear++;
        if (vgear > 15) {vgear=15}
         document.getElementById('vgear').innerHTML = vgear;
            }
         let element = document.getElementById("virtualgear");
    element.value = vgear
    }

function hideHud() {
  var x = document.getElementById("hud");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}
function hideWorkout() {
  var x = document.getElementById("barChart");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}
function hideMap() {
  var x = document.getElementById("map");
  if (x.style.display === "none") {
    x.style.display = "block";
    let i = 0;
    if (gpsIndex > 0) {
        i = gpsIndex-1;
    }
        
    //updateMarker(gpsArray[i].lat,gpsArray[i].lon);
  } else {
    x.style.display = "none";
  }
}
function hideElevationChart() {
  var x = document.getElementById("chartContainer");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}
function hideWorkoutCells() {
     document.getElementById("table1").rows[0].cells[4].style.display = "none";
            document.getElementById("table1").rows[1].cells[4].style.display = "none";
          document.getElementById("table1").rows[0].cells[5].style.display = "none";
            document.getElementById("table1").rows[1].cells[5].style.display = "none";
     document.getElementById("table1").rows[0].cells[6].style.display = "none";
            document.getElementById("table1").rows[1].cells[6].style.display = "none";
     const canvas = document.getElementById('barChart');
                        const ctx = canvas.getContext('2d');
                        //document.getElementById("barChart").style.display = "none";
                        ctx.canvas.hidden = true;
}
function showWorkoutCells() {
     document.getElementById("table1").rows[0].cells[4].style.display = "table-cell";
            document.getElementById("table1").rows[1].cells[4].style.display = "table-cell";
          document.getElementById("table1").rows[0].cells[5].style.display = "table-cell";
            document.getElementById("table1").rows[1].cells[5].style.display = "table-cell";
     document.getElementById("table1").rows[0].cells[6].style.display = "table-cell";
            document.getElementById("table1").rows[1].cells[6].style.display = "table-cell";
     const canvas = document.getElementById('barChart');
                        const ctx = canvas.getContext('2d');
                        //document.getElementById("barChart").style.display = "none";
                        ctx.canvas.hidden = true;
}
function toggleAutoShift() {
    if (!bUseAutoShift) {
         bUseAutoShift=true;
         bUseAutoShiftRPM=true;
         bUseAutoShiftGrade=false;
         document.getElementById('vgearl').innerHTML = "<b>VGear(AR)</b>";
        }
    else if (bUseAutoShiftRPM) { 
         bUseAutoShift=true;
         bUseAutoShiftRPM=false;
         bUseAutoShiftGrade=true;
         baseVgear=vgear; // Make base vgear the current vgear
         document.getElementById('vgearl').innerHTML = "<b>VGear(AG)</b>";
        }
    else if (bUseAutoShiftGrade) {
         bUseAutoShift=false;
         bUseAutoShiftRPM=false;
         bUseAutoShiftGrade=false;
         document.getElementById('vgearl').innerHTML = "<b>VGear</b>";
        }
     
   
}
function hideShowERG() {
  
     if (bWorkout ) {
         tpower=Number(zwoArray[workoutIndex].power)*powerFTP;
        }
      if (ERGMode) {
          ERGMode=false;
             document.getElementById('twattsl').innerHTML = "<b>Target</b>";
           document.getElementById('twatts').style.backgroundColor=powerColor(tpower);
          //document.getElementById('twatts').style.opacity=0.5;
          showVGear();
          if (!bWorkout) {
              hideWorkoutCells();
               if (smartTrainerConnected ) {
                 let grade=document.getElementById('grade').textContent;
                 trainerCommands.sendSimulation(((grade * 100.0) * (trainerDifficulty / 100.0))+vgear,
                                               windSpeed, coefficientRR, coefficientWR);
            }
              }
          
          } else {
          ERGMode=true;
            document.getElementById('twattsl').innerHTML = "<b>Target(E)</b>";
            
            
            if (smartTrainerConnected) {
            trainerCommands.sendTargetPower(tpower);
                // sendTargetPower(tpower);
                }
          document.getElementById('twatts').innerHTML = (tpower).toFixed(0);
           document.getElementById('twatts').style.backgroundColor=powerColor(tpower);
          //document.getElementById('twatts').style.opacity=0.5;
            hideVGear();
          if (!bWorkout) {
              showWorkoutCells();
              
              if (smartTrainerConnected ) {
               trainerCommands.sendTargetPower(tpower);
            }
              }
          
          }
      
    }
    
function hideVGear() {
      //hide vgear trdiff
            document.getElementById("table1").rows[0].cells[11].style.display = "none";
            document.getElementById("table1").rows[1].cells[11].style.display = "none";
           document.getElementById("table1").rows[0].cells[10].style.display = "none";
            document.getElementById("table1").rows[1].cells[10].style.display = "none";
     document.getElementById("virtualgear").style.display = "none";
     document.getElementById("vgearlbl").style.display = "none";
    }
function showVGear() {
    //show vgear trdiff
           document.getElementById("table1").rows[0].cells[11].style.display = "table-cell";
            document.getElementById("table1").rows[1].cells[11].style.display = "table-cell";
          document.getElementById("table1").rows[0].cells[10].style.display = "table-cell";
            document.getElementById("table1").rows[1].cells[10].style.display = "table-cell";
     document.getElementById("virtualgear").style.display = "block";
     document.getElementById("vgearlbl").style.display = "block";
    }

var snd2 = new Audio("data:audio/mpeg;base64,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wZ0G7jqlt/OcDIKX+/1NblSX+VKfQfP8xuJJGk7////rf////+PgXTv///1JThJJQainmySAB6imUyuVbVttUo7T4Csa821OuF88f62+CZHFnGf///mQgYIEO0SMF2NVy9NxYTdlqJ8AuS4zr//SJoTUJ+CaKKTcZvosrUPo8W/MUv0f033E9E/QpN6P///v/////WRR2mwUAYUABjabRu1vrOLKAF0kIdHjnEx/iNWo7jGn1////mApxNTJQQOU1Het/NoUFTMQs6Vja///THaGIl/0fojl8mjd/Jo8W+ZfpNpCajsz7////6kn/////WRRgDz//LD1KSTDjKOciSAKxdLx5S31uYqKIWj/+5JECgAC8V5M6g9rdFyr6Vo9rW6KtHcr5DEJQRkSpLRklSigvVc4QpmyPe9H3zHR1/in9P/8VNCMJOzYUDyVjfwHP0ZgiZt/3/+9EBnDKbegdUrckhgntHaQ9vX/X/9A/////+r/////mJ3/9ItRcoVRogAcmV9N8z0pvES8QQsKoMGXEymPQyWm6E4HQLqgpv/CZJAtYXQSwoF8e6SB56zABEoW+qgZjJAZovGr0Gl5/OjFKL3JwnaX9v7/X8y1f/////////49WAzMzEYYMZLq6CUANIqbDX7lisBIdraAEPwShTRc9WZ2vAqBc4NQ9GrUNaw0Czcrte0g1NEoiU8NFjx4NFh54FSwlOlgaCp0S3hqo8SLOh3/63f7P/KgKJxxhgGSnAFMCnIogwU5JoqBIDAuBIiNLETyFmiImtYiDTSlb8ziIFYSFv/QPC38zyxEOuPeVGHQ77r/1u/+kq49//6g4gjoVQSUMYQUSAP8PwRcZIyh2kCI2OwkZICZmaZxgnsNY8DmSCWX0idhtz3VTJSqErTSB//1X7TTTVVV//uSZB2P8xwRJ4HvYcItQlWBACM4AAABpAAAACAAADSAAAAEVf/+qCE000VVVVU0002//+qqqqummmmr///qqqppppoqqqqppppoqqATkEjIyIxBlBA5KwUEDBBwkFhYWFhUVFfiqhYWFhcVFRUVFv/Ff/xUVFRYWFpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg=="); 
function beep2() { 
  snd2.play();
}


//setInterval(beep2, 300);
let trainerControl = new TrainerControl();
let trainerCommands = new TrainerCommands(trainerControl);
const delay = ms => new Promise(res => setTimeout(res, ms));
//let sendSimInterval = 1;

var riderWeight ;
var riderAge;
var trainerDifficulty ;
let lastTrainerDifficulty=0;
var syncSeconds;
var pauseSpeed;
var maxHR;
var minHR;

let emailAddress="";
var windSpeed;
//export var coefficientRR=0.005 // rolling resistance
//export var coefficientWR=0.50;  // wind resistance
export var coefficientRR=0.005 // rolling resistance
export var coefficientWR=0.40;  // wind resistance

let activeRpm=50;
let currentRpm=0;
let maxrpm=90;
let minrpm=80;
let bUseAutoShift=false;
let bUseAutoShiftRPM=false;
let bUseAutoShiftGrade=false;
let bUseAveVelocity=false;
//let bUseSmoothGrade=false;
let ftms=false;
let lastGPSTime="";
let vgear=0;
let lastVgear=0;
export var bWorkout=false;
let workoutIndex=-1;
let workoutTime=0;
let totalRPM=0;
let totalRPMPts=0;
let ERGMode=false;
let bUseVirtualWatts=false;
let virtualPower=100.0;
let intervalWatts=0;
let intervalCount=0;
let totalWorkoutTime=0;
let markerFrequency=1; // update gpx map every 5 gps points
//export let bMetric=false;
export var bMetric=false;
export var videoSeconds2add=0;
export let initialDistance = 0; //miles
export var minimumIncline=-15.0;
export var maximumIncline=15.0;
export var effectiveGrade=0.0;
let lastEffectiveGrade=0.0;
let baseVgear=0.0;
let maximumHR=0;

/*

var sel = document.getElementById('connectDevice');
 
 
  sel.onchange = function(){
       
     let value=this.options[this.selectedIndex].value;
     
      switch(value) {
  case 'FTMS':  
        connectFTMS();
   break;

  case 'PWR':  
        connectPM();           
   break;
 case 'HRM':  
         connectHRM();           
   break;

  case 'RPM':  
              connectRPM();           
   break;
    case 'RUN':  
              connectRSC();           
   break;
        case 'Virtual':  
              virtualWatts();           
   break;
  
    }
  };
*/

//*********************************************************************
const SERVICES = [0x1826,0x180D,0x1816,0x1818];
const devices = new Map();
let ftmsControlChar = null;

//function log(m){logDiv.textContent+=m+"\n";logDiv.scrollTop=logDiv.scrollHeight;}
//const logDiv=document.getElementById("log");

async function connectDevice(){
      if (gpxArray === undefined || gpxArray.length == 0)  {
                alert("First Select a Ride or GPX file")
                return
            }
    /*
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices:true,
    optionalServices:SERVICES
  });
  */
     // services: ['heart_rate','cycling_power','cycling_power']
 const device = await navigator.bluetooth.requestDevice({
     /*
        filters: [{
            services: ['cycling_power','heart_rate']
        
        }],
        */
     filters: [
    {services: ['cycling_power']},
          {services: ['fitness_machine']},
            {services: ['heart_rate']},
            {services: ['cycling_speed_and_cadence']},
            {services: ['running_speed_and_cadence']}
   
  ],
        acceptAllDevices: false,
      optionalServices:SERVICES
    })
  devices.set(device.id,device);
  device.addEventListener("gattserverdisconnected",()=>autoReconnect(device));
  await connectGATT(device);
}

async function connectGATT(device){
  console.log("Connecting: "+device.name);
  const server = await device.gatt.connect();
  const services = await server.getPrimaryServices();

  for(const s of services){
    //if(s.uuid.includes("1826")) await handleFTMS(s);
    if(s.uuid.includes("1826")) {
        trainerControl.connectDevice(device);
         console.log("Device name " + trainerControl.device.name);
        trainerConnected = true
    	smartTrainerConnected = true
        bUseVirtualWatts=false;
        }
    if(s.uuid.includes("180d")) {
        await handleHR(s);
        }
    if(s.uuid.includes("1816")) {
         trainerConnected = true
        bUseVirtualWatts=false;
        //hideVGear();
        await handleCSC(s);
    }
    if(s.uuid.includes("1818")) {
         trainerConnected = true
        bUseVirtualWatts=false;
        //hideVGear();
        await handlePM(s);
        }
    if(s.uuid.includes("181a")) {
         trainerConnected = true
        bUseVirtualWatts=false;
        runPod = true;
        await handleRSC(s);
        }
    //if(s.uuid.includes('running_speed_and_cadence')) await handleRSC(s
      /*
       if(s.uuid.includes("1826")) await handleFTMS(s);
    if(s.uuid.includes("180d")) await handleHR(s);
    if(s.uuid.includes("1816")) await handleCSC(s);*/
  }
}

async function autoReconnect(device){
   alert ("Disconnected: "+device.name+" reconnecting...");
  consol.log("Disconnected: "+device.name+" reconnecting...");
  setTimeout(()=>connectGATT(device).catch(e=>log("Reconnect failed")),2000);
}

/* ---------------- HR ---------------- */
async function handleHR(service){
  const c=await service.getCharacteristic('heart_rate_measurement');
  await c.startNotifications();
    
     //document.getElementById('hrml').style.backgroundColor = 'green';
    //document.getElementById('hrml').style.opacity=0.5;
  c.addEventListener("characteristicvaluechanged",printHeartRate);
  
}

/* ---------------- HR ---------------- */
/*
async function handleFTMS(service){
   const dataChar=await service.getCharacteristic(0x2AD2);
  ftmsControlChar=await service.getCharacteristic(0x2AD9);
  document.getElementById('twattsl').style.backgroundColor=rgba(255,0,0, 0.5);
  await dataChar.startNotifications();
  dataChar.addEventListener("characteristicvaluechanged",printHeartRate);
  
}
*/
/* ---------------- handleCSC ---------------- */
async function handleCSC(service){
  const c=await service.getCharacteristic('csc_measurement');
  await c.startNotifications();
   
   //  document.getElementById('rpml').style.backgroundColor = 'green';
  //  document.getElementById('rpml').style.opacity=0.5;
  c.addEventListener("characteristicvaluechanged",printCSC);
  
}
/* ---------------- handleRSC ---------------- */
async function handleRSC(service){
  const c=await service.getCharacteristic('rsc_measurement');
  await c.startNotifications();
  c.addEventListener("characteristicvaluechanged",printRSC);
  
}

/* ---------------- handlePM ---------------- */
async function handlePM(service){
  const c=await service.getCharacteristic('cycling_power_measurement');
  await c.startNotifications();
  
    // document.getElementById('wattsl').style.backgroundColor = 'green';
   // document.getElementById('wattsl').style.opacity=0.5;
  c.addEventListener("characteristicvaluechanged",printPM);
  
}
/*
 function parseCSC(event) {
   
      
        const bits1 = event.target.value.getUint8(0,true)
        
        let hasWheelData = (bits1 & 0x01) > 0;
        let hasCrankData = (bits1 & 0x02) > 0;
        if (hasWheelData) {printCSC(event);}
       if (hasCrankData) {printRSC(event);}
     }
*/
// const service = await server.getPrimaryService('heart_rate')
//    const char = await service.getCharacteristic('heart_rate_measurement')
//      const service = await server.getPrimaryService('cycling_speed_and_cadence')
//    const char = await service.getCharacteristic('csc_measurement')
//      const service = await server.getPrimaryService('running_speed_and_cadence')
//    const char = await service.getCharacteristic('rsc_measurement')
//     const charact = await ftmsService.getCharacteristic('fitness_machine_feature')
//    const data = await charact.readValue() // Returns a DataView object
 //const service = await server.getPrimaryService('cycling_power')
//const char = await service.getCharacteristic('cycling_power_measurement')

//*********************************************************************

function myFunction() {
    var checkBox = document.getElementById("myCheck");
    var text = document.getElementById("text");
    if (checkBox.checked) {
        text.style.display = "block";
    } else {
        text.style.display = "none";
    }
}

var menu = document.getElementById("virtualgear");
menu.addEventListener("change", generateData);

function generateData(event) {
     let value=menu.value;
    //alert(value);
   
      vgear=Number(value);
   
    /*
     if (vgear < -15) {vgear=-15;}
     if (vgear > 15) {vgear=15;}
     */
   
         document.getElementById('vgear').innerHTML = vgear;
  
}

export async function sWorkout(value) {
     //await parseZWO(value);
    bWorkout=true;
    workoutIndex=0;
    totalWorkoutTime=0;
    console.log("workout index "+workoutIndex);
        document.getElementById("table1").rows[0].cells[4].style.display = "table-cell";
            document.getElementById("table1").rows[1].cells[4].style.display = "table-cell";
          document.getElementById("table1").rows[0].cells[5].style.display = "table-cell";
            document.getElementById("table1").rows[1].cells[5].style.display = "table-cell";
    document.getElementById("table1").rows[0].cells[6].style.display = "table-cell";
            document.getElementById("table1").rows[1].cells[6].style.display = "table-cell";
     if (bWorkout) {
            hideShowERG();
            console.log("zwoArray len "+zwoArray.length);
         //document.getElementById('timeleft').innerHTML = zwoArray[0].duration;
              document.getElementById('tleftl').innerHTML="<b>Time Left("+(0)+")</b>";
        workoutTime=Number(zwoArray[0].duration*1000);
            setTimeLeft();
             let tpower=Number(zwoArray[0].power)*powerFTP;
        document.getElementById('twatts').innerHTML = (tpower).toFixed(0);
             document.getElementById('twatts').style.backgroundColor=powerColor(tpower);
         //document.getElementById('twatts').style.opacity=0.5;
 	
            console.log("Workout time "+workoutTime+" twatts "+document.getElementById('twatts').textContent);
            }
   // workoutIndex=-1;
         
}

/* no default
if (!emailAddress) {
     console.log("Default email");
    emailAddress="";
      localStorage.setItem('.emailAddress', emailAddress);
}
*/
/*
let maxHR=170;
let minHR=50;
export let powerFTP=180;
    */
//console.clear();


 let bUseMetric = localStorage.getItem('checkboxState')
 console.log("Use Metric " +bUseMetric);
 let bUseSmoothGrade = localStorage.getItem('checkboxSmoothGrade')
 console.log("Use Smooth Grade " +bUseSmoothGrade);

if (bUseMetric === "false") {
    console.log("bUseMetric1=false"); //correct
    bMetric=false;
    }
if (bUseMetric === "true") {
    console.log("bUseMetric2=true");
    bMetric=true;
    }

 if (bMetric) {
             document.getElementById('speedl').innerHTML =  "<b>KPH</b>";
                 document.getElementById('avespeedl').innerHTML =  "<b>Ave KPH</b>";
                 document.getElementById('distancel').innerHTML =  "<b>Kilometers</b>";
        }

riderAge =  Number(localStorage.getItem(".age"));
riderWeight =  Number(localStorage.getItem(".weight"));
trainerDifficulty = Number(localStorage.getItem(".trainerDifficulty"));
syncSeconds =  Number(localStorage.getItem(".syncSeconds"));
pauseSpeed =  Number(localStorage.getItem(".pauseSpeed"));
maxHR =  Number(localStorage.getItem(".maxHR"));
minHR =  Number(localStorage.getItem(".minHR"));
powerFTP = Number(localStorage.getItem(".powerFTP"));
emailAddress = localStorage.getItem(".emailAddress");
windSpeed =  Number(localStorage.getItem(".windSpeed"));
//coefficientRR =  Number(localStorage.getItem(".coefficientRR"));
//coefficientWR =  Number(localStorage.getItem(".coefficientWR"));
minrpm =  Number(localStorage.getItem(".minRPM"));
maxrpm =  Number(localStorage.getItem(".maxRPM"));
minimumIncline =  Number(localStorage.getItem(".minGrade"));
maximumIncline =  Number(localStorage.getItem(".maxGrade"));

if (!riderAge) {
    console.log("Default age");
    riderAge = 25.0;
    localStorage.setItem('.age', riderAge);
}
if (!trainerDifficulty) {
     console.log("Default trainer difficulty");
    trainerDifficulty = 50.0;
     localStorage.setItem('.trainerDifficulty', trainerDifficulty);
}
if (!riderWeight) {
     console.log("Default weight");
    riderWeight = 150.0;
    
    
    localStorage.setItem('.weight', riderWeight);
}
if (!syncSeconds) {
     console.log("Default sync Seconds");
    syncSeconds = 5;
    localStorage.setItem('.syncSeconds', syncSeconds);
}
if (!pauseSpeed) {
     console.log("Default pause speed");
    pauseSpeed = 1.0;
      localStorage.setItem('.pauseSpeed', pauseSpeed);
}
if (!powerFTP) {
     console.log("Default ftp");
    powerFTP = 200.0;
      localStorage.setItem('.powerFTP', powerFTP);
}
if (!maxHR) {
     console.log("Default max hr");
    maxHR = 200.0;
      localStorage.setItem('.maxHR', maxHR);
}
if (!minHR) {
     console.log("Default min hr");
    minHR = 60.0;
      localStorage.setItem('.minHR', minHR);
}
if (!windSpeed) {
     console.log("Default windSpeed");
    windSpeed=0;
      localStorage.setItem('.windSpeed', windSpeed);
}
/*
if (!coefficientRR) {
     console.log("Default coefficientRR");
    coefficientRR=.006;
      localStorage.setItem('.coefficientRR', coefficientRR);
}
if (!coefficientWR) {
     console.log("Default coefficientWR");
    coefficientWR=.50;
      localStorage.setItem('.coefficientWR', coefficientWR);
}
 
 */
if (!minrpm) {
     console.log("Default minrpm");
    minrpm=80;
      localStorage.setItem('.minRPM', minrpm);
}
if (!maxrpm) {
     console.log("Default maxrpm");
    maxrpm=90;
      localStorage.setItem('.maxRPM', maxrpm);
}
if (!minimumIncline) {
     console.log("Default minimumIncline");
    minimumIncline=-10;
      localStorage.setItem('.minGrade', minimumIncline);
}
if (!maximumIncline) {
     console.log("Default maximumIncline");
    maximumIncline=10;
      localStorage.setItem('.maxGrade', maximumIncline);
}
document.getElementById('trdiff').innerHTML = trainerDifficulty;
document.getElementById('vgear').innerHTML = vgear;

console.log("age " + riderAge);
console.log("weight " + riderWeight);
console.log("trainer difficulty " + trainerDifficulty);
console.log("syncSeconds " + syncSeconds);
console.log("pauseSpeed " + pauseSpeed);
console.log("maxHR " + maxHR);
console.log("minHR " + minHR);
console.log("powerFTP " + powerFTP);
console.log("emailAddress " + emailAddress);
console.log("windSpeed " + windSpeed);
console.log("coefficientRR " + coefficientRR);
console.log("coefficientWR " + coefficientWR);
console.log("AutoShift maxRPM " + maxrpm);
console.log("AutoShift minRPM " + minrpm);


    let grade = 0.0
    let elevation = 0.0
let lbs2kg = 2.204623;
let mps2mph = 2.236936;
let mps2kph = 3.6;
let miles2meters = 1609.344;
let totalHR = 0
let totalHRPts = 0
let totalPMWatts = 0
let totalPMWattsPts = 0
let totalSpeed = 0
let totalSpeedPts = 0
let totalMphPts = 0
let totalMph = 0
let totalVelocityPts = 0
let totalVelocity = 0
let totalDistance = 0
let lastRouteDistance = 0;
let lastRouteSeconds = 0;
let totalMSeconds = 0;
var cpCharacteristic;
var ftmsService;
var ftmsDevice;
var ftmsServer;
export let trainerConnected = false;
export var smartTrainerConnected = false;
var cadenceConnected=false;
//let trainerConnected = false
//let smartTrainerConnected = false
export var runPod = false;
var success = false;
var videoStarted = false;
let gpsIndex=0;
let gradeIndex = 0;
let lastGradeIndex = 0;
let mph = 0;
//let nGradients=5;
//var lastgradients = Array(0,0,0,0,0);
var lasti;
//var smoothGradient;
//var gpsTimeArray;
export var gpsArray;
//export let gpsIndex=0;
var heartRate = 0;
let beginTime = Date.now();
export let appStart = false;
export let appStarted = false;
let appPaused=0;
export let totalSeconds = 0;
let lapCounter = 0;
let normalizedPower = new NormalizedPower(powerFTP);

window.connectFTMS = connectFTMS;
window.connectHRM = connectHRM;
window.connectRPM = connectRPM;
window.connectRSC = connectRSC;
window.connectPM = connectPM;
window.startTimer = startTimer;
//window.requestControl = requestControl;
//window.sendSimulation = sendSimulation;
window.saveGPS = saveGPS;
window.saveData = saveData;
window.initStartLoc = initStartLoc;
window.connectDevice = connectDevice;

window.virtualWatts = virtualWatts;

/*
Make sure you are wearing the hr monitor, as it typically
goes to sleep when inactive, not allowing you to connect to it.
Instructions
=============
1. Using Google Chrome, open the dev console and paste the below code.
2. A panel near the address bar will open, searching for nearby bluetooth (ble)
   heart rate devices. Don't click away from the panel or Chrome will cancel the search.
3. When found, click connect on your device.
4. An event listener will be added to start capturing the hr data.
   You can refresh the browser if you need to disconnect or cancel the streaming data.
The event's value will be a DataView. Use the getInt8 method, which
gets a signed 8-bit integer (byte) at the specified byte offset.
To extract the heart rate value, pass 1 as the byte offset:
  let dataView = event.target.value
  let heartRate = dataView.getInt8(1)
DataView documentation
developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getInt8
*/
let ble_sint16 = ['getInt16', 2, true];
let ble_uint8 = ['getUint8', 1];
let ble_uint16 = ['getUint16', 2, true];
let ble_uint32 = ['getUint32', 4, true];
// TODO: paired 12bit uint handling
let ble_uint24 = ['getUint8', 3];
let lastCrankRevolutions = 0;
let lastCrankTime = 0;
let lastWheelRevolutions = 0;
let lastWheelTime = 0;

// https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.cycling_power_measurement.xml
let cycling_power_measurement = [
    [0, [
        [ble_sint16, 'instantaneous_power']
    ]],
    [1, [
        [ble_uint8, 'pedal_power_balance']
    ]],
    [2, [ /* Pedal Power Balance Reference */ ]],
    [4, [
        [ble_uint16, 'accumulated_torque']
    ]],
    [8, [ /* Accumulated Torque Source */ ]],
    [16, [
        [ble_uint32, 'cumulative_wheel_revolutions'],
        [ble_uint16, 'last_wheel_event_time']
    ]],
    [32, [
        [ble_uint16, 'cumulative_crank_revolutions'],
        [ble_uint16, 'last_crank_event_time']
    ]],
    [64, [
        [ble_sint16, 'maximum_force_magnitude'],
        [ble_sint16, 'minimum_force_magnitude']
    ]],
    [128, [
        [ble_sint16, 'maximum_torque_magnitude'],
        [ble_sint16, 'minimum_torque_magnitude']
    ]],
    [256, [
        [ble_uint24, 'maximum_minimum_angle']
    ]],
    [512, [
        [ble_uint16, 'top_dead_spot_angle']
    ]],
    [1024, [
        [ble_uint16, 'bottom_dead_spot_angle']
    ]],
    [2048, [
        [ble_uint16, 'accumulated_energy']
    ]],
    [4096, [ /* Offset Compensation Indicator */ ]]
];

// https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.csc_measurement.xml
let csc_measurement = [
    [1, [
        [ble_uint32, 'cumulative_wheel_revolutions'],
        [ble_uint16, 'last_wheel_event_time']
    ]],
    [2, [
        [ble_uint16, 'cumulative_crank_revolutions'],
        [ble_uint16, 'last_crank_event_time']
    ]]
];

export function setWindResistance(wr) {
   
 coefficientWR=wr  // wind resistance
    }

export function setRollingResistance(rr) {
   
 coefficientRR=rr  //rolling resistance
    }

function virtualWatts() {
    var checkBox = document.getElementById("vwCheck");
    
    if (bUseVirtualWatts) {
        bUseVirtualWatts=false;
         trainerConnected = false;
        } else {
         bUseVirtualWatts=true;
         trainerConnected = true;
        }
    }
async function connectFTMS() {

    await trainerControl.connect();
    await trainerCommands.requestControl();

    console.log("Device name " + trainerControl.device.name);
    trainerConnected = true
    	smartTrainerConnected = true
     bUseVirtualWatts=false;
}







function onConnected(event) {
    const device = event.target;
    console.log(`Device ${device.name} is Connected.`);
}


async function getFeatures() {
    if (!trainerConnected) {
        alert("Connect a trainer, power meter or click VP (Virtual Power)")
        return
    }


    //const server = await ftmsDevice.gatt.connect()
    //const service = await server.getPrimaryService('fitness_machine')
    const charact = await ftmsService.getCharacteristic('fitness_machine_feature')
    const data = await charact.readValue() // Returns a DataView object
    console.log("Feature bytes " + data.byteLength)

    for (let j = 0; j < data.byteLength; j++) {
        const bits = data.getUint8(j, true)
        console.log("byte " + j + " = " + bits + " " + dec2bin(bits))
    }

    const flags = data.getUint16(0, true)
    const avgSpeedPresent = ((flags >> 1) & 1) > 0
    const cadencePresent = ((flags >> 2) & 1) > 0
    const totalDistancePresent = ((flags >> 3) & 1) > 0
    const inclinationPresent = ((flags >> 4) & 1) > 0
    const elevationPresent = ((flags >> 5) & 1) > 0
    const pacePresent = ((flags >> 6) & 1) > 0
    const stepCountPresent = ((flags >> 7) & 1) > 0
    const resistanceLevelPresent = ((flags >> 8) & 1) > 0

    /*
      if ((cscdata.feature_flags[0] & (byte) 1) > 0) {
                        log(2,TAG, "byte 0  Average Speed ");
                    }
                    if ((cscdata.feature_flags[0] & (byte) 2) > 0) {
                        log(2,TAG, "byte 0   Cadence");
                    }
                    if ((cscdata.feature_flags[0] & (byte) 4) > 0) {
                        log(2,TAG, "byte 0   Total Distance");
                    }
                    if ((cscdata.feature_flags[0] & (byte) 8) > 0) {
                        log(2,TAG, "byte 0  Inclination");
                    }
                    if ((cscdata.feature_flags[0] & (byte) 16) > 0) {
                        log(2,TAG, "byte 0  Elevation");
                    }
                    if ((cscdata.feature_flags[0] & (byte) 32) > 0) {
                        log(2,TAG, "byte 0   Pace");
                    }
                    if ((cscdata.feature_flags[0] & (byte) 64) > 0) {
                        log(2,TAG, "byte 0  Step count");
                    }
                    if ((cscdata.feature_flags[0] & ((byte) 128 & 0xFF) ) > 0) {
                        log(2,TAG, "byte 0  Resitance Level");
                    }
                    if (cscdata.feature_flags[0] << ~7 < 0) {  // bit 7
                        bResistanceLevel=true;
                        log(2,TAG, "byte 0  resistance Level");
                    }

                    if ((cscdata.feature_flags[1] & (byte) 1) > 0) {
                        log(2,TAG, "byte 1  Stride count ");
                    }
                    if ((cscdata.feature_flags[1] & (byte) 2) > 0) {
                        log(2,TAG, "byte 1   Expended Energy");
                    }
                    if ((cscdata.feature_flags[1] & (byte) 4) > 0) {
                        log(2,TAG, "byte 1   HR ");
                    }
                    if ((cscdata.feature_flags[1] & (byte) 8) > 0) {
                        log(2,TAG, "byte 1  MET");
                    }
                    if ((cscdata.feature_flags[1] & (byte) 16) > 0) {
                        log(2,TAG, "byte 1  Elapsed Time");
                    }
                    if ((cscdata.feature_flags[1] & (byte) 32) > 0) {
                        log(2,TAG, "byte 1   Remaining Time");
                    }
                    if ((cscdata.feature_flags[1] & (byte) 64) > 0) {
                        log(2,TAG, "byte 1  Power ");
                    }
                    if ((cscdata.feature_flags[1] & ((byte) 128 & 0xFF) ) > 0) {
                        log(2,TAG, "byte 4  Force");
                    }
                    if (cscdata.feature_flags[1] << ~7 < 0) {  // bit 7
                        log(2,TAG, "byte 1  Force");
                    }

                    if ((cscdata.feature_flags[4] & (byte) 1) > 0) {
                        log(2,TAG, "byte 4   speed target");
                    }
                    if ((cscdata.feature_flags[4] & (byte) 2) > 0) {
                        log(2,TAG, "byte 4   inclination target");
                    }
                    if ((cscdata.feature_flags[4] & (byte) 4) > 0) {
                        log(2,TAG, "byte 4   resistance target");
                    }
                    if ((cscdata.feature_flags[4] & (byte) 8) > 0) {
                        log(2,TAG, "byte 4  power target");
                    }
                    if ((cscdata.feature_flags[4] & (byte) 16) > 0) {
                        log(2,TAG, "byte 4   HR target");
                    }
                    if ((cscdata.feature_flags[4] & (byte) 32) > 0) {
                        log(2,TAG, "byte 4   energytarget");
                    }
                    if ((cscdata.feature_flags[4] & (byte) 64) > 0) {
                        log(2,TAG, "byte 4  step target");
                    }


                    if ((cscdata.feature_flags[4] & ((byte) 128 & 0xFF) ) > 0) {
                        log(2, TAG, "byte 4  stride target");
                    }
                    if (cscdata.feature_flags[4] << ~7 < 0) {  // bit 7
                        log(2,TAG, "byte 4  stride target");
                    }

                    if ((cscdata.feature_flags[5] & (byte) 1) > 0) {
                        log(2,TAG, "byte 5   distance target");
                    }
                    if ((cscdata.feature_flags[5] & (byte) 2) > 0) {
                        log(2,TAG, "byte 5  training time target");
                    }
                    if ((cscdata.feature_flags[5] & (byte) 4) > 0) {
                        log(2,TAG, "byte 5  Targeted Time in Two Heart Rate Zones ");
                    }
                    if ((cscdata.feature_flags[5] & (byte) 8) > 0) {
                        log(2,TAG, "byte 5 Targeted Time in Three Heart Rate Zones ");
                    }
                    if ((cscdata.feature_flags[5] & (byte) 16) > 0) {
                        log(2,TAG, "byte 5   Targeted Time in Five Heart Rate Zones");
                    }
                    if ((cscdata.feature_flags[5] & (byte) 32) > 0) {
                        log(2,TAG, "byte 5  simulation parameters");
                    }
                    if ((cscdata.feature_flags[5] & (byte) 64) > 0) {
                        log(2,TAG, "byte 5 wheel circumference");
                    }
                    if ((cscdata.feature_flags[5] & ((byte) 128 & 0xFF) ) > 0) {
                        log(2,TAG, "byte 5 spin down ctl");
                    }
                    if (cscdata.feature_flags[5] << ~5 < 0) {
                        log(2,TAG, "byte 5  simulation parameters");
                        bSimulationFeature = true;
                        bUseFtmsSim=true;


                        requestTrainerControl(gatt);
                        initializeSimulationParameters(gatt);
                    }
                    if (cscdata.feature_flags[5] << ~6 < 0) {
                        log(2,TAG,"byte 5 wheel circumference");
                        requestTrainerControl(gatt);
                        setWheelSize(gatt, cscdata.wheelSize);
                        bWheelSizeFeature = true;
                    }
                    if (cscdata.feature_flags[5] << ~7 < 0) {  // bit 7
                        log(2,TAG, "byte 5 spin down ctl");
                        bSpinDownFeature = true;
                    }
            */       

}





async function connectHRM1(props) {
    const device = await navigator.bluetooth.requestDevice({
        filters: [{
            services: ['heart_rate']
        }],
        acceptAllDevices: false,
    })
    device .addEventListener('gattserverdisconnected', HRMonDisconnected);
  
    console.log(`%c\n👩🏼‍⚕️`, 'font-size: 82px;', 'Starting ...\n\n')
    const server = await device.gatt.connect()
    const service = await server.getPrimaryService('heart_rate')
    const char = await service.getCharacteristic('heart_rate_measurement')
    // const service = await server.getPrimaryService('fitness_machine')
    //const char = await service.getCharacteristic('indoor_bike_data')
    char.oncharacteristicvaluechanged = props.onChange
    char.startNotifications()
    return char
}
 async function HRMonDisconnected() {
     const device = event.target;
    console.log(`Device ${device.name} is Connected.`);
        console.log('>HRM Bluetooth Device disconnected');
         alert('> HRM Bluetooth Device disconnected');
     }
 
async function connectRPM1(props) {
    const device = await navigator.bluetooth.requestDevice({
        filters: [{
            services: ['cycling_speed_and_cadence']
        }],
        acceptAllDevices: false,
    })
    /*
    document.getElementById("table1").rows[0].cells[7].style.display = "table-cell";
    document.getElementById("table1").rows[1].cells[7].style.display = "table-cell";
    document.getElementById("table1").rows[0].cells[14].style.display = "table-cell";
    document.getElementById("table1").rows[1].cells[14].style.display = "table-cell";
    */
    device .addEventListener('gattserverdisconnected', RPMonDisconnected);
    console.log(`%c\n👩🏼‍⚕️`, 'font-size: 82px;', 'Starting ...\n\n')
    const server = await device.gatt.connect()
    const service = await server.getPrimaryService('cycling_speed_and_cadence')
    const char = await service.getCharacteristic('csc_measurement')
    // const service = await server.getPrimaryService('fitness_machine')
    //const char = await service.getCharacteristic('indoor_bike_data')
    char.oncharacteristicvaluechanged = props.onChange
    char.startNotifications()
    return char
}
 async function  RPMonDisconnected() {
      const device = event.target;
    console.log(`Device ${device.name} is disonnected.`);
        console.log('>RPM Bluetooth Device disconnected');
         alert('> RPM Bluetooth Device disconnected');
     }

async function connectRSC1(props) {
    const device = await navigator.bluetooth.requestDevice({
        filters: [{
            services: ['running_speed_and_cadence']
        }],
        acceptAllDevices: false,
    })
     device .addEventListener('gattserverdisconnected', RSConDisconnected);
    console.log(`%c\n👩🏼‍⚕️`, 'font-size: 82px;', 'Starting ...\n\n')
    const server = await device.gatt.connect()
    const service = await server.getPrimaryService('running_speed_and_cadence')
    const char = await service.getCharacteristic('rsc_measurement')
    // const service = await server.getPrimaryService('fitness_machine')
    //const char = await service.getCharacteristic('indoor_bike_data')
    char.oncharacteristicvaluechanged = props.onChange
    char.startNotifications()
    trainerConnected = true
     bUseVirtualWatts=false;
    runPod = true;

    return char
}
 async  function RSConDisconnected() {
        console.log('>RSC Bluetooth Device disconnected');
         alert('> RSC Bluetooth Device disconnected');
     }
async function connectPM1(props) {
    const device = await navigator.bluetooth.requestDevice({
        filters: [{
            services: ['cycling_power']
        }],
        acceptAllDevices: false,
    })
     device .addEventListener('gattserverdisconnected', PMonDisconnected);
     
    console.log(`%c\n👩🏼‍⚕️`, 'font-size: 82px;', 'Starting ...\n\n')
    const server = await device.gatt.connect()
    //const service = await server.getPrimaryService('heart_rate')
    //const char = await service.getCharacteristic('heart_rate_measurement')
    const service = await server.getPrimaryService('cycling_power')
    const char = await service.getCharacteristic('cycling_power_measurement')
    char.oncharacteristicvaluechanged = props.onChange
    char.startNotifications()
    trainerConnected = true
     bUseVirtualWatts=false;
    hideVGear();
    return char
}
 async function  PMonDisconnected() {
        console.log('>PM Bluetooth Device disconnected');
         alert('> PM Bluetooth Device disconnected');
     }


// Basic example that prints a live updating chart of the heart rate history.
// Note: This should only be used as a quick/hacky test, it's not optimized.

//let hrData = new Array(200).fill(10)

//console.clear()
//setupConsoleGraphExample(100, 400)
//connect({ onChange: printHeartRate }).catch(console.error)


export

function connectHRM() {
    connectHRM1({
        onChange: printHeartRate
    }).catch(console.error)
}
export

function connectRPM() {
    connectRPM1({
        onChange: printCSC
    }).catch(console.error)
}
export

function connectPM() {
    connectPM1({
        onChange: printPM
    }).catch(console.error)
}

function printPM(event) {
    const power = event.target.value.getInt16(1);
    processPower(power);

}
export

function connectRSC() {
    connectRSC1({
        onChange: printRSC
    }).catch(console.error)
}

function printHeartRate(event) {

    heartRate = event.target.value.getUint8(1, true)
    if (heartRate > maximumHR) {maximumHR = heartRate;}
    document.getElementById('hr').innerHTML = heartRate
     hrColor(heartRate);
    if (appStart) {
        totalHR += heartRate
        totalHRPts++
        let ahr = (totalHR / totalHRPts)

        document.getElementById('avehr').innerHTML = ahr.toFixed(0)
        let weight = riderWeight / lbs2kg;
        if (bMetric) {
            weight = riderWeight;
        }
        let cal = (-55.0969 + (0.6309 * ahr) + (0.1988 * weight) + (0.2017 * riderAge)) / 4.184
        cal = cal * (totalSeconds / 60.0)
        document.getElementById('hrcal').innerHTML = cal.toFixed(0)
        
       
        
       
        
       
    }

}
function hrColor(heartRate) {
    if (heartRate >= (maxHR*.90)) {
             document.getElementById('hr').style.backgroundColor = 'red';
            //document.getElementById('hr').style.opacity=0.5;
            } else
        if (heartRate >= (maxHR*.80)) {
             document.getElementById('hr').style.backgroundColor = 'orange';
            // document.getElementById('hr').style.opacity=0.5;
            } else
         if (heartRate >= (maxHR*.70)) {
             document.getElementById('hr').style.backgroundColor = 'yellow';
             // document.getElementById('hr').style.opacity=0.5;
            } else
        if (heartRate >= (maxHR*.60)) {
             document.getElementById('hr').style.backgroundColor = 'green';
          //   document.getElementById('hr').style.opacity=0.5;
            } else 
            if (heartRate >= (maxHR*.50)) {
             document.getElementById('hr').style.backgroundColor = 'blue';
            //     document.getElementById('hr').style.opacity=0.5;
            } else {
             document.getElementById('hr').style.backgroundColor = 'white';
            //     document.getElementById('hr').style.opacity=0.5;
            }
}
export function initializeRoute(){
    /*
      let p1 = new GPXPoint(100.0, 0, 0, 0, 0, 0, 0, 0, 0, "", 0, 0);
        console.log("new route");         
    gpsArray[gpsIndex++] = p1;
    */
    if (gpsIndex > 0) {
        saveGPS();
        }
    lastRouteDistance=totalDistance;
    lastRouteSeconds=totalSeconds;
      grade = 0.0
    elevation = 0.0
    
    mph = 0;
    totalDistance=0;
    gpsArray=undefined;
    gpsIndex=0;
    beginTime = Date.now();

    }
export async function processRPM(rpm) {
    currentRpm=rpm;
    document.getElementById('rpm').innerHTML = rpm.toFixed(0);
            if (appStart) {
                totalRPM+= rpm;
                totalRPMPts++;
                
                let averpm = (totalRPM/totalRPMPts)
                document.getElementById('averpm').innerHTML = averpm.toFixed(0) 
                //console.log("ave rpm "+arpm + " " + appStart);
            }
    }
export async function processPower(power) {


    let distancem = 0
    let nextGrade = 0.0;
    //let workoutIndex=0;
    // gpsTimeArray = Array(gpxArray.length);
    if (gpsArray === undefined) {
        console.log("gpsArray undefined");
        //gpsIndex=0;
        gpsArray = Array(gpxArray.length*10); // for upto 10 laps
      
        initStartLoc();
        /*
     if (apikey !== undefined && apikey != null) {
        sendData( "", 
                  0,
                 0, 0 , 0, 0,0,0,0,0,0,0,0,0);
       }
       */
        /*
        if (bWorkout) {
            hideShowERG();
            console.log("zwoArray len "+zwoArray.length);
         //document.getElementById('timeleft').innerHTML = zwoArray[workoutIndex].duration;
              document.getElementById('tleftl').innerHTML="<b>Time Left("+(workoutIndex)+")</b>";
        workoutTime=Number(zwoArray[0].duration*1000);
            setTimeLeft();
             let tpower=Number(zwoArray[workoutIndex].power)*powerFTP;
        document.getElementById('twatts').innerHTML = (tpower).toFixed(0);
             document.getElementById('twatts').style.backgroundColor=powerColor(tpower);
            console.log("Workout time "+workoutTime+" twatts "+document.getElementById('twatts').textContent);
            }
            */
    }
   


    document.getElementById('watts').innerHTML = power;
     document.getElementById('watts').style.backgroundColor=powerColor(power);
     //document.getElementById('twatts').style.opacity=0.5;
    document.getElementById('vgear').innerHTML = vgear;
    // console.log(power);
   
    if (appStart) {
        normalizedPower.addPower(power);
        totalPMWatts += power;
        totalPMWattsPts++;
        let aWatts = (totalPMWatts / totalPMWattsPts);
        document.getElementById('avewatts').innerHTML = aWatts.toFixed(0);
        let pcalories = ((aWatts * totalSeconds) / 4.18) / 0.24 / 1000.0;
        document.getElementById('pcal').innerHTML = pcalories.toFixed(0)
      
     videoSeconds2add = Number(document.getElementById('secs2add').value)
    //console.log("seconds2add " + seconds2add);
     
        let distancem = 0;
        if (bMetric) {
              distancem = (totalDistance+initialDistance-lastRouteDistance) * 1000;  // km2meters
        } else {
             distancem = (totalDistance+initialDistance-lastRouteDistance)  * miles2meters ; 
        }
       
            gradeIndex = findGPX(distancem);
           console.log("distancem " + distancem + " index " + gradeIndex);
          
            updateProgress(distancem ,gpxArray[gpxArray.length - 1].distance);
         
            if (gradeIndex < gpxArray.length - 1 && gradeIndex >= 0) {
               if (bUseSmoothGrade) {
                grade = gpxArray[gradeIndex + 1].smoothGrade;
                   } else {
                    grade = gpxArray[gradeIndex + 1].grade;
                   }
               
                    
                if (gradeIndex < gpxArray.length - 2 && gradeIndex >= 0) {
                     if (bUseSmoothGrade) {
                        nextGrade = gpxArray[gradeIndex + 2].smoothGrade;
                   } else {
                        grade = gpxArray[gradeIndex + 2].grade;
                   }
                   
                }
                 // sanity check for grade
                if (grade > 30) {
                    grade = 30;
                    }
                else if (grade < -30) {
                    grade = -30;
                    }
                //if (gradeIndex < gpxArray.length - 3 && gradeIndex >= 0) {
                //    nextGrade = gpxArray[gradeIndex + 3].smoothGrade;
                 //}

            } else {
                
                    lapCounter++;
                     // window.alert("lap ended");
                    console.log("lap " + lapCounter);
                    
                    seekVideo(0, syncSeconds);   // total length);
                    gradeIndex=0;
                
                 let p1 = new GPXPoint(100.0, 0, 0, 0, 0, 0, 0, 0, 0, "", 0, 0);
                  console.log("route ended");
                console.log(gpsIndex + " Lat " + p1.lat);
                gpsArray[gpsIndex++] = p1;
                startTimer(); //????????????????
                lastRouteSeconds=totalSeconds;
                lastRouteDistance=totalDistance;
                initialDistance=0;
                if (!loopRoute) {
                    if (confirm("Route Ended, Save Ride?") == true) {
                        saveGPS();
                         gpsIndex=0;
                        saveData();
                    } else {
  
                    }
                    //alert("Route Ended");
                    //saveGPS();
                   // saveData();
                    /*
                    let person = prompt("Please enter your name", "Harry Potter");

                    if (person != null) {
                    document.getElementById("demo").innerHTML =
                    "Hello " + person + "! How are you today?";
                    }
                    */
                   
                } else {
                
                 startTimer();
                 }
               
                    return;
            }
            if (gradeIndex < gpxArray.length - 1 && gradeIndex >= 0) {
                /////////////console.log("i="+i);
                elevation = gpxArray[gradeIndex].ele;
                if (bMetric) {
                     mph = gpxArray[gradeIndex].mps * mps2kph;
               } else {
                    mph = gpxArray[gradeIndex].mps * mps2mph;
                }
                const currentDate = new Date();
                const gpsTime = currentDate.toISOString().slice(0,19); //"2011-10-05T14:48:00.000Z"
               
                if (gpsTime !== lastGPSTime) {
                    let p1 = new GPXPoint(gpxArray[gradeIndex].lat, gpxArray[gradeIndex].lon, gpxArray[gradeIndex].ele, gpxArray[gradeIndex].smoothEle, gpxArray[gradeIndex].secs, gpxArray[gradeIndex].grade, gpxArray[gradeIndex].smoothGrade, gpxArray[gradeIndex].totaldistancem, gpxArray[gradeIndex].mps, gpsTime, heartRate, power);
                    if ((gradeIndex % markerFrequency) == 0) {        
                             try {
                            updateMarkerOL(gpxArray[gradeIndex].lat,gpxArray[gradeIndex].lon);
                                     } catch (error) {
                                console.error("Could not fetch the minimap:", error);
                             }
                    }   
                    gpsArray[gpsIndex++] = p1;
                }
                lastGPSTime=gpsTime;
            }


          

            document.getElementById('grade').innerHTML = (grade * 100.0).toFixed(1);
            
        }

        
        let weight = riderWeight / lbs2kg;
        if (bMetric) {
           weight = riderWeight;
       }
       
        let velocity = speedFromPower(power, (grade * 100.0), elevation, weight) ; // mps
     
        if (bMetric) {
            velocity = velocity * mps2kph;
        } else {
             velocity = velocity * mps2mph;
        }
      
        document.getElementById('speed').innerHTML = velocity.toFixed(1);
    /*
     if (apikey !== undefined && apikey != null) {
      sendData( document.getElementById('timelbl').textContent, 
                  document.getElementById('distance').textContent,
                 power,
                 currentRpm.toFixed(0) ,
                 velocity.toFixed(1),
                 heartRate,
                  document.getElementById('avespeed').textContent,
               document.getElementById('avewatts').textContent,
            document.getElementById('averpm').textContent,
            document.getElementById('avehr').textContent,
            document.getElementById('pcal').textContent,
            document.getElementById('hrcal').textContent,
              document.getElementById('grade').textContent,
            document.getElementById('vgear').textContent,
                );
     }
     */
    
        if (velocity >= pauseSpeed) {
            if (appPaused == 1 ) { 
                appPaused=0;
                 startTimer();
                 console.log("Starting");
                }
            } else  { //< pause speed
                if (appPaused == 1) {
                } else {
                appPaused=1;
                startTimer();
                console.log("Pausing");
                }
            }

        if (appStart) {
            
        
            
            totalSpeed += velocity;
            totalSpeedPts++;
            totalVelocity += velocity;
            totalVelocityPts++;
            totalMph += mph;
            totalMphPts++;
            
            document.getElementById('avespeed').innerHTML = (totalSpeed / totalSpeedPts).toFixed(1);
            totalDistance = (totalSpeed / totalSpeedPts) * (totalSeconds / 3600);
            document.getElementById('distance').innerHTML = totalDistance.toFixed(2);
            
            console.log("videoSeconds2add " + videoSeconds2add);
            
            let gpxSeconds = gpxArray[gradeIndex].seconds - gpxArray[0].seconds+videoSeconds2add;
            seekVideo(gpxSeconds, syncSeconds);
            let ratio = velocity / 15.0;
            if (bUseAveVelocity) {
                if (totalVelocityPts == 5) {
                let aVelo = (totalVelocity / totalVelocityPts);
                let aMph = (totalMph / totalMphPts);
                ratio = aVelo / aMph;
                totalVelocity = 0;
                totalVelocityPts = 0;
                totalMph = 0;
                totalMphPts = 0;
                 console.log("ratio " + ratio.toFixed(1) + " aVelo " +aVelo.toFixed(1) + " aMph " +aMph.toFixed(1));
            }
                if (totalVelocityPts == 0) {
                changeVideoSpeed(ratio, gpxSeconds, totalSeconds)
                }
            } else {

            
                if (mph > 0) {
                      ratio = (velocity / mph);
                }
             
                console.log("ratio " + ratio.toFixed(1) +"orig mph "+ mph.toFixed(1) + " calc mph " + velocity.toFixed(1));
                changeVideoSpeed(ratio, gpxSeconds, totalSeconds)
            
            }
           
            if (smartTrainerConnected && !ERGMode) {
               
                 rpmAutoShift(currentRpm, activeRpm);
                 gradeAutoShift(nextGrade);
               
                 effectiveGrade = ((grade * 100.0) * (trainerDifficulty / 100.0))+vgear;
                  document.getElementById('gradel').innerHTML = effectiveGrade.toFixed(1);
                 console.log("effect grade "+effectiveGrade+ " grade "+(grade*100.0).toFixed(2) + " diff% " +trainerDifficulty+ " vgear "+vgear);
                 if (Math.abs(effectiveGrade - lastEffectiveGrade) > 0.1) {
                    trainerCommands.sendSimulation(effectiveGrade,windSpeed, coefficientRR, coefficientWR);
                }
                 lastEffectiveGrade = effectiveGrade;
            } // if smarttrainerconnected
            lastGradeIndex = gradeIndex;
           
            
        } // if appstart
    }
 function rpmAutoShift(currentRpm, activeRpm) {
     if (bUseAutoShiftRPM && cadenceConnected && currentRpm > activeRpm) {
                    if (currentRpm > maxrpm) {
                        if (vgear < maximumIncline) {
                        vgear++;
                            }
                        
                        document.getElementById('vgear').innerHTML = vgear;
                    } 
                    else if (currentRpm < minrpm) {
                        if (vgear > minimumIncline) {
                        vgear--;
                        }
                        document.getElementById('vgear').innerHTML = vgear;
                    }
                 }
     }
 function gradeAutoShift(nextGrade) {
      if (bUseAutoShiftGrade && gradeIndex != lastGradeIndex) {
                 let currentGrade = grade*100.0 ;
                 nextGrade = nextGrade*100.0 
                
                 
                 console.log("Grade " + currentGrade.toFixed(1) + " nextGrade" + nextGrade.toFixed(1));
                vgear = -Math.round(nextGrade * (trainerDifficulty / 100.0)) + baseVgear;
                 console.log("***Shift  "+Math.round( nextGrade - currentGrade) + " vgear "+vgear);
                    if (vgear < minimumIncline + baseVgear) {
                        vgear = minimumIncline + baseVgear;
                        }
                    
                
                        if (vgear > maximumIncline + baseVgear) {
                        vgear = maximumIncline + baseVgear;
                            }
                      console.log("***Shift  "+Math.round( nextGrade - currentGrade) + " vgear "+vgear);
                }
     }
 function gradeAutoShift2(nextGrade) {
      if (bUseAutoShift && gradeIndex != lastGradeIndex) {
                 let currentGrade = grade*100.0 ;
                 nextGrade = nextGrade*100.0 
                 let diff =( nextGrade - currentGrade) * (trainerDifficulty / 100.0);
                 console.log("Grade " + currentGrade.toFixed(1) + " nextGrade" + nextGrade.toFixed(1)+ " diff "+diff);
                if (nextGrade > currentGrade &&  (diff > 1.0)) { // uphill
                     console.log("***Shift down "+Math.round( nextGrade - currentGrade) + " vgear "+vgear);
                    vgear -= Math.round( nextGrade - currentGrade);
                     console.log("***Shift down "+Math.round( nextGrade - currentGrade) + " vgear "+vgear);
                    if (vgear < minimumIncline) {
                        vgear = minimumIncline;
                        }
                      console.log("***Shift down "+Math.round( nextGrade - currentGrade) + " vgear "+vgear);
                } else if (currentGrade > nextGrade && (diff < -1.0)) { // downhill
                     console.log("***Shift up "+Math.round( currentGrade - nextGrade)+" vgear "+vgear);
                       vgear += Math.round( currentGrade - nextGrade);
                      console.log("***Shift up "+Math.round( currentGrade - nextGrade)+" vgear "+vgear);
                        if (vgear > maximumIncline) {
                        vgear = maximumIncline;
                            }
                     console.log("***Shift up "+Math.round( currentGrade - nextGrade)+" vgear "+vgear);
                    }
                }
     }
 function initStartLoc() {
     initialDistance = Number(document.getElementById('initialdistance').value)
    console.log("initialDistance " + document.getElementById('initialdistance').value);
    console.log("totalDistance "+ totalDistance + " laps "+lapCounter + " course dist " +gpxArray[gpxArray.length - 1].distance);
     if (initialDistance > 0) {
            let i=0;
            if (bMetric) {
                 i = findGPX(initialDistance );
                
            } else {
                i = findGPX(initialDistance * miles2meters);
                }
            let gpxSeconds = gpxArray[i].seconds - gpxArray[0].seconds+videoSeconds2add;
            console.log("initLoc gpxSeconds "+gpxSeconds);
            seekVideo(gpxSeconds, syncSeconds);
        } else { console.log("Invalid initLoc")};
     }
 

    export function addGPSPoint(len, lat, lon, ele, secs, grade, distance, mps, gpsTime1) {
        if (gpsArray === undefined) {
            gpsArray = Array(len);
        }
        let smoothEle = 0;
        let smoothGrade = 0;
        let power = 0;
        const currentDate = new Date();
        const gpsTime = currentDate.toISOString(); //"2011-10-05T14:48:00.000Z"
        let p1 = new GPXPoint(lat, lon, ele, smoothEle, secs, grade, smoothGrade, distance, mps, gpsTime, heartRate, power);
        console.log(gpsIndex + " Lat " + p1.lat);
        gpsArray[gpsIndex++] = p1;

    }
   export function updateProgress(distance,totalDistance) {
         let currentProgress = distance*100/totalDistance;
        //console.log("**********Dist "+ distance + " total "+totalDistance);
        const progressBar = document
            .getElementById('progress');
        progressBar
                    .style
                    .width = currentProgress + '%';
       
        }
       
     

    export

    function startTimer() {
        //try {
            console.log('start timer...' + appStart);


            if (!trainerConnected) {
                alert("Connect a trainer, power meter or check VP (Virtual Power)")
                return
            }
            if (!appStarted) { 
                appStarted=true;
                initStartLoc();
            }
            if (!appStart) {

                beginTime = Date.now();
                console.log('starting timer...' + beginTime);
                appStart = true;
                playVideo();
                startTime();
            document.getElementById('startbutton').innerHTML = "Stop"
            document.getElementById('startbutton').className = "fa fa-stop";
             document.getElementById('buttons').style.display="none";

            } else {
                console.log('stoping timer...');
                appStart = false
                stopTime()
                pauseVideo();
                document.getElementById('startbutton').innerHTML = "Start"
                 document.getElementById('startbutton').className = "fa fa-play";
               document.getElementById('buttons').style.display="block";
            }
        /*
        } catch (err) {
            console.error('error occured: ', err.message)
        }
        */
    }


    let intervalID;

    function stopTime() {
        clearInterval(intervalID);
        
    }

    function startTime() {
        intervalID = setInterval(printTime, 1000);

    }

    async function printTime() {
        


            const millis = Date.now() - beginTime;
           
           
         processWorkout(millis);
         processVirtualWatts();
            
        try {
            //   console.log('print time ' + millis);
            beginTime = Date.now();
            //let seconds=Math.round(millis / 1000)
            totalMSeconds = totalMSeconds + millis
            totalSeconds = Math.round(totalMSeconds / 1000);
            const date = new Date(null);
            date.setSeconds(totalSeconds); // specify value for SECONDS here
            const result = date.toISOString().slice(11, 19);
            //console.log("time: "+result)
            document.getElementById('timelbl').innerHTML = result
        } catch (err) {
            console.error('error occured: ', err.message)
        }
    }
    function processWorkout(millis) {
        if (bWorkout) {
                 workoutTime= workoutTime - millis;
                totalWorkoutTime+=millis;
                if (workoutTime < 100) {
                    skipWorkoutInterval();
                } else {
                    let iw=totalPMWatts - intervalWatts
                    let ic=totalPMWattsPts - intervalCount;
        
                     document.getElementById('iwatts').innerHTML=(iw/ic).toFixed(0);
                    setTimeLeft();
                }
            ///////////// console.log("Workout time "+workoutTime+" twatts ##########"+document.getElementById('twatts').textContent+"#"
            ///////////            +"#"+document.getElementById('timeleft').textContent+"###############");
            }
           
        }
function processVirtualWatts() {
    if (bUseVirtualWatts) {
        processPower(virtualPower);
        }
    }
function skipWorkoutInterval() {
    workoutIndex++;
                    if (workoutIndex == zwoArray.length) {
                        //alert("Workout finished");
                      
                        document.getElementById('alrt').innerHTML='<b>Workout Finished</b>';
                        setTimeout(function() {document.getElementById('alrt').innerHTML='';},5000);
                        console.log("Workout finished");
                        document.getElementById('timeleft').innerHTML = "";
                        document.getElementById('twatts').innerHTML = "";
                        document.getElementById('iwatts').innerHTML = "";
                        bWorkout=false;
                        hideWorkoutCells();
                        ERGMode=false;
                        showVGear();
                        //document.getElementById("myPlot").style.display = "none";
                        const canvas = document.getElementById('barChart');
                        const ctx = canvas.getContext('2d');
                        //document.getElementById("barChart").style.display = "none";
                        ctx.canvas.hidden = true;
                        
                      
                    } else if (workoutIndex < zwoArray.length) {
                        totalWorkoutTime=0;
                        for (var j=0; j<workoutIndex; j++) {
                             totalWorkoutTime+=Number(zwoArray[j].duration*1000);
                            }
                        //totalWorkoutTime+=Number(zwoArray[i].duration*1000);
                        //document.getElementById('timeleft').innerHTML = zwoArray[workoutIndex].duration;
                        document.getElementById('tleftl').innerHTML="<b>Time Left("+(workoutIndex)+")</b>";
                        let tpower=Number(zwoArray[workoutIndex].power)*powerFTP;
                        workoutTime=Number(zwoArray[workoutIndex].duration*1000);
                        setTimeLeft();
                        document.getElementById('twatts').innerHTML = (tpower).toFixed(0);
                         document.getElementById('twatts').style.backgroundColor=powerColor(tpower);
                        //document.getElementById('twatts').style.opacity=0.5;
                        console.log("Workout time "+workoutTime+" twatts "+document.getElementById('twatts').textContent);
                         document.getElementById('alrt').innerHTML='<b>Decrease Power to </b>'+                     document.getElementById('twatts').textContent
                             //+" for "  +zwoArray[workoutIndex].duration + " seconds";
                             +" for " + formatTime(zwoArray[workoutIndex].duration);
                        if (workoutIndex > 0 && tpower > Number(zwoArray[workoutIndex-1].power)*powerFTP) {
                            document.getElementById('alrt').innerHTML='<b>Increase Power to </b>'+      document.getElementById('twatts').textContent
                              //   +" for " + zwoArray[workoutIndex].duration + " seconds";
                               +" for " + formatTime(zwoArray[workoutIndex].duration);
                            }
                        setTimeout(function() {document.getElementById('alrt').innerHTML='';},5000);
                        beep2();
                        //speak(document.getElementById('alrt').textContent);
                        intervalWatts=totalPMWatts;
                        intervalCount=totalPMWattsPts;
                        if (smartTrainerConnected && ERGMode) {
                            trainerCommands.sendTargetPower(tpower);
                             //sendTargetPower(tpower);
                            }
                    }
    
}
function setTimeLeft() {
    let timeleft=workoutTime/1000;
    document.getElementById('timeleft').innerHTML = formatTime(timeleft);
    drawTimeCompleted(totalWorkoutTime/1000);
    
    }

export function formatTime(timeleft) {
    if (timeleft >= 3600) {
                        const date = new Date(null);
                        date.setSeconds(timeleft); // specify value for SECONDS here
                        const result = date.toISOString().slice(11, 19);
                        //document.getElementById('timeleft').innerHTML = result;
                        return result;
                    } else if (timeleft > 60) {
                        const date = new Date(null);
                        date.setSeconds(timeleft); // specify value for SECONDS here
                        const result = date.toISOString().slice(14, 19);
                        //document.getElementById('timeleft').innerHTML = result;
                        return result;
                    } 
                    else {
                        //document.getElementById('timeleft').innerHTML = (timeleft).toFixed(0);
                        return (timeleft).toFixed(0);
                    }
    }
    // A global variable should be defined to hold the URL for the file to be downloaded
    // This is good practice as if many links are being generated or the link is being regularly updated, you don't want to be creating new variables every time, wasting memory
    var textFileUrl = null;

    // Function for generating a text file URL containing given text
    function generateTextFileUrl(txt) {
        let fileData = new Blob([txt], {
            type: 'text/plain'
        });

        // If a file has been previously generated, revoke the existing URL
        if (textFileUrl !== null) {
            window.URL.revokeObjectURL(textFileUrl);
        }

        textFileUrl = window.URL.createObjectURL(fileData);

        // Returns a reference to the global variable holding the URL
        // Again, this is better than generating and returning the URL itself from the function as it will eat memory if the file contents are large or regularly changing
        return textFileUrl;
    };
    function speak(text) {
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Adjust speech properties
    utterance.rate = 1;  // Speed of speech (1 is normal, 0.5 is slower, 2 is faster)
    utterance.pitch = 1; // Pitch of the voice (0 is low, 2 is high)
    utterance.volume = 1; // Volume level (0 is mute, 1 is full volume)

    window.speechSynthesis.speak(utterance);
}
    function saveData() {
       saveGPS();
        //const data = new Blob(['Hello, world!'], { type: 'text/plain' });
        let text = "datetime," + new Date().toLocaleString() +
            ",distance," + document.getElementById('distance').textContent +
            ",duration," + document.getElementById('timelbl').textContent +
            ",ave speed," + document.getElementById('avespeed').textContent +
            ",ave watts," + document.getElementById('avewatts').textContent
            //+",ave pm watts," + document.getElementById('avepm').textContent
            +
            ",ave rpm," + document.getElementById('averpm').textContent +
            ",ave hr," + document.getElementById('avehr').textContent +
            ",max hr," + maximumHR.toFixed(0) +
            ",pcalories," + document.getElementById('pcal').textContent +
            ",hrcalories," + document.getElementById('hrcal').textContent +
            ",NP,"+Number(normalizedPower.NP).toFixed(0) +
               ",IF," + Number(normalizedPower.intensityFactor).toFixed(2) +
               ",TSS," + Number(normalizedPower.calcTSS(totalSeconds)).toFixed(0)
         
        let data = new Blob([text], {
            type: 'text/plain'
        });
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        let today = new Date().toISOString();
        let filename = 'vroadHistory-' + today + '.txt';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        //sendMail(text);
    }
    function sendMail(message)
{
    if (emailAddress.includes('@')) {
    var subject = "vRoad Data";
    document.location.href = "mailto:"+emailAddress+"?subject="
        + encodeURIComponent(subject)
        + "&body=" + encodeURIComponent(message);
        }
}
function sendGPS() {
   
    let text = getGPS();
  
    var subject = "Virtual_Road Bike Ride";
    document.location.href = "mailto:stravaupload@gotoes.org?subject="
        + encodeURIComponent(subject)
        + "&body=" + encodeURIComponent(text);
       
    }
async function wait(ms) {
        return await new Promise(res => setTimeout(res, ms));
}

   
 function saveGPS() {
        //const data = new Blob(['Hello, world!'], { type: 'text/plain' });
        let text = getGPS();
        //let result = text.indexOf("<?xml");
        //let newtext = text.substring(1,result);
        let data = new Blob([text], {
        //let data = new Blob([newtext], {
            type: 'text/plain'
        });
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        let today = new Date().toISOString().slice(0, 16);
        let filename = today+gpxFilename.name;
       // let today = new Date().toISOString();
        //let filename = 'vroad-' + today + '.gpx';
        //saveTextFileOnServer(text, fileName)
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
       //sendGPS();
       // sendGPS("Mail to strava");
    }
   
    function getGPS() {
        let activity = "VirtualRide";
        if (runPod) {
            activity = "VirtualRun";
        }
        
        let text = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
            "<gpx version=\"1.0\">" +
            "<name>" +
            "Virtual " + activity + "-" +gpxFilename+
            "</name>" +
            "<trk>" +
            "<name>" +
            "Virtual " + activity + gpxFilename+
            "</name><type>" + activity + "</type><trkseg>\n";
        let footer =
            "</trkseg>" +
            "</trk>" +
            "</gpx>";;
        console.log("gpsArray size " + gpsIndex);

        for (let j = 0; j < gpsIndex - 1; j++) {
            //    console.log("j "+j);
            if (gpsArray[j].lat > 99.0) {
                //text += "</trkseg>\n "+"<trk>" +"<name>" +"Virtual " + activity +"</name><type>" + activity + "</type><trkseg>\n";  // start a new trk
                text += "</trkseg><trkseg>\n";  // start a new segment
                /**************
                text  +=
                        "</trkseg>" +
                        "</trk>" +
                        "</gpx>\n";
                text += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                        "<gpx version=\"1.0\">" +
                        "<name>" +
                        "Virtual " + activity +
                        "</name>" +
                        "<trk>" +
                        "<name>" +
                        "Virtual " + activity +
                        "</name><type>" + activity + "</type><trkseg>\n";
                        ****************/
                continue;
            }
            text += "<trkpt lat=\"" + gpsArray[j].lat + "\" " + "lon=\"" + gpsArray[j].lon + "\">\n";
            text += "<ele>" + gpsArray[j].ele + "</ele>\n";
            text += "<time>" + gpsArray[j].gpsTime + "</time>\n";
            text += "<extensions>\n";
            text += "<power>" + gpsArray[j].power + "</power>\n";
            if (gpsArray[j].hr === undefined) {} else {
                text += "<gpxdata:hr>" + gpsArray[j].hr + "</gpxdata:hr>\n";
            }
            text += "</extensions>\n";
            text += "</trkpt>\n";

        }
        text += footer;
        return text;
    }
