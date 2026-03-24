// Includes inertia
export class TrainerPhysics {
    static Params = class {
        constructor() {
            this.massKg = 80.0;        // rider + bike
            this.cda = 0.32;           // aero drag area
            this.crr = 0.004;          // rolling resistance
            this.airDensity = 1.226;   // kg/m^3
            this.grade = 0.0;          // slope (e.g. 0.05 = 5%)
            this.drivetrainEff = 0.97; // drivetrain efficiency
            this.inertiaFactor = 1.05; // rotational inertia multiplier
        }
    }

    static G = 9.81;
    static MIN_SPEED = 0.1; // m/s safety floor

    updateSpeed(speed, power, dt, p) {
        console.log(p);
        // Effective mass (includes wheel inertia)
        const mEff = p.massKg * p.inertiaFactor;

        // Safe speed (prevents division issues)
        const v = Math.max(speed, TrainerPhysics.MIN_SPEED);

        // --- Resistive Forces ---
        const F_aero = 0.5 * p.airDensity * p.cda * v * v;
        const F_roll = p.crr * p.massKg * TrainerPhysics.G;
        const F_grav = p.massKg * TrainerPhysics.G * p.grade;

        const F_resist = F_aero + F_roll + F_grav;

        // --- Drive Force ---
        let F_drive = 0.0;
        if (power > 0) {
            const effectivePower = power * p.drivetrainEff;
            F_drive = effectivePower / v;
        }

        // --- Acceleration ---
        const accel = (F_drive - F_resist) / mEff;

        // --- Semi-implicit Euler (stable like trainers) ---
        const newSpeed = speed + accel * dt;

        return Math.max(0.0, newSpeed);
    }
}