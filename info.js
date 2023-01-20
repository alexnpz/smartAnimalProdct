import { getDatabase, ref,set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Using jQuery to get IP, Geolocation and then request OpenWeatherMap and get some useful data
$().ready(function () {
  function weatherToday () {
    //$.getJSON("")
    $.getJSON("https://api.ipgeolocation.io/ipgeo?apiKey=554653b913b04d24b5a7e80804f95a82",function(rsp){
      let country_name = rsp.country_name;
      $('#apilocation').text(country_name);
    $.getJSON('https://api.openweathermap.org/data/2.5/weather?units=metric&q='+ country_name +'&appid=d1970f87022cd49037d9f60841422697',
      function(response) {
        $('#apitemperature').text(response.main.temp + ' ºC');
        $('#apihumidity').text(response.main.humidity + ' %');
        // UTC unix
        let $sunriseUTC = new Date(response.sys.sunrise * 1000);
        let $localDateSunrise = `${$sunriseUTC.getHours()}:${$sunriseUTC.getMinutes()}:${$sunriseUTC.getSeconds()} AM`;
        $('#apisunrise').text($localDateSunrise);
        let $sunsetUTC = new Date(response.sys.sunset * 1000);
        let $localDateSunset = `${$sunsetUTC.getHours()}:${$sunsetUTC.getMinutes()}:${$sunsetUTC.getSeconds()} PM`;
        $('#apisunset').text($localDateSunset);                  
      });
    });
    
  }   
  weatherToday();
 });

var app = (function() {
  const db = getDatabase();
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
  select.addEventListener("change", async()=>{
    try{
      let selectionValue = select.value;
      console.log(selectionValue);
      if(idActivity.hasOwnProperty(selectionValue)){
        let response = await fetch('https://www.boredapi.com/api/activity?type=' + idActivity[selectionValue]);
        let data = await response.json();
        console.log(data.activity);
        alert(data.activity);
        let path = ref(db,"/activity");
        set(path, data.activity);
      }
    }
    catch(error){
      console.log(error);
    }
  });

  // Additional info show statistics obtained by sensors
  function statistics(dataObj){}
    
})();