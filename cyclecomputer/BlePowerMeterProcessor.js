export class BlePowerMeterProcessor {
    constructor() {
        this.WINDOW_SIZE_FOR_NP = 30; // seconds for Normalized Power

        // State
        this.powerHistory = [];        // for average power
        this.power30sRolling = [];     // for Normalized Power
        this.lastTimestamp = 0;

        this.lastCrankRevs = -1;
        this.lastCrankTime = -1;

        this.currentCadence = 0;
        this.avgPower = 0;
        this.normalizedPower = 0;

        this.pedalBalance = 0.5;       // 0.0 = all left, 1.0 = all right
        this.hasBalanceData = false;
    }

    /**
     * Process raw data from Cycling Power Measurement characteristic (0x2A63)
     * @param {Uint8Array|ArrayBuffer|number[]} data - Raw BLE characteristic value
     * @param {number} timestampMs - Current timestamp in milliseconds
     */
    processPowerData(data, timestampMs = Date.now()) {
        if (!data) {
            console.log("No Data");
            return;
            }

        // Convert to array for easy access
        const bytes = data instanceof ArrayBuffer 
            ? new Uint8Array(data) 
            : Array.from(data);

        if (bytes.length < 4) {
            console.log("Data length "+bytes.length);
            return;
            }

        let offset = 0;

        // 1. Flags (UINT16, little-endian)
        const flags = bytes[offset] | (bytes[offset + 1] << 8);
        offset += 2;

        // 2. Instantaneous Power (SINT16)
        let instantPower = bytes[offset] | (bytes[offset + 1] << 8);
        if ((bytes[offset + 1] & 0x80) !== 0) {
            instantPower = -((~instantPower & 0xFFFF) + 1); // two's complement
        }
        offset += 2;

        // 3. Pedal Power Balance (if present)
        const hasPedalBalance = (flags & 0x0001) !== 0;

        if (hasPedalBalance && offset < bytes.length) {
            const balanceField = bytes[offset];
            offset++;

            const rightPedalReference = (balanceField & 0x80) !== 0;
            const balanceValue = balanceField & 0x7F; // 0-100

            this.pedalBalance = rightPedalReference 
                ? (100 - balanceValue) / 100 
                : balanceValue / 100;

            this.hasBalanceData = true;
        } else {
            this.hasBalanceData = false;
        }

        // 4. Crank Revolution Data (for cadence)
        if ((flags & 0x0002) !== 0 && offset + 3 < bytes.length) {
            const cumulativeCrankRevs = bytes[offset] | (bytes[offset + 1] << 8);
            offset += 2;
            const lastCrankEventTime = bytes[offset] | (bytes[offset + 1] << 8);
            offset += 2;

            this.calculateCadence(cumulativeCrankRevs, lastCrankEventTime);
        }

        // Update power metrics
        this.updatePowerMetrics(instantPower, timestampMs);
    }

    calculateCadence(cumulativeCrankRevs, lastCrankEventTime1024) {
        if (this.lastCrankRevs < 0) {
            this.lastCrankRevs = cumulativeCrankRevs;
            this.lastCrankTime = lastCrankEventTime1024;
            return;
        }

        let revDelta = cumulativeCrankRevs - this.lastCrankRevs;
        let timeDelta = (lastCrankEventTime1024 - this.lastCrankTime) & 0xFFFF;

        if (timeDelta > 0 && revDelta > 0) {
            const timeSeconds = timeDelta / 1024.0;
            this.currentCadence = (revDelta / timeSeconds) * 60;
        }

        this.lastCrankRevs = cumulativeCrankRevs;
        this.lastCrankTime = lastCrankEventTime1024;
    }

    updatePowerMetrics(power, timestampMs) {
        // Keep history for average power (~5 minutes)
        this.powerHistory.push(power);
        if (this.powerHistory.length > 300) {
            this.powerHistory.shift();
        }

        // Average Power
        this.avgPower = this.powerHistory.reduce((a, b) => a + b, 0) / this.powerHistory.length;

        // Rolling 30s for Normalized Power
        this.power30sRolling.push(power);
        if (this.power30sRolling.length > this.WINDOW_SIZE_FOR_NP) {
            this.power30sRolling.shift();
        }

        // Normalized Power calculation
        if (this.power30sRolling.length >= this.WINDOW_SIZE_FOR_NP) {
            let sumFourth = 0;
            for (let p of this.power30sRolling) {
                sumFourth += Math.pow(p, 4);
            }
            this.normalizedPower = Math.pow(sumFourth / this.power30sRolling.length, 0.25);
        }
    }

    // ==================== Getters ====================

    getInstantPower() {
        return this.powerHistory.length > 0 
            ? this.powerHistory[this.powerHistory.length - 1] 
            : 0;
    }

    getAveragePower() {
        return Math.round(this.avgPower);
    }

    getCadence() {
        return Math.round(this.currentCadence);
    }

    getNormalizedPower() {
        return Math.round(this.normalizedPower);
    }

    getLeftPower() {
        const total = this.getInstantPower();
        return Math.round(total * this.pedalBalance);
    }

    getRightPower() {
        const total = this.getInstantPower();
        return Math.round(total * (1 - this.pedalBalance));
    }

    hasPedalBalanceData() {
        return this.hasBalanceData;
    }

    reset() {
        this.powerHistory = [];
        this.power30sRolling = [];
        this.lastCrankRevs = -1;
        this.lastCrankTime = -1;
        this.currentCadence = 0;
        this.avgPower = 0;
        this.normalizedPower = 0;
        this.pedalBalance = 0.5;
        this.hasBalanceData = false;
    }
}

// Export for Node.js or modules
//export default BlePowerMeterProcessor;