import { getDatabase, ref,off,update,get} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Using jQuery to get IP, Geolocation and then request OpenWeatherMap and get some useful data
const db = getDatabase();
let pathAPI = ref(db,"/Additional Info/API/");
let path = ref(db,"/Additional Info/activity/");
$().ready(function () {
  let weatherObj = {};
  function weatherToday () {
    //$.getJSON("")
    $.getJSON("https://api.ipgeolocation.io/ipgeo?apiKey=554653b913b04d24b5a7e80804f95a82", function(rsp){
      let $country_name = rsp.country_name;
      weatherObj["location"] = $country_name;
      $('#apilocation').text($country_name);
      $.getJSON('https://api.openweathermap.org/data/2.5/weather?units=metric&q='+ $country_name +'&appid=d1970f87022cd49037d9f60841422697',
        function(response) {
          $('#apitemperature').text(response.main.temp + ' ºC');
          weatherObj["temperature"] = response.main.temp;
          $('#apihumidity').text(response.main.humidity + ' %');
          weatherObj["humidity"] = response.main.humidity;
          // UTC unix
          let $currentTime = Date.now();
          weatherObj["currentTime"] = $currentTime;
          let $sunriseUTC = new Date(response.sys.sunrise * 1000);
          let $sunriseTimeStamp = $sunriseUTC.getTime();
          weatherObj["sunriseMilliseconds"] = $sunriseTimeStamp;
          let $localDateSunrise = `${$sunriseUTC.getHours()}:${$sunriseUTC.getMinutes()}:${$sunriseUTC.getSeconds()} AM`;
          $('#apisunrise').text($localDateSunrise);
          let $sunsetUTC = new Date(response.sys.sunset * 1000);
          let $sunsetTimeStamp = $sunsetUTC.getTime();
          weatherObj["sunsetMilliseconds"] = $sunsetTimeStamp;
          let $localDateSunset = `${$sunsetUTC.getHours()}:${$sunsetUTC.getMinutes()}:${$sunsetUTC.getSeconds()} PM`;
          $('#apisunset').text($localDateSunset);
          console.log(weatherObj["currentTime"]);
          switch (true) {
            case  weatherObj["currentTime"] < weatherObj["sunriseMilliseconds"]:
                // code for before sunrise
                //"doorControl" : "OFF" false
                let doorBeforeSunrise = {};
                doorBeforeSunrise["doorControl"] = "OFF";
                update(pathAPI,doorBeforeSunrise);
                off(pathAPI);
                console.log("Before sunrise");
                break;
            case weatherObj["currentTime"] >=  weatherObj["sunriseMilliseconds"] && weatherObj["currentTime"] < weatherObj["sunsetMilliseconds"]:
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
            case weatherObj["currentTime"] >= weatherObj["sunsetMilliseconds"]:
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
          }
          update(pathAPI,weatherObj);
          off(pathAPI);
      })
    })
  }
  weatherToday();
  
});

var app = (function() {
  const idActivity = {  "0": "education",
                        "1": "recreational", 
                        "2":"social", 
                        "3":"diy", 
                        "4":"charity", 
                        "5":"cooking", 
                        "6":"relaxation", 
                        "7":"music", 
                        "8":"busywork"};  
  
  //Populate form
  const keys = Object.keys(idActivity);
  keys.forEach((key) => {
    $('#idactivity').append('<option value="' + key + '">' + idActivity[key] + '</option>');
  });
  
  // Using SimplePlain Javascript, to request API & save in Firebase
  let select = document.getElementById("idactivity");
  let actObj = {}
  select.addEventListener("change", async()=>{
    try{
      let selectionValue = select.value;
      console.log(selectionValue);
      if(idActivity.hasOwnProperty(selectionValue)){
        let selAct = idActivity[selectionValue];
        console.log(selAct);
        let response = await fetch('https://www.boredapi.com/api/activity?type=' + selAct);
        let data = await response.json();
        console.log(data.activity);
        alert(data.activity);
        actObj[selAct] = data.activity
        
        update(path, actObj);
        off(path);
        return;
      }
    }
    catch(error){
      console.log(error);
    }
  });

  // Additional info show statistics obtained by sensors
  function statistics(dataObj){}
    
})();