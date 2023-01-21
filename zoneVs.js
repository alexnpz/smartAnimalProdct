import { getDatabase, ref,set, onValue, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

var app = (function() {
    const db = getDatabase();
    // Get Routes
    function routes(){
        const path = ref(db,'routes');
        onValue(path,(snapshot)=>{
            if (snapshot.exists()){
                const data = snapshot.val();
                const keys = Object.keys(data);
                //console.log(data);
                keys.forEach((key) => {
                    const select = document.getElementById("routing");
                    const option = document.createElement("option");
                    option.value = key;
                    option.text = data[key];
                    select.appendChild(option);
                    //console.log(`${key}: ${data[key]}`);
                });
                    //console.log(data.key);         
                }  
            }  
        );
    }
    routes();
    
    let arrayZones = ["/sensors","/alerts","/actuators"];
    let areaId = document.getElementById("areaId");
    let alertsId = document.getElementById("alertsId");
    let rulesId = document.getElementById("rulesId");
    
    function visualizeArea(optionSelected,areaId){
        areaId.innerHTML = "";
        let getElems = "/ESP"+ optionSelected;
        const path = ref(db,getElems);
        onValue(path,(snapshot) => {
            const data = snapshot.val();
            // Create HTML elements, then append them to areaId
            // Get keys from database/topic
            let keySensors = Object.keys(data.sensors);
            console.log(keySensors);
            // Create divs to append elements later
            let arrayId = [];        
            for(let i = 0 ; i< data.numSens ; i++) {
                let sensorsNameKey = "sensorName" + (i + 1);
                arrayId.push(sensorsNameKey);

                let sensorsValueKey = "sensorNormalValue" + (i + 1);
                arrayId.push(sensorsValueKey);
                
                let sensorsMeasUnitKey = "sensorMeasUnit"+ (i + 1);
                arrayId.push(sensorsMeasUnitKey);

                let divSectionSensor = document.createElement("div");
                divSectionSensor.setAttribute("class","d-flex mt-1");
                let divSensorName = document.createElement("div");
                divSensorName.setAttribute("id",sensorsNameKey);
                let divAllocValMeas = document.createElement("div");
                divAllocValMeas.setAttribute("class","hstack gap-2 ms-auto");
                let divSensorValue = document.createElement("div");
                divSensorValue.setAttribute("id",sensorsValueKey);
                let divSensorMeasUnit = document.createElement("div");
                divSensorMeasUnit.setAttribute("id",sensorsMeasUnitKey);
                divSensorMeasUnit.setAttribute("class","ms-auto");
                areaId.appendChild(divSectionSensor);
                divAllocValMeas.appendChild(divSensorValue);
                divAllocValMeas.appendChild(divSensorMeasUnit);
                divSectionSensor.appendChild(divSensorName);
                divSectionSensor.appendChild(divAllocValMeas);
            }
            
            console.log(arrayId);
            //Populate divs
            for(let index = 0 ; index < keySensors.length ; index++) {
                let indArrayId = arrayId[index];
                let selById = document.getElementById(indArrayId);
                selById.append(data.sensors[indArrayId]);
            };
            
        })
    }

    function visualizeAlerts(optionSelected,alertsId){
        alertsId.innerHTML = "";
        let getElems = "/ESP"+ optionSelected;
        const path = ref(db,getElems);
        onValue(path,(snapshot) =>{
            if(snapshot.exists()){
                const data = snapshot.val();
                const keysSensors = Object.keys(data.sensors);
                const keysAlerts = Object.keys(data.alerts);
                        
                console.log(keysSensors);
                console.log(keysAlerts);
                

                // Append Alerts if happened
            

                // Create object with {actuatorName, actuatorState} structure-format
                let actObj = {};
                Object.keys(data.actuators).forEach(key => {
                if (key.endsWith("State")) {
                    const actuatorName = key.slice(0, -5);
                    actObj[data.actuators[actuatorName]] = data.actuators[key];
                }
                });
                console.log(actObj);
                let keysActObj = Object.keys(actObj);

                // Check if Actuators == "ON" with filter, then iterate using forEach populating & creating HTML elements with Boostrap structure
                keysActObj.filter(key => actObj[key] !== 'OFF').forEach((key,index) => {
                    let divActuator = document.createElement("div");
                    divActuator.setAttribute("class","d-flex mt-1");
                    divActuator.setAttribute("id","divActuator" + index);
                    alertsId.appendChild(divActuator);

                    let divActuatorName = document.createElement("div");
                    divActuatorName.setAttribute("id","divActuatorName" + key);
                    divActuator.append(key);

                    let divActuatorSec = document.createElement("div");
                    divActuatorSec.setAttribute("class","hstack gap-2 ms-auto")
                    divActuator.appendChild(divActuatorSec);

                    let divActuatorState = document.createElement("div");
                    divActuatorState.setAttribute("class","hstack gap-2 ms-auto")
                    divActuatorSec.append(actObj[key]);
                    
                });

            }
        });
    }
    function visualizeRules(optionSelected,rulesId){
        rulesId.innerHTML = "";
        let getTable = "/ESP"+ optionSelected + arrayZones[1];
        const path = ref(db,getTable);
        onValue(path,(snapshot) =>{
            if(snapshot.exists()){
                const data = snapshot.val();
                const keys = Object.keys(data.sensors);
                console.log(keys);
                // Create form with Alerts Edition;
            }
        });
    }

    let select = document.getElementById("routing");
    select.addEventListener("change",() =>{
        if (select.value === "default"){
            return;
        }
        else{
        let optionSelected = select.options[select.selectedIndex].text;
        visualizeArea(optionSelected,areaId);
        //visualizeAlerts(optionSelected,alertsId);
        }
    // Alert(check values if above/below normal values, i.e, between sensorValues and sensorAlertValues,also show actuators ON and OFF)  

    // Rules( create form with new set of alert values, then "update" values in topic of Firebase)

    });
    

    // Create js-array and if necessary, create possibility to add using web (later)
    // String array with path for every system associated with areas
    // const elemsSystems = ['/ESPChicken/sensors/','/ESPChicken/actuators/','/ESPSheep/sensors/','/ESPSheep/actuators/'];
   // const dir = ref (db, systSelected);
    // function getFbValues(systSelected){
    //     const path = ref(db,systSelected);
    //     onValue(path,(snapshot)=>{
    //         if (snapshot.exists()){
    //             const data = snapshot.val();
    //             const keys = Object.keys(data);
    //             //console.log(data);
    //             keys.forEach((key,index) => {
    //                 const id = '#'+ key;
    //                 let controlOptVal = controlOptions[key];
    //                 //console.log(controlOptVal);
    //                 //console.log(data[key]);
                
    //                 if(key ==='temperature' && (data[key] > 30 || data[key] < 20)){
    //                     $('#temperaturemsg').text('YES');
                        
    //                 } else if (key ==='temperature' && (data[key] < 30 || data[key] > 20) ){
    //                     $('#temperaturemsg').text('NO');
    //                 }
    //                 else if (key ==='humidity' && (data[key] > 85 || data[key] < 25) ){
    //                     $('#humiditymsg').text('YES');
    //                 }
    //                 else if (key ==='humidity' && (data[key] < 85 || data[key] > 25) ){
    //                     $('#humiditymsg').text('NO');
    //                 }
    //                 $(id).text(data[key]);
    //                 // CODE TO ALTER
    //                 if (systSelected.includes('sensors')){
    //                     $('#sensors').append('<option value="' + index + '">' + controlOptVal + '</option>');
    //                 } else{
    //                     $('#actuators').append('<option value="' + index + '">' + controlOptVal + '</option>');
    //                     }
    //                 //console.log(`${key}: ${data[key]}`);
    //                 });
    //                 // END OF CODE TO ALTER
    //                 //console.log(data.key);         
    //             }  
    //         }  
    //     );
    // }
    
   // getFbValues(elemsSystems[0]);
   // getFbValues(elemsSystems[1]);
    // getFbValues(elemsSystems[2]);
    // getFbValues(elemsSystems[3]);
        
    
    //Control Panel add&remove visualization with use of add/remove to Firebase
    // Send add/remove to Firebase
    // function sendFbValues (spaSendFb,dbDir) {
    //     const path = ref(db,dbDir);
    //     const postFirebase = set(path, spaSendFb);
        
    // }

    //sendFbValues(spaSendFb,'/spaFirebase');
    //sendFbValues(controlBools,'/Control');
    
    // function Control(controlPath){
    //     const $btn = $("#" + controlPath);
    //     onValue(ref(db,controlPath), (snapshot) => {
    //         if (snapshot.exists()){
    //         const data = snapshot.val();    
    //         }
    //     });
    // }
    // function rulesControl(id,pathFile){
    //     let formRules = document.getElementById(id);
    //     let formData = {};
    //     for (let i = 0; i < formRules.elements.length - 1; i++) {
    //         let input = formRules.elements[i];
            
    //         console.log(input.name);
    //         if (input.value !== "" ){
    //             formData[input.name] = input.value;
    //         }
            
    //         // formData.append(input.name,input.value);
    //         console.log(input.value);
    //         console.log(formData);
    //         //alert(formData);
    //         }
    //     //rulesControl('sheepfoldform','/rulesSheeps');
    //     //console.log(formData);
        
    //     const path = ref(db,pathFile);
    //     const postFirebase = set(path, formData);
        
    // }

    
    //document.getElementById("btnSaveRulesChicken").addEventListener("click", () => rulesControl("chickencoopform","/rulesChicken"));
    // document.getElementById("btnSaveRulesSheep").addEventListener("click", () => rulesControl("sheepfoldform","/rulesSheeps"));
    
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
    
   
})();