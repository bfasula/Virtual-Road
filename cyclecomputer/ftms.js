import {dec2bin} from './util.js';
import {appStart,totalSeconds,processPower} from './cyclecomputer.js';


let totalWatts=0
let totalWattsPts=0
let totalCad=0
let totalCadPts=0
let totalSpeed=0
let totalSpeedPts=0
let totalDistance=0

export function printWatts(event) { 
    //console.log("\n")
    const flags = event.target.value.getUint16(0,true)
     //console.log("flags " + flags+ " "+dec2bin(flags))
        let f=flags >>1
    //  console.log("flags >>1 " + f +" "+dec2bin(f) )
   //  console.log("f&1 " + f&1  )
       f=flags >>2
   //   console.log("flags >>2 " + f +" "+dec2bin(f) )
 //    console.log("f&1 " + f&1  )
       f=flags >>3
 //     console.log("flags >>3 " + f +" "+dec2bin(f) )
 //    console.log("f&1 " + f&1  )
   /*
const speedPresent               = (flags) => ((flags >>  0) & 1) === 0;
const avgSpeedPresent            = (flags) => ((flags >>  1) & 1) === 1;
const cadencePresent             = (flags) => ((flags >>  2) & 1) === 1;
const avgCadencePresent          = (flags) => ((flags >>  3) & 1) === 1;
const distancePresent            = (flags) => ((flags >>  4) & 1) === 1;
const resistancePresent          = (flags) => ((flags >>  5) & 1) === 1;
const powerPresent               = (flags) => ((flags >>  6) & 1) === 1;
const avgPowerPresent            = (flags) => ((flags >>  7) & 1) === 1;
const expandedEnergyPresent      = (flags) => ((flags >>  8) & 1) === 1;
const heartRatePresent           = (flags) => ((flags >>  9) & 1) === 1;
const metabolicEquivalentPresent = (flags) => ((flags >> 10) & 1) === 1;
const elapsedTimePresent         = (flags) => ((flags >> 11) & 1) === 1;
const remainingTimePresent       = (flags) => ((flags >> 12) & 1) === 1;
         */
    /*
const speedPresent               = ((flags >>  0) & 1) === 0;
const avgSpeedPresent            = ((flags >>  16-1) & 1) > 0
const cadencePresent             = ((flags >>  16-2) & 1) > 0
const avgCadencePresent          = ((flags >>  16-3) & 1) > 0
const distancePresent            = ((flags >>  16-4) & 1) > 0
const resistancePresent          = ((flags >>  16-5) & 1) > 0
const powerPresent               = ((flags >>  16-6) & 1) > 0
const avgPowerPresent            = ((flags >>  16-7) & 1) > 0
const expandedEnergyPresent      = ((flags >>  16-8) & 1) > 0
const heartRatePresent           = ((flags >>  16-9) & 1) > 0
const metabolicEquivalentPresent = ((flags >> 16-10) & 1) > 0
const elapsedTimePresent         = ((flags >> 16-11) & 1) > 0
const remainingTimePresent       =  ((flags >> 16-12) & 1) > 0
*/
   
const speedPresent               = ((flags >>  0) & 1) === 0;
const avgSpeedPresent            = ((flags >>  1) & 1) > 0
const cadencePresent             = ((flags >>  2) & 1) > 0
const avgCadencePresent          = ((flags >>  3) & 1) > 0
const distancePresent            = ((flags >>  4) & 1) > 0
const resistancePresent          = ((flags >>  5) & 1) > 0
const powerPresent               = ((flags >>  6) & 1) > 0
const avgPowerPresent            = ((flags >>  7) & 1) > 0
const expandedEnergyPresent      = ((flags >>  8) & 1) > 0
const heartRatePresent           = ((flags >>  9) & 1) > 0
const metabolicEquivalentPresent = ((flags >> 10) & 1) > 0
const elapsedTimePresent         = ((flags >> 11) & 1) > 0
const remainingTimePresent       =  ((flags >> 12) & 1) > 0
   // console.log("flags " + flags+ " "+dec2bin(flags))
                                    
    /*
        const fields = {
    Flags:                 {resolution: 1,    unit: 'bit',      size: 2, type: 'Uint16', present: (_ => true),                                   },
    InstantaneousSpeed:    {resolution: 0.01, unit: 'kph',      size: 2, type: 'Uint16', present: speedPresent,               short: 'speed',    },
    AverageSpeed:          {resolution: 0.01, unit: 'kph',      size: 2, type: 'Uint16', present: avgSpeedPresent,                               },
    InstantaneousCadence:  {resolution: 0.5,  unit: 'rpm',      size: 2, type: 'Uint16', present: cadencePresent,             short: 'cadence',  },
    AverageCadence:        {resolution: 0.5,  unit: 'rpm',      size: 2, type: 'Uint16', present: avgCadencePresent,                             },
    TotalDistance:         {resolution: 1,    unit: 'm',        size: 3, type: 'Uint24', present: distancePresent,            short: 'distance'  },
    ResistanceLevel:       {resolution: 1,    unit: 'unitless', size: 2, type: 'Uint16', present: resistancePresent,                             },
    InstantaneousPower:    {resolution: 1,    unit: 'W',        size: 2, type: 'Uint16', present: powerPresent,               short: 'power',    },
    AveragePower:          {resolution: 1,    unit: 'W',        size: 2, type: 'Uint16', present: avgPowerPresent,                               },
    TotalEnergy:           {resolution: 1,    unit: 'kcal',     size: 2, type: 'Int16',  present: expandedEnergyPresent,                         },
    EnergyPerHour:         {resolution: 1,    unit: 'kcal',     size: 2, type: 'Int16',  present: expandedEnergyPresent,                         },
    EnergyPerMinute:       {resolution: 1,    unit: 'kcal',     size: 1, type: 'Uint8',  present: expandedEnergyPresent,                         },
    HeartRate:             {resolution: 1,    unit: 'bpm',      size: 1, type: 'Uint8',  present: heartRatePresent,           short: 'heartRate',},
    MetabolicEquivalent:   {resolution: 1,    unit: 'me',       size: 1, type: 'Uint8',  present: metabolicEquivalentPresent,                    },
    ElapsedTime:           {resolution: 1,    unit: 's',        size: 2, type: 'Uint16', present: elapsedTimePresent,                            },
    RemainingTime:         {resolution: 1,    unit: 's',        size: 2, type: 'Uint16', present: remainingTimePresent,    
     data[0]=x40  data[1]=x8 lso mso so  x8 x40 = 00001000 01000000 bit order 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
            ////so x8 = bit 11 - elapsed time
               x40 = bit 6 - instantaneous power
               x1  = bik 1 - cadence
            data[0] = (byte) Integer.parseInt("01000100", 2); // // speed cadence and power
            data[1] = (byte) Integer.parseInt("00000000", 2);
            data[2] = (byte) (kph & 0xFF);
            data[3] = (byte) ((kph >> 8) & 0xFF);
            data[4] = (byte) (rpm * 2 & 0xFF);
            data[5] = (byte) ((rpm * 2 >> 8) & 0xFF); // cadence
            data[6] = (byte) ((watts) & 0xFF);
            data[7] = (byte) ((watts >> 8) & 0xFF);  //power
            flags 17408 01000100 00000000
             bits 68 01000100
};
                                    */
      const bits1 = event.target.value.getUint8(0)
     const bits2 = event.target.value.getUint8(1)
      //console.log("bits " + bits1 + " "+dec2bin(bits1))
      //console.log("bits " + bits2 + " "+dec2bin(bits2))
 
          
      
    let i=2
    const s = event.target.value.getUint16(i,true) // (1)
      //console.log("i "+i+"InstantaneousSpeed " + s + " " + s  + " "+dec2bin(s))
    
      //let speed= s / 100.0 * .621371192; // mph
      //let speed= s * .621371192;
      //console.log("InstantaneousSpeed " + s + " " + speed)
    /*
     document.getElementById('speed').innerHTML = speed.toFixed(1)
       if (appStart) {
                totalSpeed += speed
                totalSpeedPts++
                document.getElementById('avespeed').innerHTML = (totalSpeed/totalSpeedPts).toFixed(1)
                totalDistance=(totalSpeed/totalSpeedPts)*(totalSeconds/3600)
                document.getElementById('distance').innerHTML = totalDistance.toFixed(2)
                }
                */
     i += 2;
   
       if (avgSpeedPresent ) {
        //console.log("avgSpeedPresent")
         //console.log("flags " + flags+ " "+dec2bin(flags))
             i += 2;
    } 
    if (cadencePresent) {
       // console.log("cadencePresent")
        
          const cadence = event.target.value.getUint16(i,true)/2 //(3)
           //console.log("i "+i+ " 64 Cadence "+ cadence  + " "+dec2bin(cadence));
         document.getElementById('rpm').innerHTML = cadence
         if (appStart) {
                totalCad += cadence
                totalCadPts++
                document.getElementById('averpm').innerHTML = (totalCad/totalCadPts).toFixed(0)
                }
          i += 2;
    } 
    if (avgCadencePresent ) {
        //console.log("avgCadencePresent")
     //console.log("flags " + flags+ " "+dec2bin(flags))
          i += 2;
    } 
    if (distancePresent ) {
        //console.log("distancePresent")
         //console.log("flags " + flags+ " "+dec2bin(flags))
          i += 2;
    } 
        if (resistancePresent ) {
        //console.log("resistancePresent")
             //console.log("flags " + flags+ " "+dec2bin(flags))
              i += 2;
    } 
            if (powerPresent ) {
        //console.log("powerPresent")
               
                   const power = event.target.value.getUint16(i,true) // i=5 power (5)
                processPower(power);
                /*
        console.log("i "+i+ "bit4 Power " + power  + " "+dec2bin(power))
           document.getElementById('watts').innerHTML = power
            if (appStart) {
                totalWatts += power
                totalWattsPts++
                let aWatts = (totalWatts/totalWattsPts)
                document.getElementById('avewatts').innerHTML = aWatts.toFixed(0) 
                let pcalories = ((aWatts * totalSeconds) / 4.18) / 0.24 / 1000.0;
                document.getElementById('pcal').innerHTML = pcalories.toFixed(0)
                }
                */
                  i += 2;
    } 
                if (avgPowerPresent ) {
       // console.log("avgPowerPresent")
                   // console.log("flags " + flags+ " "+dec2bin(flags))
                      i += 2;
    } 
                    if (expandedEnergyPresent ) {
        //console.log("expandedEnergyPresent")
                       // console.log("flags " + flags+ " "+dec2bin(flags))
                          i += 2;
    } 
                        if (heartRatePresent ) {
       // console.log("heartRatePresent")
                       //     console.log("flags " + flags+ " "+dec2bin(flags))
                              i += 2;
    } 
                            if (metabolicEquivalentPresent ) {
        //console.log("metabolicEquivalentPresent")
                          //      console.log("flags " + flags+ " "+dec2bin(flags))
                                  i += 2;
    } 
                                if (elapsedTimePresent ) {
        //console.log("elapsedTimePresent")
                                    //console.log("flags " + flags+ " "+dec2bin(flags))
                                      i += 2;
    } 
                                if (remainingTimePresent ) {
      //  console.log("remainingTimePresent")
                                //    console.log("flags " + flags+ " "+dec2bin(flags))
                                      i += 2;
                                    
    } 
    

    
}