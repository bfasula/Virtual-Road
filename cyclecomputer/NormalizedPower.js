/*
To calculate Normalized Power:

Start at the beginning of the data and calculate a 30-second rolling average for power.
Raise the values obtained in Step 1 to the fourth power.
Calculate the average of all the values obtained in Step 2.
Find the fourth root of the number obtained in Step 3.

TSS: Training Stress Score
TSS is a score given to tell you how hard a workout was. For example: if you were to ride at threshold for 1 hour, it would surely be more stressful to your system than if you were to ride at threshold for 30 minutes. TSS takes into account both intensity as well as the duration of an activity and paints a more complete picture of how hard a workout was comparative to your overall training. In simplest terms, TSS determines the “cost” a workout has had on your body. Typically the higher the calculated TSS score, the more fatigued you will feel. 

TSS is calculated by the following equation:

TSS = (sec x NP x IF) / (FTP x 3600) x 100

sec: the total number of seconds in the session

NP: Normalized Power (more on this in a bit)

IF: Intensity Factor (more on this in a bit)

FTP: Functional Threshold Power (power you can hold for the 60-minute duration)

3600: total number of seconds in an hour



IF: Intensity Factor
Intensity Factor allows us to determine how intense a session was relative to our own threshold. IF is represented as any percentage of 1, with 1.0 being your threshold. For example: if your session calculates an IF of 0.5, then this can be read as: the session was performed at 50% of your threshold. 

IF is calculated by taking a ratio of your NP to your threshold power. If your FTP is 200 and your normalized power for a session is 180, then your IF would be 0.9. Typically general endurance sessions fall between the 0.6-0.7 range, while higher intensity sessions can fall under the 0.8-0.9 and sometimes depending on the event, can exceed 1.
*/




export class NormalizedPower{
  constructor(ftp) {
    
   
    this.pArray = [];
    this.pIndex=0;
    this.arrayFilled=false;
    this.totalP=0;
    this.totalPPts=0;
    this.totalP4=0;
    this.totalP4Pts=0;
    this.NP=0;
    this.ftp=ftp;
    this.intensityFactor=0;
    this.tss=0;
  }
    
  addPower(power) {
   //console.log("addPower "+power+ " pIndex "+this.pIndex);
    this.pArray[this.pIndex++]=power;
    if (this.pIndex == 30) {
        this.pIndex=0;
        this.arrayFilled=true;
    }
    if(!this.arrayFilled) { return;}
    let tPower=0;
    for (var i=0; i<30; i++) {
        tPower+=this.pArray[i];
    }
 //console.log("tPower "+tPower);
    let aPower=tPower/30;
    let aPower4=aPower*aPower*aPower*aPower;
    this.totalP4+=aPower4;
    this.totalP4Pts++;
    this.NP=nthRoot(this.totalP4/this.totalP4Pts,4);
    this.intensityFactor=(this.NP/this.ftp).toFixed(2);
  }
    
    calcTSS(sec) {
        this.tss= (sec * this.NP * this.intensityFactor) / (this.ftp * 3600) * 100;
        return this.tss;
    }
    
   
}
function   nthRoot(x, n) {
  if(x < 0 && n%2 != 1) return NaN; // Not well defined
  return (x < 0 ? -1 : 1) * Math.pow(Math.abs(x), 1/n);
  }