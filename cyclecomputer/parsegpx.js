import {runPod,initializeRoute,bMetric,maximumIncline, minimumIncline, setWindResistance, setRollingResistance} from './cyclecomputer.js';
import {updateMapOL} from './minimap.js';
import {videoDirectory,youtubeSetVideoId,onYouTubeIframeAPIReady2} from './playvideo.js';
window.selectGPX=selectGPX
let nElevations=5;
var lastElevations = Array(0,0,0,0,0,0,0,0,0,0);
let nMps=5;
let mps2mph = 2.236936;
var lastMps = Array(0,0,0,0,0,0,0,0,0,0);
let gpxIndex=0;

export var gpxFilename="";
export var loopRoute=false;
export var youtubeVideoId=null;
//window.loadGPX=loadGPX;
//export async function loadGPX() {
//    fetchFileFromServer('/gpxfiles/70 minute Indoor Cycling 4 Hill WorkoutUT.gpx');
//    }
export async function fetchGPXFromServer(url) {
  try {
    const response = await fetch(url);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    gpxIndex=0;
     initializeRoute();
   
    
    console.log("Fetch "+url);
    let fname=url.replace("gpxfiles/", "");
    fname=fname.replace(".gpx", "");
    fname = "  " +fname;
    // Read the response body as text
    const fileContent = await response.text();
    
    console.log(fileContent);
    gpxFilename={name: fname};
       console.log("gpxFilename "+gpxFilename);
      if (gpxFilename.name.indexOf("Loop")  >= 0) {
       ////////  if (filename.indexOf("Loop")  >= 0) {
        loopRoute=true;
        console.log("Loop Route ");
        }
    processXML(fileContent,{name: fname});
    return fileContent;

  } catch (error) {
    console.error("Could not fetch the file:", error);
  }
}

// Example usage:
///fetchFileFromServer('/files/data.txt');


export function resetYoutubeVideoId() {
    youtubeVideoId=null;
    }
export  function selectGPX() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = ['.gpx','GPX']

    input.onchange = e => { 
    /*
    file.name // the file's name including extension
file.size // the size in bytes
file.type // file type ex. 'application/pdf'
*/
    let file  = e.target.files[0]; 
    console.log("File selected " + file);
     //document.getElementById('myVid').innerHTML = file.name;
    //document.getElementById("myVid").src=videoDirectory+file.name;
     
    //myVideo = file.name;
    //myVideo = document.getElementById("myVid");
    console.log("filename "+file.name);
    //logger("new file " + myVideo.innerHTML)
    let gpxfile=(file.name);
      console.log("gpx file " + gpxfile);
   
    ////////////parseXML(videoDirectory+gpxfile);
         parseXML(file);
    console.log("gpxArray " + gpxArray);   
    //openFullScreen();
    
}
    input.click();

    }


export class GPXPoint{
  constructor(lat, lon, ele,smoothEle, seconds, grade,smoothGrade, distance, mps, gpsTime, hr, power) {
    this.lat = lat;
    this.lon = lon;
    this.ele = ele;
    this.smoothEle = smoothEle;
    this.seconds = seconds;
    this.grade = grade;
    this.smoothGrade = smoothGrade;
    this.distance = distance;
    this.mps = mps;
    this.gpsTime = gpsTime;
    this.hr = hr;
    this.power = power;
    this.rpm = rpm;
  }
}

export function printGPX(i) {
       console.log("i " + i
                   +" lat "+gpxArray[i].lat
                   +" lon "+gpxArray[i].lon
                   +" ele "+gpxArray[i].ele
                    +" smoothEle "+(gpxArray[i].smoothEle).toFixed(2)
                    +" seconds "+gpxArray[i].seconds
                   +" grade "+(gpxArray[i].grade*100.0).toFixed(2)
                    +" smooth grade "+(gpxArray[i].smoothGrade*100.0).toFixed(2)
                       +" meters "+gpxArray[i].distance.toFixed(2)
                    +" miles "+(gpxArray[i].distance/ 1609.344).toFixed(2)
                   +" mps "+gpxArray[i].mps.toFixed(2)
                      +" mph "+(gpxArray[i].mps*2.236936).toFixed(2)
                  + " time " + gpxArray[i].gpsTime);
    }
