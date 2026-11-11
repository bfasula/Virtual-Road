import {processRPM,processPower, modifyTrainerConnected, modifyCadenceConnected} from './cyclecomputer.js';

let lastCrankTime=0;
let lastCrankRevolutions = 0;
let rpm = 0;
let lastWheelTime=0;
let lastWheelTimeInSeconds=0;
let lastWheelRevolutions = 0;
let wheelSize = 2096.0;
let lWheelTime = 0;
let lastDistance = 0;

let lastCrankAtMs = null;
let lastCrankIntervalMs = 0;

 let i=0;
/*
To detect stopping later, increase the 2.5 multiplier. For example, change it to 3.5:
That waits longer after the last crank event before setting rpm to zero. The 2500 is a minimum timeout; raise that too if you want a longer delay even at faster cadences.
*/
setInterval(() => {
  if (lastCrankAtMs === null) return;

  const timeoutMs = Math.max(2500, lastCrankIntervalMs * 2.5);

  if (Date.now() - lastCrankAtMs > timeoutMs) {
    rpm = 0;
    console.log("rpm 0");
      processRPM(rpm);
  }
}, 250);

export function printCSC(event) {
   
       i=0;
        const bits1 = event.target.value.getUint8(i++,true)
        
        let hasWheelData = (bits1 & 0x01) > 0;
        let hasCrankData = (bits1 & 0x02) > 0;
    wheelData(hasWheelData);
     
       if (hasCrankData) {
    modifyCadenceConnected(true);
                //format = BluetoothGattCharacteristic.FORMAT_UINT16;
                //newTotalCrankRevolutions = characteristic.getIntValue(format, i);
                  const crankRevolutions  = event.target.value.getUint16(i,true)
                i+=2;
                //crankTime = characteristic.getIntValue(format, i);
                   const crankTime  = event.target.value.getUint16(i,true)
            if(lastCrankTime > crankTime) {
                lastCrankTime = lastCrankTime - 65536;
            }
            if(lastCrankRevolutions > crankRevolutions) {
                lastCrankRevolutions = lastCrankRevolutions - 65536;
            }

            let revs = crankRevolutions - lastCrankRevolutions;
            let duration = (crankTime - lastCrankTime) / 1024;
            /*
            if(duration > 0) {
                rpm = (revs / duration) * 60;
            }
            */
           if (revs > 0 && duration > 0) {
            rpm = (revs / duration) * 60;
            lastCrankIntervalMs = (duration / revs) * 1000;
            lastCrankAtMs = Date.now();
            }

            lastCrankRevolutions = crankRevolutions;
            lastCrankTime = crankTime;

            //console.log("rpm "+rpm)
           processRPM(rpm);
        }
}
function wheelData(hasWheelData) {
        if (hasWheelData) {
          modifyTrainerConnected(true);
           
                const wheelRevolutions = event.target.value.getUint32(i,true)
           
                i+=4;
                
                const wheelTime  = event.target.value.getUint16(i,true)
            
                i+=2;
            // Circumference = 2 * pi * radius, or just pi * diameter
                // However, our wheel diameter is in mm, whereas we want distance in m
                if (lastWheelTime == wheelTime) {
                 
                    return;
                }
            if(lastWheelTime > wheelTime) {
                lastWheelTime = lastWheelTime - 65536;
            }
            if(lastWheelRevolutions > wheelRevolutions) {
                lastWheelRevolutions = lastWheelRevolutions - 65536;
            }
            let netWheelTime=0.0;
            let wheelTimeInSeconds =  wheelTime / 1024.0;
           // console.log("wheelTimeInSeconds "+wheelTimeInSeconds + " lastWheelTimeInSeconds " + lastWheelTimeInSeconds);
            if (wheelTime != 0 && lastWheelTime > 0
                            && lastWheelRevolutions > 0)  {
                        //wheelTimeInSeconds = (double) wheelTime / 1024.0;
                        if (wheelTimeInSeconds > lastWheelTimeInSeconds) {
                            netWheelTime = wheelTimeInSeconds - lastWheelTimeInSeconds;
                        } else {
                            netWheelTime = (64 - lastWheelTimeInSeconds) +  wheelTimeInSeconds;
                        }
             
                        let netdistance =0.0; // miles

                        netdistance = ((wheelRevolutions - lastWheelRevolutions)
                                * wheelSize /25.4/12.0)/5280.0;
                        // current speed mph
                        if (Math.abs(netWheelTime) > 0) {
                            let speed = netdistance / (Math.abs(netWheelTime)/3600.0);
                            
                                let watts = computeWatts(speed);
                              
                                processPower(Number(watts));
                                
                        }
               
            }
            
            let wheelRevs = wheelRevolutions - lastWheelRevolutions;
            let wheelDuration = (wheelTime - lastWheelTime) / 1024;
            let wheelRpm = 0;
            if(wheelDuration > 0) {
                wheelRpm = (wheelRevs / wheelDuration) * 60;
            }
    
            lastWheelRevolutions = wheelRevolutions;
            lastWheelTime = wheelTime;
                lastWheelRevolutions= wheelRevolutions;
                lastWheelTimeInSeconds = wheelTimeInSeconds;
                //lWheelTime = wheelTime;
                lastDistance = distance;
            //this.dispatch('wheelrpm', wheelRpm
            // calculate speed
            //  processPower(power);
        }
}
    function computeWatts(mph) {
        try {
        /*
        Kinetic Cyclone P = (6.481090) * S + (0.020106) * S3     Wind
         Kinetic Road Machine: P = (5.244820) * S + (0.01968) * S3 Fluid
         */
        
           let P = 0.0;
           /// P = (6.481090 * mph) + (0.020106 * (mph*mph*mph)); /////////wind trainer
            P = (5.244820 * mph) + (.019168 * (mph*mph*mph)); // formula from kinetic
        
        //console.log("Speed "+mph +"  ,Watts "+P);
        return P.toFixed(0);
          } catch (err) {
        console.error('error occured: ', err.message)
         }
    }
        
