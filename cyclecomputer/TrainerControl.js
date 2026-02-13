import {printWatts} from './ftms.js';
import {trainerConnected,smartTrainerConnected} from './cyclecomputer.js';
const serviceIds = {
    serviceFTMS: 0x1826,
    indoorBikeData: 0x2ad2,
    trainerControl: 0x2ad9
    
 
}


export class TrainerControl {


    constructor() {
        this.controlPointCharacteristic = null;
        this.trainerDataCharacteristic = null;
        this.device = null;
        this.server = null;
        this.service = null;


        this.supportedSpeedRangeCharacteristic = null;
        this.supportedInclinationRangeCharacteristic = null;
        this.currentSpeed = 0;
        this.heartRates = [];

        this.dataHandler = [];
    }

    async sendCommand(command) {
        try {
            let result = await this.controlPointCharacteristic.writeValueWithResponse(command);
        } catch (error) {
            console.error('Error sending command', error);
        }
    }

    addDataHandler(handler) {
        this.dataHandler.push(handler);
    }

    isWebBluetoothEnabled() {
        if (navigator.bluetooth) {
            return true;
        } else {
            ChromeSamples.setStatus('Web Bluetooth API is not available.\n' +
                'Please make sure the "Experimental Web Platform features" flag is enabled.');
            return false;
        }
    }
   
