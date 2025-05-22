
export class TrainerCommands {
    constructor(treadmillControl) {
        this.treadmillControl = treadmillControl;
    }

    async requestControl() {
        const data = new Uint8Array([0]);
        await this.treadmillControl.sendCommand(data);
    }

    async start() {
        const data = new Uint8Array([7]);
        await this.treadmillControl.sendCommand(data);
    }

    async stop() {
        const data = new Uint8Array([8, 1]);
        await this.treadmillControl.sendCommand(data);
    }

    async setSpeed(value) {
        const buffer = new ArrayBuffer(3); // 1 Byte für uint8 + 2 Bytes für uint16
        const view = new DataView(buffer);

       
        const uint8Value = 2; 
        const uint16Value = value * 100; 
        view.setUint8(0, uint8Value);
        view.setUint16(1, uint16Value, true); // true für Little Endian
        await this.treadmillControl.sendCommand(buffer);
    }

    async getSupportedSpeedRange() {
        try {
            const value = await supportedSpeedRangeCharacteristic.readValue();

            return {
                min: value.getUint16(0, true) / 100,
                max: value.getUint16(2, true) / 100,
                minIncrement: value.getUint16(4, true) / 100
            };

        } catch (error) {
            console.error('TrainerCommands:Error reading supported speed range', error);
        }
    }

    async getSupportedInclinationRange() {
        try {
            const value = await supportedInclinationRangeCharacteristic.readValue();

            return {
                min: value.getUint16(0, true) / 100,
                max: value.getUint16(2, true) / 100,
                minIncrement: value.getUint16(4, true) / 100
            };
        } catch (error) {
            console.error('TrainerCommands:Error reading supported gradient range', error);
        }
    }
    
async  sendSimulation(gradient, windSpeed, coefficientRR, coefficientWR) {
    //console.log("TrainerCommands:sendSimulation grade="+ gradient);
    /*
    if (!this.treadmillControl.smartTrainerConnected) {
        alert("Connect a trainer or power meter")
        return
    }
    */
    const opCode = 0x11;
    const length = 7;
    /*
   
        const windSpeed      = spec.encodeField('windSpeed', args.windSpeed);
        const grade          = spec.encodeField('grade', args.grade);
        const crr            = spec.encodeField('crr', args.crr);
        const windResistance = spec.encodeField('windResistance', args.windResistance);
           // 2 m/s -> 7.20 km/h, 4 -> 14.4, 6 -> 21.6, 8 -> 28.8, 10 -> 36
    const definitions = {
        windSpeed:      {resolution: 0.001,  unit: 'mps',  size: 2, min: -35.56, max: 35.56,  default: 0.1}, // 2,
        grade:          {resolution: 0.01,   unit: '%',    size: 2, min: -40,    max: 40,     default: 0},
        crr:            {resolution: 0.0001, unit: '',     size: 1, min: 0,      max: 0.0254, default: 0.004},
        windResistance: {resolution: 0.01,   unit: 'kg/m', size: 1, min: 0,      max: 1.86,   default: 0.51},
    };
 */



    //let windSpeed = 0
    //let gradient=0
    //let coefficientRR = 0.005
    //let coefficientWR = 0.50
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    view.setUint8(0, opCode);

    view.setInt16(1, (windSpeed * 1000.0), true);
    view.setInt16(3, (gradient * 100.0), true);
    view.setUint8(5, (coefficientRR * 10000.0), true)
    view.setUint8(6, (coefficientWR * 100.0), true);
    //console.log(view)
    const opCode2 = view.getUint8(0);
    const windSpeed2 = view.getInt16(1, true);
    const grade2 = view.getInt16(3, true);
    const crr = view.getUint8(5, true);
    const windResistance = view.getUint8(6, true);
    //console.log("TrainerCommands:sendSimulation "+ opCode2 + "," + windSpeed2 + "," + grade2 + "," + crr + "," + windResistance);
    //let result = await writeWithRetry(view);
    //     console.log('send Command',result);

    //cpCharacteristic = await ftmsService.getCharacteristic(0x2ad9)
    
    try {
 
        
       await this.treadmillControl.sendCommand(view); ;
    } catch (error) {
        console.error('TrainerCommands:send Command', error);
    }



}

async sendTargetPower(power) {
      const opCode = 0x05;
    const length = 3;
/*
    const definitions = {
        power: {resolution: 1, unit: 'W', size: 2, min: 0, max: 65534, default: 0},
    };
    */

     const view = new DataView(new ArrayBuffer(length));

        view.setUint8( 0, opCode, true);
        view.setUint16(1, power,  true);

        console.log(`TrainerCommands: sendTargetPower: powerTarget: ${power}`);
    try {
       
        
       await this.treadmillControl.sendCommand(view); ;
    } catch (error) {
        console.error('TrainerCommands:send Command', error);
    }
    }
async  setInclination(inc) {
    console.log("TrainerCommands:setInclination");
   
    const buffer = new ArrayBuffer(3);
    const view = new DataView(buffer);
    view.setUint8(0, 0x3);
    view.setInt16(1, (inc * 10), true);
    try {
        
       await this.treadmillControl.sendCommand(view); ;
    } catch (error) {
        console.error('TrainerCommands:setInclination', error);
    }
}
}
