import { getDatabase, ref,off,update} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const db = getDatabase();
let pathAPI = ref(db,"/Additional Info/API/");
export const doorAPI = async function (){
    // "https://api.ipgeolocation.io/ipgeo?apiKey=554653b913b04d24b5a7e80804f95a82"
    let response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=554653b913b04d24b5a7e80804f95a82');
    let data = await response.json();
    const latitude = data.latitude; 
    const longitude = data.longitude;
    let sunsresponse = await fetch("https://api.sunrise-sunset.org/json?" + latitude + "&" + longitude + "&formatted=0"); 
    let dataDoor = await sunsresponse.json();
    let dataSunrise = dataDoor.results.sunrise;
    let dataSunset = dataDoor.results.sunrise;
    let currentTime = Date.now();
    let dataSunriseObj = new Date (dataSunrise);
    let dataSunsetObj = new Date (dataSunset);
    let dataSunriseUTC= dataSunriseObj.getTime();
    let dataSunsetUTC= dataSunsetObj.getTime();
    switch (true) {
        case  currentTime < dataSunriseUTC:
            // code for before sunrise
            //"doorControl" : "OFF" false
            let doorBeforeSunrise = {};
            doorBeforeSunrise["doorControl"] = "OFF";
            update(pathAPI,doorBeforeSunrise);
            off(pathAPI);
            console.log("Before sunrise");
            break;
        case currentTime >=  dataSunriseUTC && currentTime < dataSunsetUTC:
            // code for between sunrise and sunset
            //"doorControl" : "ON", then after 5 minutes set to "OFF"
            let doorAfterSunrise = {};
            doorAfterSunrise["doorControl"] = "ON";
            update(pathAPI,doorAfterSunrise)
            setTimeout(() => {
                doorAfterSunrise["doorControl"] = "OFF";
                update(pathAPI,doorAfterSunrise);
                off(pathAPI);
            }, 60000);
            console.log("Between sunrise and sunset");
            break;
        case currentTime >= dataSunsetUTC:
            // code for after sunset
            //"doorControl" : "ON", then after 5 minutes set to "OFF"
            console.log("After sunset");
            let doorAfterSunset = {};
            doorAfterSunset["doorControl"] = "ON";
            update(pathAPI,doorAfterSunset)
            setTimeout(() => {
                doorAfterSunset["doorControl"] = "OFF";
                update(pathAPI,doorAfterSunset);
                off(pathAPI);
            }, 60000);
            break;
        default:
            console.log("Invalid case");
        };
    

};