    async connect() {

        this.device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [serviceIds.serviceFTMS] }]
        });
        this.device .addEventListener('gattserverdisconnected', this.onDisconnected);
	console.log("TrainerControl: connect");
        this.server = await this.device.gatt.connect();
        this.service = await this.server.getPrimaryService(serviceIds.serviceFTMS);

      
         this.controlPointCharacteristic = await this.service.getCharacteristic('fitness_machine_control_point');
          this.controlPointCharacteristic.addEventListener('characteristicvaluechanged', this.handleCPNotifications.bind(this));
        console.log("TrainerControl: start CP notification");
        await this.controlPointCharacteristic.startNotifications();
      
          this.trainerDataCharacteristic = await this.service.getCharacteristic('indoor_bike_data');
	    console.log("TrainerControl: start notification");
        await this.trainerDataCharacteristic.startNotifications();
        this.trainerDataCharacteristic.addEventListener('characteristicvaluechanged', this.handleNotifications.bind(this));
 	
       
  	
    }
 async connectDevice(device) {
/*
        this.device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [serviceIds.serviceFTMS] }]
        });
        */
        this.device = device;
        this.device .addEventListener('gattserverdisconnected', this.onDisconnected);
	console.log("TrainerControl: connect");
        this.server = await this.device.gatt.connect();
        this.service = await this.server.getPrimaryService(serviceIds.serviceFTMS);

      
         this.controlPointCharacteristic = await this.service.getCharacteristic('fitness_machine_control_point');
          this.controlPointCharacteristic.addEventListener('characteristicvaluechanged', this.handleCPNotifications.bind(this));
        console.log("TrainerControl: start CP notification");
        await this.controlPointCharacteristic.startNotifications();
      
   //  document.getElementById('wattsl').style.backgroundColor = 'green';
   // document.getElementById('wattsl').style.opacity=0.5;
     
          this.trainerDataCharacteristic = await this.service.getCharacteristic('indoor_bike_data');
	    console.log("TrainerControl: start notification");
        await this.trainerDataCharacteristic.startNotifications();
        this.trainerDataCharacteristic.addEventListener('characteristicvaluechanged', this.handleNotifications.bind(this));
 	
       
  	
    }

    disconnect() {
        if (this.connected()) {
            this.device.gatt.disconnect();
            this.device = null;
        }
    }

    connected() {
	console.log("TrainerControl: connected");
        return this.device && this.device.gatt.connected;
    }

 

       
  	
  
    
    async onDisconnected(event) {
        const device = event.target;
    alert(`Device ${device.name} is disconnected.`);
         console.log(`Device ${device.name} is disconnected.`);
         //await this.reconnectWithBackoff();
        let maxRetries = 10;
  let baseDelay = 1000;
       
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Reconnect attempt ${attempt}`);
      await this.device.gatt.connect();
      await this.connect();
     await this.controlPointCharacteristic.writeValue(
            Uint8Array.from([0x00])
        );
      console.log('Reconnected to trainer');
      return;
    } catch (e) {
      const delay = baseDelay * 2 ** (attempt - 1);
      console.warn(`Retry in ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  console.error('Trainer reconnect failed');

   /*
	console.log("TrainerControl: connect");
        this.server = await device.gatt.connect();
        this.service = await this.server.getPrimaryService(serviceIds.serviceFTMS);

        this.treadmillDataCharacteristic = await this.service.getCharacteristic('indoor_bike_data');
	console.log("TrainerControl: start notification");
        await this.trainerDataCharacteristic.startNotifications();
        this.trainerDataCharacteristic.addEventListener('characteristicvaluechanged', this.handleNotifications.bind(this));
 	
        this.controlPointCharacteristic = await this.service.getCharacteristic('fitness_machine_control_point');

	console.log("TrainerControl: start CP notification");
        await this.controlPointCharacteristic.startNotifications();
        this.controlPointCharacteristic.addEventListener('characteristicvaluechanged', this.handleCPNotifications.bind(this));
*/
     
       
}

        
   handleCPNotifications(event) {
	console.log("TrainerControl: handleCPNotifications "+event);
        let value = event.target.value;
	}

    
    handleNotifications(event) {
	//console.log("TrainerControl: handleNotifications"+event);
	printWatts(event);
        let value = event.target.value;
        var flags = value.getUint16(0, /*littleEndian=*/true);
        // 2octets for flags, 2octets for instant speed, nextPosition is incremented following the number of octets for each value
        var nextPosition = 4;

        let posAvgSpeed = undefined;
        let posTotDistance = undefined;
        let posInclination = undefined;
        let posElevGain = undefined;
        let posInsPace = undefined;
        let posAvgPace = undefined;
        let posKcal = undefined;
        let posHR = undefined;
        let posMET = undefined;
        let posElapsedTime = undefined;
        let posRemainTime = undefined;
        let posForceBelt = undefined;

        if ((flags & (1 << 1)) != 0) { posAvgSpeed = nextPosition; nextPosition += 2; }
        if ((flags & (1 << 2)) != 0) { posTotDistance = nextPosition; nextPosition += 3; }//4
        if ((flags & (1 << 3)) != 0) { posInclination = nextPosition; nextPosition += 4; }//8
        if ((flags & (1 << 4)) != 0) { posElevGain = nextPosition; nextPosition += 4; }
        if ((flags & (1 << 5)) != 0) { posInsPace = nextPosition; nextPosition += 1; }
        if ((flags & (1 << 6)) != 0) { posAvgPace = nextPosition; nextPosition += 1; }
        if ((flags & (1 << 7)) != 0) { posKcal = nextPosition; nextPosition += 5; }
        if ((flags & (1 << 8)) != 0) { posHR = nextPosition; nextPosition += 1; }
        if ((flags & (1 << 9)) != 0) { posMET = nextPosition; nextPosition += 1; }
        if ((flags & (1 << 10)) != 0) { posElapsedTime = nextPosition; nextPosition += 2; }
        if ((flags & (1 << 11)) != 0) { posRemainTime = nextPosition; nextPosition += 2; }
        if ((flags & (1 << 12)) != 0) { posForceBelt = nextPosition; nextPosition += 4; }

        const result = new TrainerData();

        // instantaneous speed
        const speed = value.getUint16(2, /*littleEndian=*/true) / 100;
        result.speed = speed;

        //distance
        let distance = value.getUint16(posTotDistance, /*littleEndian=*/true);

        let distance_complement = value.getUint8(posTotDistance + 2, /*littleEndian=*/true);
        distance_complement = distance_complement << 16;
        distance = distance + distance_complement;
        result.totalDistance = distance;

        if (typeof posInclination != "undefined") {
            const inclination = value.getInt16(posInclination, /*littleEndian=*/true) / 10;
            result.inclination = inclination;
        }

        if (typeof posKcal != "undefined") {
            const kcal = (value.getUint16(posKcal, /*littleEndian=*/true));
            result.kcal = kcal;
        }

        if (typeof posHR != "undefined") {
            const hr = (value.getUint8(posHR, /*littleEndian=*/true));
            result.hr = hr;
        }

        if (typeof posElapsedTime != "undefined") {
            const elapsedTime = (value.getUint16(posElapsedTime, /*littleEndian=*/true));
            result.elapsedTime = elapsedTime;
        }
        this.dataHandler.forEach(cb => cb(result));
    }




    
 async  reconnectWithBackoff() {
  let maxRetries = 10;
  let baseDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Reconnect attempt ${attempt}`);
      await this.device.gatt.connect();
      await this.connect();
      await this.reinitializeTrainer();
      console.log('Reconnected to trainer');
      return;
    } catch (e) {
      const delay = baseDelay * 2 ** (attempt - 1);
      console.warn(`Retry in ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  console.error('Trainer reconnect failed');
}
    


   async  requestControl() {
  // OpCode 0x00 = Request Control
  await this.controlPointCharacteristic.writeValue(
    Uint8Array.from([0x00])
  );
}
async reinitializeTrainer() {
  await this.requestControl();
 // await setERGMode(200); // restore last target
}


}

export class TrainerData {
    constructor() {
        this.speed = undefined;
        this.avgSpeed = undefined;
        this.totalDistance = undefined;
        this.inclination = undefined;
        this.elevationGain = undefined;
        this.insPace = undefined;
        this.avgPace = undefined;
        this.kcal = undefined;
        this.hr = undefined;
        this.met = undefined;
        this.elapsedTime = undefined;
        this.remainingTime = undefined;
        this.forceBelt = undefined;
    }
}

