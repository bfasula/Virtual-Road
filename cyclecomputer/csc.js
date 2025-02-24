import {processRPM,processPower} from './cyclecomputer.js';

let lastCrankTime=0;
let lastCrankRevolutions = 0;
let rpm = 0;

export function printCSC(event) {
   
      let i=0;
        const bits1 = event.target.value.getUint8(i++,true)
        
        let hasWheelData = (bits1 & 0x01) > 0;
        let hasCrankData = (bits1 & 0x02) > 0;
     /*
      if (hasWheelData) {
                long newTotalWheelRevolutions =0;
            
                long wheelTime = 0;

                //format = BluetoothGattCharacteristic.FORMAT_UINT32;
                //newTotalWheelRevolutions = characteristic.getIntValue(format, i);
                const wheelRevolutions = event.target.value.getUint32(i)
                i+=4;
                //format = BluetoothGattCharacteristic.FORMAT_UINT16;
                //wheelTime = characteristic.getIntValue(format, i);
                const wheelTime = = event.target.value.getUint16(i)
                i+=2;
          }
            if (hasCrankData) {

                //format = BluetoothGattCharacteristic.FORMAT_UINT16;
                //newTotalCrankRevolutions = characteristic.getIntValue(format, i);
                  const crankRevolutions  = event.target.value.getUint16(i)
                i+=2;
                //crankTime = characteristic.getIntValue(format, i);
                   const crankTime = = event.target.value.getUint16(i)
            }
   
        let data = this.parser.getData(event.target.value);
        let crankRevolutions = data['cumulative_crank_revolutions'];
        let crankTime = data['last_crank_event_time'];
        let wheelRevolutions = data['cumulative_wheel_revolutions'];
        let wheelTime = data['last_wheel_event_time'];
*/
       if (hasCrankData) {

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

        if (hasWheelData) {
                //long newTotalWheelRevolutions =0;
            
                //long wheelTime = 0;

                //format = BluetoothGattCharacteristic.FORMAT_UINT32;
                //newTotalWheelRevolutions = characteristic.getIntValue(format, i);
                const wheelRevolutions = event.target.value.getUint32(i,true)
                i+=4;
                //format = BluetoothGattCharacteristic.FORMAT_UINT16;
                //wheelTime = characteristic.getIntValue(format, i);
                const wheelTime  = event.target.value.getUint16(i,true)
                i+=2;
            // Circumference = 2 * pi * radius, or just pi * diameter
                // However, our wheel diameter is in mm, whereas we want distance in m
                if (lastWheelTime == wheelTime) {
                    console.log("Dup wheel record");
                }
            if(lastWheelTime > wheelTime) {
                lastWheelTime = lastWheelTime - 65536;
            }
            if(lastWheelRevolutions > wheelRevolutions) {
                lastWheelRevolutions = lastWheelRevolutions - 65536;
            }
            let netWheelTime=0.0;
            let wheelTimeInSeconds =  wheelTime / 1024.0;
            if (wheelTime != 0 && lastWheelTime > 0
                            && lastWheelRevolutions > 0)  {
                        //wheelTimeInSeconds = (double) wheelTime / 1024.0;
                        if (wheelTimeInSeconds > lastWheelTime) {
                            netWheelTime = wheelTimeInSeconds - lastWheelTime;
                        } else {
                            netWheelTime = (64 - lastWheelTime) +  wheelTimeInSeconds;
                        }
                        let netdistance =0.0; // miles

                        netdistance = ((newTotalWheelRevolutions - lastWheelRevolutions)
                                * wheelSize /25.4/12.0)/5280.0;
                        // current speed mph
                        if (Math.abs(netWheelTime) > 0) {
                            speed = netdistance / (Math.abs(netWheelTime)/3600.0);
                            //txtSpeed.setText(String.format(Locale.US,"%.1f",cscdata.speed));
                            if (!MainActivity.powerConnected) {
                                watts = computeWatts(speed);
                                processPower(watts);
                                //powerZone = cscdata.computePowerZone(cscdata.watts);
                                //npCalculator.addValue( cscdata.watts);
                            }
                            //txtData.setText("speed " + cscdata.speed + " watts " + cscdata.watts);
                            //txtWatts.setText(String.format("%.0f",cscdata.watts)+"/"+cscdata.powerZone);
                            console.log("netdist " + netdistance + " netwheeltime " + netWheelTime);
                        }
                    if (appStart ) {
                            totalWheelRevolutions += (newTotalWheelRevolutions - lastWheelRevolutions);
                         
                            if (cscdata.lastWheelTimeInSeconds > 0.0) {                       
                                cscdata.aspeed = (cscdata.distance / (cscdata.totalWheelTimeInSeconds / 3600.00)) ;
                            }

                            // total distance miles
                            distance =(totalWheelRevolutions
                                    * cscdata.wheelSize /25.4/12.0)/5280.0;     
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
                lastWheelRevolutions= newTotalWheelRevolutions;
                lastWheelTime = wheelTimeInSeconds;
                lWheelTime = wheelTime;
                lastDistance = distance;
            //this.dispatch('wheelrpm', wheelRpm
            // calculate speed
            //  processPower(power);
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
        
        console.log("Speed "+mph +"  ,Watts "+P);
        return P;
          } catch (err) {
        console.error('error occured: ', err.message)
         }
    }
        
}