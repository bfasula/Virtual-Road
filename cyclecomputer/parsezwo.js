import {sWorkout,formatTime} from './cyclecomputer.js';
import {NormalizedPower} from './NormalizedPower.js';
window.selectWorkout=selectWorkout

/*

       // Data for the chart
       let data = [
            { label:'30', value: 100, color: 'red', width: 30 },
            { label:'50', value: 150, color: 'blue', width: 50 },
            { label:'20', value: 75, color: 'green', width: 20 },
            { label:'40', value: 300, color: 'orange', width: 40 }
        ];
        */
//const length = 5;
const data = [];
let xscale=1.0;
let yscale=1.0;
let maxPower=0;
let powerFTP = localStorage.getItem(".powerFTP");
  let totalSecs=0;
let normalizedPower = new NormalizedPower(powerFTP);

export let workoutDirectory="Workouts/";
//export var gpxArray;
export  function selectWorkout() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = ['.zwo']

    input.onchange = e => { 
    /*
    file.name // the file's name including extension
file.size // the size in bytes
file.type // file type ex. 'application/pdf'
*/
    let file  = e.target.files[0]; 
    console.log("File selected " + file); 
      ///sWorkout(workoutDirectory+file.name);
      parseZWO(file);
        //sWorkout(file.name);
}
    input.click();

}

    // Declaration
export class zwoPoint{
  constructor(tag,duration, power) {
    this.tag = tag;
    this.duration = duration;
    this.power = power;
    
  }
}
   export var zwoArray;
    var response;
    var xArray = Array(0);
    var yArray = Array(0);
    var wArray = Array(0);
    var cArray = Array(0);
    let aIndex=0;
