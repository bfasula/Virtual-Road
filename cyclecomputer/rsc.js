import {appStart,totalSeconds,addGPSPoint,startTimer} from './cyclecomputer.js';
import {gpxArray,findGPX,printGPX,GPXPoint} from './parsegpx.js';
import {playVideo,pauseVideo,changeVideoSpeed,seekVideo,syncsGreater, syncsLess} from './playvideo.js';
var totalSpeed=0;
var totalSpeedValues=0;
var totalRPM=0;
var totalRPMValues=0;
var totalStride=0;
var totalStrideValues=0;
var initDistance=-1;
var gpsArray;
let gpsIndex=0;
let syncSeconds=5;
let grade=0;
let elevation=0;
let mph=0;
let appPaused=0;
let lapCounter=0;
let initialDistance=0;
export function printRSC(event) {


   
   if (gpsArray === undefined) {
      gpsArray = Array((gpxArray.length)*10);
        console.log("gpxArray length "+gpxArray.length);
        initialDistance = Number(document.getElementById('initialdistance').value)
        console.log("initialDistance " + document.getElementById('initialdistance').value);
         console.log("totalDistance "+ totalDistance + " laps "+lapCounter + " course dist " +gpxArray[gpxArray.length - 1].distance);
        if (initialDistance > 0) {
            let i = findGPX(initialDistance * 1609.344);
            let gpxSeconds = gpxArray[i].seconds - gpxArray[0].seconds;
            seekVideo(gpxSeconds, syncSeconds);
        }
      }
      
      let i=0;
        const bits1 = event.target.value.getUint8(i++,true)
        i=1;
        let s  = event.target.value.getUint16(i,true)
        let speed =  s / 256 * 2.236936;  // mph
        //cscdata.speed *= cscdata.runCalibrationFactor;

        console.log( "RCS Speed " + speed);
        
        i+=2;
      
        let rpm = event.target.value.getUint8(i,true)
        //txtRPM.setText(String.format(Locale.US, "%d", cscdata.rpm));
        console.log( "RCS cadence " + rpm);
       
        if (appStart ) {
            totalRPM+=rpm;
            totalRPMValues++;
            let arpm = totalRPM / totalRPMValues;
            console.log( "RCS ave cadence " + arpm);
            //txtARPM.setText(String.format(Locale.US,"%.1f",cscdata.arpm));
        }
        i+=1;
    
         let   stride = (event.target.value.getUint16(i,true)/2.54)/2.0; // inches
          //  cscdata.stride *= cscdata.runCalibrationFactor;

            //txtRPM.setText(String.format(Locale.US, "%d", cscdata.rpm));
            console.log("rcs stride " + stride);
                if (appStart ) {
                    totalStride+=stride;
                    totalStrideValues++;
                    let aStride = totalStride / totalStrideValues;
                    console.log("RCS ave stride " +aStride);
                    //txtARPM.setText(String.format(Locale.US,"%.1f",cscdata.arpm));
                }

            i+=2;
    

            let distance = (event.target.value.getUint32(i,true)/10.0)/1609.344;
            //cscdata.distance *= cscdata.runCalibrationFactor;
                if (initDistance < 0.0) {
                    initDistance = distance;
                }
            distance-=initDistance; // runpod doesn't start with zero
   
            //txtRPM.setText(String.format(Locale.US, "%d", cscdata.rpm));
            console.log( " rcs distance " + distance);
            document.getElementById('distance').innerHTML = distance.toFixed(2);
            let distancem = (distance * 1609.344 - (lapCounter * gpxArray[gpxArray.length - 1].distance)) ; // miles to meters
             let index=findGPX(distancem);
             console.log("distancem "+distance*1609.344+" index= "+index);
            if (index < gpxArray.length-1  && index >= 0) {
                        
                         grade=gpxArray[index+1].smoothGrade;
                 document.getElementById('grade').innerHTML = (grade*100.0).toFixed(2);
               
            if ((grade*100.0)> 0.0) {
                speed = speed - 0.20 * grade;
            } 
            if ((grade*100.0) < 0.0) {
                speed = speed - 0.10 * grade;
            } 
       
          
                    } else {
                       if (initialDistance > 0) {
                    console.log("route ended");
                    //stopTime();
                           startTimer();
                    appStart = false;
                    //window.alert("Route ended");
                    return;
                } else {
                    lapCounter++;
                      //window.alert("lap ended");
                    console.log("lap " + lapCounter);
                    // let distancem=(totalDistance+initialDistance-(lapCounter * gpxArray[gpxArray.length-1].distance)*1609.344; // miles to meters
                    //i=findGPX(distancem);
                    //let gpxSeconds = gpxArray[0].seconds - gpxArray[0].seconds;
                    seekVideo(0, syncSeconds);
                    i=0;
                    return;
                }
                        }
                    if (index < gpxArray.length-1 && index >= 0) {
                    elevation=gpxArray[index].ele;
                    mph=gpxArray[index].mps*2.237;
                        const currentDate = new Date();
                       const gpsTime = currentDate.toISOString();//"2011-10-05T14:48:00.000Z"
                     
                       
                         let p1 = new GPXPoint(gpxArray[index].lat, gpxArray[index].lon,gpxArray[index].ele,
gpxArray[index].smoothEle, gpxArray[index].secs, gpxArray[index].grade,gpxArray[index].smoothGrade,
 gpxArray[index].totaldistancem, gpxArray[index].mps,gpsTime, 0,0);
                        console.log("index " +index +" Lat "+p1.lat);

                       // gpsArray[gpsIndex++]=p1;
                        addGPSPoint(gpxArray.length*10,gpxArray[index].lat, gpxArray[index].lon,gpxArray[index].ele,
 gpxArray[index].secs, gpxArray[index].grade,
 gpxArray[index].totaldistancem, gpxArray[index].mps, gpsTime);
                         //console.log("Lat "+p1.lat + " " + gpsArray[gpsIndex-1].lat);
                     
                    } 
           
        document.getElementById('speed').innerHTML = speed.toFixed(1);
     if (speed >= 1.0) {
            if (appPaused == 1 ) { 
                appPaused=0;
                 startTimer();
                 console.log("Starting");
                }
        } else  {// < 1
            if (appPaused == 1) {
                } else {
            appPaused=1;
            startTimer();
            console.log("Pausing");
            }
            }
        if (appStart ) {
             let gpxSeconds=gpxArray[index].seconds-gpxArray[0].seconds;           
                seekVideo(gpxSeconds,syncSeconds);
                let ratio = speed/15.0;
                
                if (mph > 0) {
                     ratio = (speed/mph);
                }
                console.log("i " + index+"velocity (mph)" + speed + " mph " + mph + " ratio " + ratio
                           +"secs " + totalSeconds + " gpx secs " + gpxSeconds);
                changeVideoSpeed(ratio,totalSeconds)
           totalSpeed+=speed;
           totalSpeedValues++;
           let aspeed = totalSpeed / totalSpeedValues;
            //txtASpeed.setText(String.format(Locale.US,"%.1f",cscdata.aspeed));
            console.log("RCS ASpeed " + aspeed);
             document.getElementById('avespeed').innerHTML = aspeed.toFixed(1);
        }
            i+=4;
            //let walk= event.target.value.getUint16(i,true);
           // console.log( " walk/run " + walk);
    }
        
