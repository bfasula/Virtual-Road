export function speedFromWatts(watts, grade) {
        //Frontal area A(ft2)  5.4788
let G=grade;

let rho=1.226; // air density

let cda = .50;  // coefficeint of drag
let g=9.8067; //The gravitational force constant g is 9.8067 (m/s2).
let a = 0.5 * cda * rho;
let vhw = 0.0; // headwind
let b = vhw * cda * rho;
let bike=20.0/2.204623;
let rider=150.0/2.204623;

let W=bike+rider; // combined weight of you (the cyclist) and your bike is W (kg)

//double crr=0.005; // coefficient of rolling resistance
let crr=0.006; // coefficient of rolling resistance
let c=0.0;
let dtl=2.0; // drive train loss percent

let d=0.0;
let Q=0.0;
let R=0.0;
let s=0.0;
let S=0.0;
let T=0.0; // cbrt=Math.pow(num,1/3.);
let Vgs=0.0;  // ground speed
        c=(g*W*(Math.sin(Math.atan(G/100.0))+
       crr*Math.cos(Math.atan(G/100.0))))+(0.5 * cda * rho* (vhw*vhw));

d=-(1-(dtl/100.0))*watts;
Q=(3*a*c-b*b)/(9.0*a*a);
R=(9.0*a*b*c-27.0*a*a*d-2.0*b*b*b)/(54.0*a*a*a);
 s=Math.sqrt(Q*Q*Q+R*R);
 S=Math.cbrt(R+s);
 T=Math.cbrt(R-s); // cbrt=Math.pow(num,1/3.);
 if ((Q*Q*Q+R*R) > 0) {
 Vgs=S+T-(b/(3.0*a));  // ground speed
 } else {
     let B=Q;
     let A=R;
     Vgs=2.0*Math.sqrt(-B)*Math.cos((1.0/3.0)*Math.acos(A/Math.sqrt(-B*-B*-B)))-(b/(3.0*a));  // ground speed
 }
        //System.out.println("a " + a + " b " + b + " c " + c + " d " + d);
        //System.out.println("c "+c +" d " +d + " Q " + Q + " R " + R + " s " + s+ " S "+S +" T " + T);
        console.log("Watts " + watts + " speed " + Vgs*2.2369362920544);
    return Vgs;
    }  