export async function  parseZWO(filename) {

    
       try {
        
      
          ////////response = await fetch(filename);
       
          
          let fr = new FileReader();
         fr.onload = function () {
                    response = fr.result;
              console.log("response ");
     console.log(response);
             processZWO(response);
             sWorkout(filename.name);
                }
         await  fr.readAsText(filename);
         /*****
         response = new FileReader();
            response.readAsText(filename);
      if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }        
    
           
        
   
      let    s1 = await response.text();
    ***********/
          } catch (error) {
        console.error('Error loading XML:', error);
       
       
    }
    
}
function processZWO(xmlString) {
    aIndex=0;
      xArray = Array(0);
     yArray = Array(0);
     wArray = Array(0);
     cArray = Array(0);
var doc = new DOMParser().parseFromString(xmlString, "text/xml");
    
      totalSecs=0;
    xscale=1.0;
 yscale=1.0;
 maxPower=0;
     let text="";
   const tags = doc.getElementsByTagName("workout");
    console.log(tags[0]);
    
    /*
    const cmds=tags[0].getElementsByTagName("*");
    
    for (var i=0; i<cmds.length; i++){
        console.log(cmds[i]);
         console.log(cmds.item[i]);
        text+=cmds[i];
        }
    console.log(text);

    */
    
    var start = xmlString.indexOf("<workout>");
    var end = xmlString.indexOf("</workout>");
    let cmds = xmlString.slice(start+9, end-9);
    console.log("cmds "+cmds);
    
    console.log("description");
     var desc=doc.querySelectorAll("description");
    console.log("desc Links "+desc.length);
    console.log(desc[0].textContent);
    
     console.log("name");
     var name=doc.querySelectorAll("name");
    console.log("name Links "+name.length);
    //console.log(name[0]);
    console.log(name[0].textContent);

    
    var links = doc.querySelectorAll("workout");
    console.log("workout Links "+links.length);
    console.log(links[0]); 
 
 console.log(" links "+links[0].getAttribute("workout"));

    var a=doc.getElementById("workout");
     console.log(a);
     //var links = doc.querySelectorAll("*");
     var links = links[0].querySelectorAll("*");
    console.log("Links "+links.length);
   zwoArray = Array(0);
    let zwoIndex=0;
   
   
 for(var i =0; i< links.length; i++) {
       var child = links[i];
     console.log("child");
      console.log(child);
     
  //Warmup, Cooldown, SteadyState, IntervalsT
      var dur=child.getAttribute("Duration");
      var pwr=child.getAttribute("Power");
     var pwrlo=child.getAttribute("PowerLow");
      var pwrhi=child.getAttribute("PowerHigh");
       var ondur=child.getAttribute("OnDuration");
         var offdur=child.getAttribute("OffDuration");
     var onpwr=child.getAttribute("OnPower");
      var offpwr=child.getAttribute("OffPower");
      var repeat=child.getAttribute("Repeat");
     var tag="SteadyState";
     var power;
     var p1;
     if (pwrlo!=null) { // warmup or cooldown
               
          if (pwrlo < pwrhi) {
             tag="Warmup";
            let time=dur/2;
            let power=Number(pwrlo);
            p1 = new zwoPoint(tag,time,power);
            zwoArray[zwoIndex++]=p1;

            power=Number(pwrhi);
            p1 = new zwoPoint(tag,time,power);
            zwoArray[zwoIndex++]=p1;
               
             
             }
            
     
         else if (pwrlo > pwrhi) {
            tag="Cooldown";
            
              let time=dur/2;
              let power=Number(pwrlo);
            p1 = new zwoPoint(tag,time,power);
            zwoArray[zwoIndex++]=p1;

            power=Number(pwrhi);
            p1 = new zwoPoint(tag,time,power);
            zwoArray[zwoIndex++]=p1;
         }
         
     }
      else if (ondur!=null) {
          tag="Intervals";
          let nint=Number(repeat);
           for (var j=0; j<nint; j++) {
                console.log(tag + " Duration "+ondur+" Pwr "+onpwr);
                p1 = new zwoPoint(tag,ondur,onpwr);
                zwoArray[zwoIndex++]=p1;
                console.log(tag + " Duration "+offdur+" Pwr "+offpwr);
                p1 = new zwoPoint(tag,offdur,offpwr);
                
                zwoArray[zwoIndex++]=p1;
               }
            
      }
     else { //steady state
         tag="SteadyState";
       console.log(tag + " Duration "+dur+" Pwr "+pwr);
          p1 = new zwoPoint(tag,dur,pwr);
         
        zwoArray[zwoIndex++]=p1;
         }
      
     } // for loop

    
 
   let totalPower=0;
   let xSecs=0;
   cmds="";
   console.log("Len "+zwoArray.length);
    for (var i=0; i< zwoArray.length; i++) {
        console.log(zwoArray[i].tag +","+ zwoArray[i].duration+","+ zwoArray[i].power);
        totalSecs+=Number(zwoArray[i].duration);
        let power=Number(zwoArray[i].power)*Number(powerFTP);
        totalPower+=Number(zwoArray[i].duration)*power;
        if (power > maxPower) { maxPower=power};
         console.log(i+" Total Power "+totalPower + " total Secs "+totalSecs);
         addPoint(zwoArray[i].power,zwoArray[i].duration,totalSecs);
//cmds+="\n Power "+ zwoArray[i].power + formatTime(Number(zwoArray[i].duration));
          cmds+="\n Power "+ power.toFixed(0) + " " + formatTime(Number(zwoArray[i].duration));
          calculateNP(zwoArray[i].power, zwoArray[i].duration);
         console.log("NP "+normalizedPower.NP);
        }
   console.log("NP "+normalizedPower.NP + " IF " + normalizedPower.intensityFactor + " TSS " + normalizedPower.calcTSS(totalSecs));
    const result= formatTime(totalSecs);
     //alert(name[0].textContent+"\nTime "+ result + "\n" +desc[0].textContent+"\n"+cmds);
    //document.getElementById('barChart').setAttribute('title', desc[0].textContent);
    document.getElementById("barChart").title = desc[0].textContent;
    console.log("Total secs "+totalSecs + " " +result);
    console.log("xArray size "+xArray.length);
  
    for (var i=0; i< xArray.length; i++) {
         console.log("Arrays " + cArray[i] + ' ' +xArray[i] + ' '+yArray[i] + ' ' + wArray[i]);
       
       
        data[i] = { label: formatTime(Number(zwoArray[i].duration)), value: yArray[i], color: cArray[i], width:zwoArray[i].duration };
     
        }
    console.log("Total Power "+totalPower + " total Secs "+totalSecs);
    let aPower=(totalPower/totalSecs).toFixed(0);
    //createPlot(name[0].textContent+"\nTotal Time "+ result + " watts " + aPower);
    console.log("data array "+data.length + " " +data);
    
    drawChart(name[0].textContent+" Time "+ result + " Watts " + aPower
              +" NP "+Number(normalizedPower.NP).toFixed(0)
              + " IF " + Number(normalizedPower.intensityFactor).toFixed(2) 
              + " TSS " + Number(normalizedPower.calcTSS(totalSecs)).toFixed(0) ,data);
    }
function calculateNP(pwr,dur) {
    for (var i=0; i<dur; i++) {
        normalizedPower.addPower(pwr*Number(powerFTP));
    }
}


function addPoint(pwr,dur,totalSecs) {
    let p=Number(pwr)*powerFTP;
      xArray[aIndex]=aIndex;
    //xArray[aIndex]=dur;
       //xArray[aIndex]=totalSecs;
      yArray[aIndex]=(p.toFixed(0));
     wArray[aIndex]=Number((Number(dur)/600).toFixed(1));
     //wArray[aIndex]=Number(dur);
      console.log(wArray[aIndex]);
      //let color='gray';
      //if (p>powerFTP) {color='orange';}
      cArray[aIndex++]=powerColor(p);
     //console.log(color + ' ' +(p.toFixed(0)) + ' '+(Number(dur)/600).toFixed(1));
}