/*
void processRCSData(BluetoothGattCharacteristic characteristic) {
        try {
        String TAG="processRCSData";
      
   // 0 flags x03
    //1 speed 2 bytes   alway
   // 3 cadence 1 byte always
   // 4 stride 2 bytes   bit 1
   // 6 distance 4 bytes  bit 2
  //   (running if bit 3 else walking)
       
        // int flag = characteristic.getProperties();
            log(5,TAG, "runCalibrationfactor " +cscdata.runCalibrationFactor);
        final byte[] data = characteristic.getValue();
        log(5,TAG, "data.length: " + data.length);
        log(5,TAG, "data: " + data[0]);
        if (data != null && data.length > 0) {
            final StringBuilder stringBuilder = new StringBuilder(data.length);
            for (byte byteChar : data) {
                stringBuilder.append(String.format("%02X ", byteChar));
                //log(TAG, String.format("%02X ", byteChar));
            }
            log(5,TAG, "CSC Extra data " + stringBuilder.toString());
        }

        int format = -1;
        int i=1;

        //Date currentTime = Calendar.getInstance().getTime();
        //double currentTimeInSeconds = currentTime.getSeconds();
        ////////////////double currentTimeInSeconds = ((double) System.currentTimeMillis()) / 1000.0;

        //if ((data[0] & 0x01) == 0) {
        format = BluetoothGattCharacteristic.FORMAT_UINT16;

        int s = characteristic.getIntValue(format, i);
        cscdata.speed = (double) s / 256 * 2.236936;  // mph
        cscdata.speed *= cscdata.runCalibrationFactor;

        log(5,TAG, "RCS Speed " + cscdata.speed);
        if (bStart && !bAutoPause) {
            cscdata.totalSpeed+=cscdata.speed;
            cscdata.totalSpeedValues++;
            cscdata.aspeed = cscdata.totalSpeed / (double) cscdata.totalSpeedValues;
            //txtASpeed.setText(String.format(Locale.US,"%.1f",cscdata.aspeed));
            log(5,TAG, "RCS ASpeed " + cscdata.aspeed);
        }
        i+=2;
        format = BluetoothGattCharacteristic.FORMAT_UINT8;
        cscdata.rpm = (double) ((characteristic.getIntValue(format, i))*2);
        //txtRPM.setText(String.format(Locale.US, "%d", cscdata.rpm));
        log(5,TAG, "RCS cadence " + cscdata.rpm);
      
        if (bStart && !bAutoPause) {
            cscdata.totalRPM+=cscdata.rpm;
            cscdata.totalRPMValues++;
            cscdata.arpm = cscdata.totalRPM / (double) cscdata.totalRPMValues;
            log(5,TAG, "RCS ave cadence " + cscdata.arpm);
            //txtARPM.setText(String.format(Locale.US,"%.1f",cscdata.arpm));
        }
        
        //}
        //if ((data[0] & 2) > 0) { // bit 1  Stride
            if ((data[0] & 1) > 0) { // bit 1  Stride


            format = BluetoothGattCharacteristic.FORMAT_UINT16;
            cscdata.stride =  ((double) characteristic.getIntValue(format, i)/2.54)/2.0; // inches
            cscdata.stride *= cscdata.runCalibrationFactor;

            //txtRPM.setText(String.format(Locale.US, "%d", cscdata.rpm));
            log(5,TAG, "rcs stride " + cscdata.stride);
                if (bStart && !bAutoPause) {
                    cscdata.totalStride+=cscdata.stride;
                    cscdata.totalStrideValues++;
                    cscdata.aStride = cscdata.totalStride / (double) cscdata.totalStrideValues;
                    log(5,TAG, "RCS ave stride " + cscdata.aStride);
                    //txtARPM.setText(String.format(Locale.US,"%.1f",cscdata.arpm));
                }

            i+=2;
        }
        //if ((data[0] & 4) > 0) {  //bit 2 distance
            if ((data[0] & 2) > 0) {  //bit 2 distance

            format = BluetoothGattCharacteristic.FORMAT_UINT32;

            cscdata.distance = ((double) (characteristic.getIntValue(format, i))/10.0)/1609.344;
            cscdata.distance *= cscdata.runCalibrationFactor;
                if (initDistance < 0.0) {
                    initDistance = cscdata.distance;
                }
                cscdata.distance-=initDistance; // runpod doesn't start with zero
            //txtRPM.setText(String.format(Locale.US, "%d", cscdata.rpm));
            log(5,TAG, " rcs distance " + cscdata.distance);
            long dist=(characteristic.getIntValue(format, i));
            log(5,TAG, " rcs distance " + dist);
            i+=4;
        }
//cscdata.totalWheelTimeInSeconds

             double currentTimeInSeconds = ((double) System.currentTimeMillis()) / 1000.0;
            log(TAG, "Time " + Constants.secondsToTimeString((int) currentTimeInSeconds) + " Dist " + cscdata.distance);
            if (bStart && !bAutoPause) {
                if (cscdata.lastWheelTimeInSeconds > 0.0) {
                    cscdata.totalWheelTimeInSeconds += (currentTimeInSeconds - cscdata.lastWheelTimeInSeconds);
                }
            }
            cscdata.lastWheelTimeInSeconds = currentTimeInSeconds;

        } catch (Exception e) {
            log("processRCSDataERROR",e);
        }

    }
*/