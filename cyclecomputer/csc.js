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
 let i=0;
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
            
            if(duration > 0) {
                rpm = (revs / duration) * 60;
            }

            lastCrankRevolutions = crankRevolutions;
            lastCrankTime = crankTime;

            //this.dispatch('cadence', rpm);
            console.log("rpm "+rpm)
           processRPM(rpm);
        }
}
function wheelData(hasWheelData) {
        if (hasWheelData) {
          modifyTrainerConnected(true);
           // console.log("\nhasWheelData");
                //long newTotalWheelRevolutions =0;
            
                //long wheelTime = 0;

                //format = BluetoothGattCharacteristic.FORMAT_UINT32;
                //newTotalWheelRevolutions = characteristic.getIntValue(format, i);
                const wheelRevolutions = event.target.value.getUint32(i,true)
            //console.log("wheelRevolutions "+wheelRevolutions);
                i+=4;
                //format = BluetoothGattCharacteristic.FORMAT_UINT16;
                //wheelTime = characteristic.getIntValue(format, i);
                const wheelTime  = event.target.value.getUint16(i,true)
             //console.log("wheelTime "+wheelTime + " lastWheelTime "+lastWheelTime);
                i+=2;
            // Circumference = 2 * pi * radius, or just pi * diameter
                // However, our wheel diameter is in mm, whereas we want distance in m
                if (lastWheelTime == wheelTime) {
                   // console.log("Dup wheel record");
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
             //   console.log("netWheelTime "+netWheelTime);
                        let netdistance =0.0; // miles

                        netdistance = ((wheelRevolutions - lastWheelRevolutions)
                                * wheelSize /25.4/12.0)/5280.0;
                        // current speed mph
                        if (Math.abs(netWheelTime) > 0) {
                            let speed = netdistance / (Math.abs(netWheelTime)/3600.0);
                            //txtSpeed.setText(String.format(Locale.US,"%.1f",cscdata.speed));
                            //if (!MainActivity.powerConnected) {
                               // console.log("speed mph "+speed);
                                let watts = computeWatts(speed);
                              //  console.log("watts "+watts);
                                processPower(Number(watts));
                                //powerZone = cscdata.computePowerZone(cscdata.watts);
                                //npCalculator.addValue( cscdata.watts);
                            //}
                          //  console.log("speed " + speed + " watts " + watts);
                            //txtWatts.setText(String.format("%.0f",cscdata.watts)+"/"+cscdata.powerZone);
                          //  console.log("netdist " + netdistance + " netwheeltime " + netWheelTime);
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
        