export function updateGPXArray(i,time) {
    let p1 = new GPXPoint(gpxArray[i].lat, gpxArray[i].lon,gpxArray[i].ele,gpxArray[i].smoothEle, gpxArray[i].secs, gpxArray[i].grade, gpxArray[i].smoothGrade, gpxArray[i].totaldistancem, gpxArray[i].mps,time,0,0);
                gpxArray[i]=p1;
    }
export function getGPS() {
    let activity="Ride";
    if (runPod) {
        activity="Run";
        } 
    console.log("Gpx length "+gpxIndex);
    /*
    <?xml version="1.0" encoding="UTF-8"?><gpx version="1.0"><name>Bike Ride</name><trk><name>Bike Ride</name><type>Ride</type><trkseg>
     <trkpt lat="41.2709750" lon="-72.7752570">
            <ele>7.3</ele>
            <time>2022-08-28T15:02:28Z</time>
            */
    let text= "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
            +"<gpx version=\"1.0\">"
            +"<name>"
            +activity
            +"</name>"
            +"<trk>"
            +"<name>"
            +activity
            +"</name><type>"+activity+"/type><trkseg>\n";
    let footer=
            "</trkseg>"
            +"</trk>"
            +"</gpx>";
    ;
    for (let j=0; j<gpxIndex-1; j++) {
        text+="<trkpt lat=\"" + gpxArray[j].lat + "\" " + "lon=\""+gpxArray[j].lon+"\">";
        text+="<ele>" + gpxArray[j].ele + "</ele>";
        text+="<time>" + gpxArray[j].gpsTime + "</time>";
        text+="</trkpt>\n";
        printGPX(j);
        }
    text+=footer;
    return text;
    }