export function powerColor(power) {
         if (power >= (powerFTP*1.20)) {
            return 'purple';
            } else
     if (power >= (powerFTP*1.05)) {
             return 'red';
            } else
        if (power >= (powerFTP*.90)) {
             return 'orange';
            } else
         if (power >= (powerFTP*.80)) {
            return 'yellow';
            } else
        if (power >= (powerFTP*.60)) {
             return 'green';
            } else
        if (power >= (powerFTP*.40)) {
            return 'blue';
            } else
        {
            return 'white';
            }
}


async function  createPlot(title1)  {
     document.getElementById("myPlot").style.display = "block";
   // const wArray = [0.4, 0.6, 1.0, 1.2, 0.5]
   //  const wArray = [0.5, 0.8, .5, .8, 0.5]
    const layout = {title:title1};
    var trace1 = {
    type: 'bar',
    marker:{
    color: cArray
    },
    x: xArray,
    y: yArray,
    width: wArray
    }
        var data = [trace1];
    Plotly.newPlot('myPlot', data,layout);
}

async function drawChart(title,data) {
        const canvas = document.getElementById('barChart');
        const ctx = canvas.getContext('2d');
        ctx.canvas.hidden = false;
        let xPosition = 30;
        let padding=50;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        xscale=((canvas.width-xPosition)/totalSecs);
        yscale=(canvas.height-20)/maxPower;
        console.log("xscale "+xscale + " yscale "+yscale);
/*
        // Data for the chart
        const data = [
            { label:'30', value: 100, color: 'red', width: 30 },
            { label:'50', value: 150, color: 'blue', width: 50 },
            { label:'20', value: 75, color: 'green', width: 20 },
            { label:'40', value: 300, color: 'orange', width: 40 }
        ];
  */     
        for (i=0;i<data.length; i++) {
        //data[i].value=(data[i].value/canvas.height)*canvas.height;
        console.log(data[i]);
             console.log(data[i].value + " " + data[i].color + " " + data[i].width);
            }
         console.log("canvas size "+canvas.width +"x"+canvas.height);
        // Chart properties
        const chartHeight = canvas.height - 20;
        const barSpacing = 0;
        let interval=0;
       
        // Draw bars
        data.forEach(bar => {
            ctx.fillStyle = bar.color;
            ctx.fillRect(
                xPosition, 
                chartHeight - Number(bar.value)*yscale, // Position bar bottom-up
                Number(bar.width)*xscale, 
                Number(bar.value)*yscale
            );
            xPosition += Number(bar.width)*xscale + barSpacing;
           
              // Add labels
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    //ctx.fillText(bar.label, xPosition - bar.width - barSpacing / 2, chartHeight + padding + 15);
              ctx.fillText(bar.label, xPosition - (bar.width*xscale)/2 - barSpacing / 2, chartHeight +15);
            //ctx.fillStyle = 'yellow';
             ctx.fillText(bar.value, xPosition - (bar.width*xscale)/2 - barSpacing / 2, chartHeight -15);
             ctx.fillText(interval++, xPosition - (bar.width*xscale)/2 - barSpacing / 2, chartHeight -4);
            
        });
        
        // Add chart title
ctx.fillStyle = 'black';
ctx.font = '16px Arial';
ctx.textAlign = 'center';
ctx.fillText(title, canvas.width / 2, padding - 20);
//ctx.fillText(title, padding+20, padding - 20);
let yvalue=chartHeight;
let y=0;
let len=maxPower/50;
 for (var i=0; i< len; i++) {     
        // Add yaxis lable
ctx.fillStyle = 'black';
ctx.font = '16px Arial';
ctx.textAlign = 'left';
ctx.fillText(y, 0,yvalue);
     yvalue-=50*yscale;
     y+=50;
   
     }

}
export function drawTimeCompleted(secs) {
        const canvas = document.getElementById('barChart');
        const ctx = canvas.getContext('2d');
        ctx.canvas.hidden = false;
        let xPosition = 30;
        let padding=50;
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        xscale=((canvas.width-xPosition)/totalSecs);
        yscale=(canvas.height-20)/maxPower;
        console.log("xscale "+xscale + " yscale "+yscale);
/*
        // Data for the chart
        const data = [
            { label:'30', value: 100, color: 'red', width: 30 },
            { label:'50', value: 150, color: 'blue', width: 50 },
            { label:'20', value: 75, color: 'green', width: 20 },
            { label:'40', value: 300, color: 'orange', width: 40 }
        ];
  */     
       
         console.log("canvas size "+canvas.width +"x"+canvas.height);
    const cdata = [];
      cdata[0] = { label: formatTime(secs), value: 10, color: 'white', width:secs };
        // Chart properties
        const chartHeight = canvas.height - 20;
        const barSpacing = 0;
        let interval=0;
       
        // Draw bars
        cdata.forEach(bar => {
            ctx.fillStyle = bar.color;
            ctx.fillRect(
                xPosition, 
                chartHeight - Number(bar.value)*yscale, // Position bar bottom-up
                Number(bar.width)*xscale, 
                Number(bar.value)*yscale
            );
            xPosition += Number(bar.width)*xscale + barSpacing;
      
            
        });
  

}



 
   
