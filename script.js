import { getDatabase, ref,set, onValue } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

var app = (function() {
    const db = getDatabase();
    const spaSendFb = {
        'lux': [0,1],
        'door_servo': [0,1],
        'buzzer': [0,1],
        'move_left_sec': [0,1],
        'move_right_sec': [0,1],
        'servo_left_sec': [0,1],
        'servo_right_sec': [0,1],
        'ultrassonic': [0,1],
        'lcd': [0,1],
        'hum_sensor': [0,1],
        'temp_sensor': [0,1],
        'water_quality_sensor':[0,1],
        'minerals_servo': [0,1],
        'door_servo_third': [0,1],
        'fan': [0,1]                
    };
    // state Associated with Rules
    const stateAssociatedSheepFold = {
        'servomotorDoorDayNight' : ['OPEN','OPENING','CLOSING','CLOSED'],
        'minerals' : ['ON','STOP'],
        'fan' : ['ON','STOP'],
        'temperature': ['YES','NO'],
        'humidity': ['YES','NO'],
        'waterQ': ['GOOD','DANGER'],
    
    };
    const stateAssociatedChickenCoop = {
        'motorFood' : ['ON','OFF'],
        'lux' : ['LOW','MEDIUM','HIGH'],
        'buzzer' : ['ON','STOP'],    
    };

    const controlOptions = {
        'servmDoorDNight' : 'Front Door',
        'minerals' : 'Minerals Motor',
        'fan' : 'Fan',
        'temperature': 'Temperature',
        'humidity': 'Humidity',
        'waterQ': 'Water Quality',
        'motorFood' : 'Food Motor',
        'lux' : 'Light',
        'buzzer' : 'Buzzer', 
    };

    const controlBools = {
        'servmDoorDNight' : true,
        'minerals' : false,
        'fan' : false,
        'temperature': true,
        'humidity': true,
        'waterQ': true,
        'motorFood' : true,
        'lux' : false,
        'buzzer' : false, 
    };

    // Create js-array and if necessary, create possibility to add using web (later)
    // String array with path for every system associated with areas
    const elemsSystems = ['/ESPChicken/sensors/','/ESPChicken/actuators/','/ESPSheep/sensors/','/ESPSheep/actuators/'];
   // const dir = ref (db, systSelected);
    function getFbValues(systSelected){
        const path = ref(db,systSelected);
        onValue(path,(snapshot)=>{
            if (snapshot.exists()){
                const data = snapshot.val();
                const keys = Object.keys(data);
                //console.log(data);
                keys.forEach((key,index) => {
                    const id = '#'+ key;
                    let controlOptVal = controlOptions[key];
                    //console.log(controlOptVal);
                    //console.log(data[key]);
                
                    if(key ==='temperature' && (data[key] > 30 || data[key] < 20)){
                        $('#temperaturemsg').text('YES');
                        
                    } else if (key ==='temperature' && (data[key] < 30 || data[key] > 20) ){
                        $('#temperaturemsg').text('NO');
                    }
                    else if (key ==='humidity' && (data[key] > 85 || data[key] < 25) ){
                        $('#humiditymsg').text('YES');
                    }
                    else if (key ==='humidity' && (data[key] < 85 || data[key] > 25) ){
                        $('#humiditymsg').text('NO');
                    }
                    $(id).text(data[key]);
                    // CODE TO ALTER
                    if (systSelected.includes('sensors')){
                        $('#sensors').append('<option value="' + index + '">' + controlOptVal + '</option>');
                    } else{
                        $('#actuators').append('<option value="' + index + '">' + controlOptVal + '</option>');
                        }
                    //console.log(`${key}: ${data[key]}`);
                    });
                    // END OF CODE TO ALTER
                    //console.log(data.key);         
                }  
            }  
        );
    }
    
   // getFbValues(elemsSystems[0]);
   // getFbValues(elemsSystems[1]);
    getFbValues(elemsSystems[2]);
    getFbValues(elemsSystems[3]);
        
    
    //Control Panel add&remove visualization with use of add/remove to Firebase
    // Send add/remove to Firebase
    function sendFbValues (spaSendFb,dbDir) {
        const path = ref(db,dbDir);
        const postFirebase = set(path, spaSendFb);
        
    }

    //sendFbValues(spaSendFb,'/spaFirebase');
    //sendFbValues(controlBools,'/Control');
    
    function Control(controlPath){
        const $btn = $("#" + controlPath);
        onValue(ref(db,controlPath), (snapshot) => {
            if (snapshot.exists()){
            const data = snapshot.val();    
            }
        });
    }
    function rulesControl(id,pathFile){
        let formRules = document.getElementById(id);
        let formData = {};
        for (let i = 0; i < formRules.elements.length - 1; i++) {
            let input = formRules.elements[i];
            
            console.log(input.name);
            if (input.value !== "" ){
                formData[input.name] = input.value;
            }
            
            // formData.append(input.name,input.value);
            console.log(input.value);
            console.log(formData);
            //alert(formData);
            }
        //rulesControl('sheepfoldform','/rulesSheeps');
        //console.log(formData);
        
        const path = ref(db,pathFile);
        const postFirebase = set(path, formData);
        
    }

    
    //document.getElementById("btnSaveRulesChicken").addEventListener("click", () => rulesControl("chickencoopform","/rulesChicken"));
    document.getElementById("btnSaveRulesSheep").addEventListener("click", () => rulesControl("sheepfoldform","/rulesSheeps"));
    
    //   document.getElementById("btnSaveRulesSheep").addEventListener("click", function () {
        
    //     //rulesControl('sheepfoldform','/rulesSheeps');
    //     alert("Teste2");
    //   });
    
    // document.getElementById("btnSaveRules").addEventListener("click", function () {
    //     rulesControl('sheepfoldform','/rulesSheeps');
    //     alert("Teste");
    //   });
    // function rulesControl(formRulesid,dbDir){
    //     const formRules = document.getElementById(formRulesid);
    //     for (let i = 0; i < formRules.elements.length; i++) {
    //         let input = formRules.elements[i];
    //         let value = input.value;
    //         console.log(value);
    //         //rulesFB[input]=value;
    //     }
        
    //     // var rtemperaturemin = document.getElementById("rtemperaturemin").value;
    //     // var rtemperaturemax = document.getElementById("rtemperaturemax").value;
    //     // alert(rtemperaturemin);
    //     // alert(rtemperaturemax);
        
        
    // //     const queryString = $(formRulesid).serialize();
    // //     alert(queryString.rtemperaturemin);
    // //     console.log(queryString)
    // //    alert("Test");

    //     const path = ref(db,dbDir);
    //     const postFirebase = set(path, formData);
        
    //     // const formRules = document.getElementById(formRulesid);
    //     // const rulesFB = {};
    //     // formRules.addEventListener('submit', () => {
    //     //     for (let i = 0; i < formRules.elements.length; i++) {
    //     //         let input = formRules.elements[i];
    //     //         let value = input.value;
    //     //         rulesFB[input]=value;
    //     //     }
    //     // });

        
    //     }
        
        // document.body.addEventListener("click", e => {});
        // const path = ref(db,dbDir);
        // const postFirebase = set(path, rulesFB);
    
   

    // function cnfBtn(idBtn,icon,idTimeStamp){
    //     const $btn = $("#" + idBtn);
    //     const $icon = $("#" + icon);
    //     let stateBtn = false;
    //     onValue(ref(db,idBtn), (snapshot) => {
    //         if (snapshot.exists()){
    //         const data = snapshot.val();
    //         const timestamp = data.timestamp;
    //         timestamps[idTimeStamp] = timestamp;
    //         const newStateBtn = data.state;
    //         if (newStateBtn != stateBtn){
    //             stateBtn = newStateBtn;
    //             $btn.toggleClass('fa-toggle-on fa-toggle-off text-danger');
    //             $icon.toggleClass('fas far text-warning');
    //             }
    //         }
    //       });
    //     $btn.click(() => {
    //         set(ref(db,idBtn),{
    //             state: !stateBtn,
    //             timestamp: Date.now()
    //         });
    //     })  
    // }
    //
    // Additional info show statistics obtained by sensors
    function statistics(dataObj){}
   
})();