export var gpxArray ;
//export var gpsArray ;
function timeToSeconds(datetime) {
    //1970-01-01T00:00:00.000Z
    const myArray = datetime.split("T");
    const tArray= myArray[1].split(":");
    const hrs=Number(tArray[0]);
     const mins=Number(tArray[1]);
     const secs=Number(tArray[2].replace("Z",""));
     const tsecs=hrs*3600+mins*60+secs;
    //console.log(hrs + " " + mins + " " + secs + " "+tsecs);
    return tsecs;
    }


 export async function parseXML(filename) {
    // XML String:
 console.log("parseXML " +filename);
     gpxFilename=filename;
     initializeRoute();
   
    if (filename.name.indexOf("Loop")  >= 0) {
       ////////  if (filename.indexOf("Loop")  >= 0) {
        loopRoute=true;
        console.log("Loop Route ");
        }
  // parse an XML string and get the value of a specific attribute
//var s1 = "<trkseg><trkpt lat=\"41.71877\" lon=\"12.67855\"><ele>429.4</ele><time>1970-01-01T00:00:00.000Z</time></trkpt>\n";
//var s2 = "<trkpt lat=\"42.71877\" lon=\"12.67855\"><ele>529.4</ele><time>1970-01-01T00:00:01.000Z</time></trkpt>\n</trkseg>";
////////var xmlString;
console.log(filename);
var response;
    gpxIndex=0;
     try {
        
      
          ////////response = await fetch(filename);
       
          
          let fr = new FileReader();
         fr.onload = function () {
                    response = fr.result;
      //        console.log("response ");
     //console.log(response);
             processXML(response,filename);
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
function processXML(response,file) {
let filename=file.name;
let s1=   response;
    
let str1 = s1.indexOf("<name>");
let end1 = s1.indexOf("</name>");
var nameString = s1.slice(str1+"<name>".length,end1) ;    
console.log("Xml name="+nameString);
const nArray= nameString.split(":");

var length =nArray.length;
console.log(length);
let videoSyncSeconds=0;
if (length > 1) {
    videoSyncSeconds=nArray[1];
    console.log("video sync seconds "+videoSyncSeconds);
     document.getElementById('secs2add').value = videoSyncSeconds;
}
if (length > 2) {
       
    youtubeVideoId=nArray[2];
    onYouTubeIframeAPIReady2(youtubeVideoId);
    console.log("youtube videoid "+youtubeVideoId);
    //youtubeSetVideoId(youtubeVideoId);
}
if (length > 3) {
       
    setRollingResistance(nArray[3]);
    console.log("rolling resistance "+nArray[3]);
   
}
if (length > 4) {
       
    setWindResistance(nArray[4]);
    console.log("wind resistance "+nArray[4]);
   
}

    
let start = s1.indexOf("<trkseg>");
let end = s1.indexOf("</trkseg>");
var xmlString = s1.slice(start,end+"<trkseg>".length) ;
    let maxInclination=Number(maximumIncline)/100.0;
let minInclination=Number(minimumIncline)/100.0;
console.log("max grade " + maximumIncline + " min grade " + minimumIncline);
console.log("max grade " + maxInclination + " min grade " + minInclination);
     
    //console.log(s2);
    var doc = new DOMParser().parseFromString(xmlString, "text/xml");
   
    var rootElement = doc.documentElement;
    var links = doc.querySelectorAll("trkpt");
    //var children = rootElement.childNodes;
    let lastSmoothEle=0;
    let lastele=0;
    let lastlat=0;
    let lastlon=0;
    let totaldistancem=0;
    let lastsecs=0;
    let secs=0;
    gpxArray = Array(links.length);
    
   
    
   //for(var i =0; i< children.length; i++) {
    for(var i =0; i< links.length; i++) {
       //var child = children[i];
        var child = links[i];
       // <studen> Element
       if(child.nodeType == Node.ELEMENT_NODE)  {
        var lat=child.getAttribute("lat");
        var lon=child.getAttribute("lon");
        var eleElement = child.getElementsByTagName("ele")[0];
        var timeElement = child.getElementsByTagName("time")[0];
        //console.log("ele size " + ele.length)
        //ele=child.getElementsByTagName("ele").item(0).getTextContent();
           
          //console.log(eleElement)
          //  console.log(timeElement)
        
        var ele = eleElement.textContent; // meters above sea level
        
           
           if (timeElement === undefined) {
                secs=lastsecs+1;
               } else {
            var mytime = timeElement.textContent;
                 secs=timeToSeconds(mytime);
               }
               
          let distancem=0
           var grade=0
           var smoothGrade=0
           var mps=0;
          
           
           // let smoothEle=smoothElevation(Number(ele), i);
           let smoothEle=smoothElevationLSQ(Number(ele), i);
           
           if (lastele != 0) {
                distancem=calculateDistance(lat, lon, lastlat, lastlon)*1000;
                totaldistancem = totaldistancem + distancem
               if (distancem > 0.1) {
               grade=(ele-lastele)/distancem;
                    } else {grade=0;}
               /*
               if (grade > maxInclination) {
                    grade = maxInclination;
                }
                if (grade < minInclination) {
                    grade = minInclination;
                }
                */
                //smoothGrade=(smoothEle-lastSmoothEle)/distancem;
               //let origmps=distancem/(secs-lastsecs);
              // mps=smoothMps(origmps,i);
               //smoothEle=smoothElevation(Number(ele), i);
               if (distancem > 0.1) {
                smoothGrade=(smoothEle-lastSmoothEle)/distancem;
                   } else {smoothGrade=0;}
               if (smoothGrade > maxInclination) {
                    smoothGrade = maxInclination;
                }
                if (smoothGrade < minInclination) {
                    smoothGrade = minInclination;
                }
              // console.log("meters " + distancem + " grade " + grade + " smooth " + smoothGrade);
               mps=distancem/(secs-lastsecs);
               ///////////////////////////////mps=smoothMps(mps,i); 12/25/25
               //console.log("mps "+mps + " netdist " + distancem + " secs " + (secs-lastsecs));
               //constructor(lat, lon, ele,seconds, grade, distance, mps) {
              
    
               }
           
             let p1 = new GPXPoint(lat, lon, ele,smoothEle, secs, grade, smoothGrade, totaldistancem, mps,"");
                gpxArray[gpxIndex++]=p1;
           /*
            console.log(i+ " time " +mytime + " secs "+secs
            +",mps "+mps.toFixed(2)  + ",mph " +( mps  * mps2mph).toFixed(2)
            +",meters "+distancem.toFixed(2)
              +",totalm "+totaldistancem.toFixed(2)     
                     
           +",lat "+lat
           +",lon "+lon
           
           +",elevation " +ele
                 +",smgrade " + (smoothGrade*100.0).toFixed(2)
                       +",grade " + (grade*100.0).toFixed(2));
           */
                      
           lastSmoothEle=smoothEle;
           lastele=ele;
           lastlon=lon;
           lastlat=lat;
           lastsecs=secs;
       }
       
    }  // end loop
     console.log("total meters "+ totaldistancem.toFixed(2));
    console.log("total miles "+ (totaldistancem/1000*.62).toFixed(2));
    console.log("total points "+ gpxIndex);
    console.log("gpxArray size " +gpxArray.length);
        
       // for(var i =0; i< gpxArray.length; i++) {
      //     printGPX(i);
      //    }
          //  updateMap(gpxArray[0].lat,gpxArray[0].lon,filename);
     updateMapOL(s1);
        //console.log("i = "+findGPX(100.0));
     if (bMetric === 'true') {
          document.getElementById('pctlbl').innerHTML = filename + " " +(totaldistancem/ 1000).toFixed(1) + " KM ";
    } else {
         document.getElementById('pctlbl').innerHTML = filename + " " +(totaldistancem/ 1609.344).toFixed(1) + " Miles ";
         console.log(filename + " " +(totaldistancem/ 1609.344).toFixed(1) + " Miles ");
    }
     drawElevation();
    return gpxArray;
    }
export function findGPX(distance) {
    //console.log("finding " + distance);
    for(var i =0; i< gpxArray.length; i++) {
       // console.log("i " + i+" lat "+gpxArray[i].lat+" lon "+gpxArray[i].lon+" ele "+gpxArray[i].ele
        //+" seconds "+gpxArray[i].seconds+" grade "+gpxArray[i].grade+" distance "+gpxArray[i].distance+" mps "+gpxArray[i].mps);
           //   
        if (distance > gpxArray[i].distance) {
           continue;
            } else {
            return i;
            }
            
          }
    return -1;
}
    

    /*
    https://code-builders.com/javascript/how-can-i-calculate-the-distance-between-two-coordinates-(latitude-and-longitude)-in-javascript/
    The formula then computes the differences in latitude and longitude (dLat anddLon), applies the Haversine formula, and calculates the great-circle distance (distance) in kilometers.

Please note that this calculation assumes a perfect spherical Earth, which is a simplification. In practice, the Earth is an oblate spheroid, so for very long distances or high precision, more complex models may be necessary. Additionally, be aware that this calculation does not account for factors like altitude, which may affect the actual distance between two points.
    // Example usage
const distance = calculateDistance(37.7749, -122.4194, 34.0522, -118.2437);
console.log(distance.toFixed(2) + ' km'); // Output: 559.03 km
    */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;

  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
function smoothMps(mps,i) {
     
        
        let smoothMps=mps;
       
         if (i >= nMps) { // average last 5 grades
                let tMps=0;
                for (let j=0; j<nMps; j++) {
                    tMps+=lastMps[j];
                  //  console.log("last mps "+j+" " +lastMps[j]);
                }
                smoothMps=tMps/ nMps;
             //console.log("tmps " + tMps + "  smooth " + smoothMps);
        }
            //for (let j=1; j<nElevations; j++) { // shift grades 1 to the right
            //    lastElevations[j]= lastElevations[j-1];
            //}
     for (let j=nMps-1; j>0; j--) { // shift right
         lastMps[j]= lastMps[j-1];
    }
            lastMps[0]=mps; // save current grade
          // console.log("mps " + mps + "  smooth " + smoothMps);
           //grade= smoothGradient;
        return smoothMps;
        
    }
function drawElevation() {
    const data = [];
    let min=10;
    let max=0;
    let distance=0;
     for(var i =0; i< gpxArray.length; i++) {
           //printGPX(i);
         //console.log("ele "+gpxArray[i].ele);
         distance=gpxArray[i].distance;
          data[i]={ x:distance/ 1609.344,y:gpxArray[i].ele*3.28084} // meters to feet
        
         if (gpxArray[i].ele>max){max=gpxArray[i].ele;}
         //if (gpxArray[i].ele<min){min=gpxArray[i].ele;}
          //console.log("ele "+gpxArray[i].ele+ " distance "+distance);
          }
    var chart = new CanvasJS.Chart("chartContainer", {
	animationEnabled: true,
	theme: "light2",
        /*
	title:{
		text: "Elevation Profile"
	},
    */
        /*
            axisY:{
         minimum: min,
         maximum: 50
     },
     */
         axisY:{    
        valueFormatString:  " ", // remove labels
       
     },
	data: [{        
		type: "line",
      	indexLabelFontSize: 16,
		dataPoints: data
	}]
});
chart.render();

}
    
function smoothElevation(ele,i) {
     
        
        let smoothEle=ele;
         if (i >= nElevations) { // average last 5 grades
                let tElevation=0;
                for (let j=0; j<nElevations; j++) {
                    tElevation+=lastElevations[j];
                   // console.log("last ele "+j+" " +lastElevations[j]);
                }
                smoothEle=tElevation/ nElevations;
             // console.log("tele " + tElevation + "  smooth " + smoothEle);
        }
            //for (let j=1; j<nElevations; j++) { // shift grades 1 to the right
            //    lastElevations[j]= lastElevations[j-1];
            //}
     for (let j=nElevations-1; j>0; j--) { // shift right
         lastElevations[j]= lastElevations[j-1];
    }
            lastElevations[0]=ele; // save current elevation
           //console.log("ele " + ele + "  smooth " + smoothEle);
           //grade= smoothGradient;
         
        return smoothEle;
        
    }
/* Least Squares 
Step 1: For each (x,y) point calculate x2 and xy

Step 2: Sum all x, y, x2 and xy, which gives us Σx, Σy, Σx2 and Σxy (Σ means "sum up")

Step 3: Calculate Slope m:

m =  (N * Σ(xy) − Σx Σy) / (N * Σ(x2) − (Σx)2)
 

(where N is the number of points)

Step 4: Calculate Intercept b:

b =  (Σy − m Σx) / N
 

Step 5: Assemble the equation of a line

y = mx + b

*/
function smoothElevationLSQ(ele,i) {
     
        
        let smoothEle=ele;
        let xsum=0;
        let ysum=0;
        let x2sum=0;
        let xysum=0;
         if (i >= nElevations) { // average last 5 grades
                let tElevation=0;
                for (let j=0; j<nElevations; j++) {
                    tElevation+=lastElevations[j];
                    let x=j+1;
                    let y=lastElevations[j]
                    xsum+=x;
                    ysum+=y;
                    xysum+=x*y;
                    x2sum+=x*x;
                }
                //smoothEle=tElevation/ nElevations;
                let m = (nElevations * xysum - xsum * ysum) / (nElevations * x2sum - xsum * 2);
                let b = (ysum - m * xsum) / nElevations;
                let x=nElevations;
                smoothEle = m * x + b;
        }
            
     for (let j=nElevations-1; j>0; j--) { // shift right
         lastElevations[j]= lastElevations[j-1];
    }
            lastElevations[0]=ele; // save current elevation
         
         
        return smoothEle;
        
    }