import { getDatabase, ref,set,onValue,off,child} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {doorAPI} from "./doorCont.js"
var app = (function() {
        const db = getDatabase();
        const doorC = doorAPI();
        function valForm(){
            const formRules = document.getElementById("zonecreationform");
            let formData = new FormData();
        
            // Check formElements if at least a name exists and then sends data
            for (let i = 0; i < formRules.elements.length - 1; i++) {
                 let input = formRules.elements[i];
                
                 console.log(input.name);
                 if(input.value == "" || input.value == "selected"){
                    alert("All fields must be filled out.");
                    return false;
                 }
                 else if(input.name.includes("actuator") ){
                    formData.append(input.name,input.value);
                    formData.append(input.name + "State","OFF");
                 }
                 
                 else {
                     formData.append(input.name,input.value);
                 } 
                 //console.log(formData);
            //     alert(formData);
            }
            let numElems = {};
            let sensorsData = {};
            let alertsData = {};
            let actuatorsData = {};

            for (const [key, value] of formData.entries()) {
                if(key.includes("numSens") || key.includes("numActs")){
                    numElems[key] = value;
                }
                if(key.includes("sensor")){
                    sensorsData[key] = value;
                }
                else if(key.includes("alert")){
                    alertsData[value] = value;
                }
                else if(key.includes("actuator")){
                    actuatorsData[key] = value;
                }
            }
            const zoneName = formData.get("zoneName");
            // console.log(typeof zoneName);
            // // const jsonString = JSON.stringify(jsonData);
            const stringZone = "/ESP" + zoneName;
            console.log(stringZone);
            let arrayZones = ["sensors","alerts","actuators"];
            
            console.log(arrayZones[0]);
            
            //console.log(subpath);
            const dbPath = ref(db,stringZone);
            const dbPathSensors = ref(db,stringZone + "/"+ arrayZones[0]);
            const dbPathAlerts = ref(db,stringZone + "/" + arrayZones[1]);
            const dbPathActuators = ref(db,stringZone + "/"+ arrayZones[2]);
            set(dbPath,numElems);
            set(dbPathSensors,sensorsData);
            set(dbPathAlerts,alertsData);
            set(dbPathActuators,actuatorsData);

            const routesPath = ref(db,"routes");
            let routeObj = {};
            let key = Math.floor(Math.random() * Math.pow(10, 8));
            routeObj[key] = zoneName;
            
            // Check if value exists, if does then appends new value and if doesn't create the table
            let locationExists = false;
            onValue(routesPath,(snapshot)  => {
                if (snapshot.exists() && !locationExists){
                    console.log("Location exists, updating...");
                    locationExists = true;
                    let data = snapshot.val();
                    Object.assign(data,routeObj);
                    console.log(data);
                    set(routesPath,data);
                    off(routesPath);
                    return;
                }
                if(!snapshot.exists() && !locationExists){
                    console.log("Location doesnt exist, creating new one...");
                    locationExists = true;
                    let data = {};
                    Object.assign(data,routeObj);
                    set(routesPath,data);
                    off(routesPath);
                    return;
                }
            });
            //TODO: Alert and then put all formData to previous state,blank or unselected  
        }
        document.getElementById("addDetails").addEventListener("click",()=>{
            console.log("hurray");
            valForm();
        });
        
        const zoneExists = document.getElementById("zoneName");
        const numSens = document.getElementById("numSens");
        const numActs = document.getElementById("numActs");
        const sensorsFields = document.getElementById("sensorsFields");
        const actuatorsFields = document.getElementById("actuatorsFields");
        
        //TODO validate alerts
        function alertValidation(alertArray){
            if (alertArray.length() === 2){

            }
        }
        function selectAlerts(selectClass,divOptions){
            // strVal();
            selectClass.addEventListener("change", () => {
                divOptions.innerHTML = "";
                let alertArray = [];
                if(selectClass.value ==="selected"){
                    return;
                }
                else if(selectClass.value === "range"){
                    const newLabMinValue = document.createElement("label");
                    newLabMinValue.innerHTML = "Min Value" + ":";
    
                    const newMinValue = document.createElement("input");
                    newMinValue.id = "alertMinValueId";
                    alertArray.push(newMinValue.id);
                    newMinValue.type = "number";
                    newMinValue.className ="alertSenValMin";
                    newMinValue.name = "alertMinValue";
    
                    const newLabMaxValue = document.createElement("label");
                    newLabMaxValue.innerHTML = "Max Value" + ":";
    
                    const newMaxValue = document.createElement("input");
                    newMaxValue.id = "alertMaxValueId";
                    alertArray.push(newMaxValue.id);
                    newMaxValue.type = "number";
                    newMaxValue.className ="alertSenValMax";
                    newMaxValue.name = "alertMaxValue";
    
                    divOptions.appendChild(newLabMinValue);
                    divOptions.appendChild(newMinValue);
                    divOptions.appendChild(newLabMaxValue);
                    divOptions.appendChild(newMaxValue);
                    return alertArray;
                }
                else if(selectClass.value === "below") {
                    const newLabAlertValue = document.createElement("label");
                    newLabAlertValue.innerHTML = "Alert Value" + ":";
    
                    const newAlertValue = document.createElement("input");
                    newAlertValue.setAttribute("class","alertValueBelowId");
                    alertArray.push(newAlertValue.className);
    
                    newAlertValue.type = "number";
                    newAlertValue.className ="alertSenVal";
                    newAlertValue.name = "alertValue";
                    divOptions.appendChild(newLabAlertValue);
                    divOptions.appendChild(newAlertValue);
                    return alertArray;
                }
                else if(selectClass.value === "above"){
                    const newLabAlertValue = document.createElement("label");
                    newLabAlertValue.innerHTML = "Alert Value" + ":";
    
                    const newAlertValue = document.createElement("input");
                    newAlertValue.setAttribute("class","alertValueAboveId");
                    alertArray.push(newAlertValue.className);
    
                    newAlertValue.type = "number";
                    newAlertValue.className ="alertSenVal";
                    newAlertValue.name = "alertValue";
                    divOptions.appendChild(newLabAlertValue);
                    divOptions.appendChild(newAlertValue);
                    return alertArray;
                }
            });
        }
        
        //TODO: Validate just numbers and letters
        //Validation Function /^[A-Za-z0-9]{0,20}$/
        // function strVal() {
        //     let strValClass = document.getElementsByClassName("strVal");
        //     for (let i = 0; i < strValClass.length; i++) {
        //         strValClass[i].addEventListener("input", function (e) {
        //             let value = e.target.value;
        //             let regex = new RegExp(/^[A-Za-z0-9]{0,20}$/);
        //             if (!regex.test(value)) {
        //                 e.target.value = value.slice(0, -1);
        //             }
        //         });
        //     }
        // }
        
        //TODO: Zone exists()
        zoneExists.addEventListener("change",()=>{
            
        });

        numSens.addEventListener("change",()=>{
            // strVal();
            sensorsFields.innerHTML = "";
            let numSensors = parseInt(numSens.value);
            console.log(numSensors);
            if (isNaN(numSensors)) {
                numSensors = 0;
            }
            for (let i = 0; i < numSensors; i++) {
                // Create a new label
                const newLabelName = document.createElement("label");
                newLabelName.innerHTML = "Sensor Name" + (i + 1) + ":";

                // Create a new sensor with name and normal value
                const newInputName = document.createElement("input");
                newInputName.type = "text";
                newInputName.className ="senNam";
                newInputName.name = "sensorName" + (i + 1);

                const newLabInputValue = document.createElement("label");
                newLabInputValue.innerHTML = "Normal Value" + ":";

                const newInputValue = document.createElement("input");
                newInputValue.type = "number";
                newInputValue.className ="senVal";
                newInputValue.name = "sensorNormalValue" + (i+1);

                // // Create measurement unit
                // const newMeas = document.createElement("label");
                // newMeas.innerHTML = "Measurement Unit" + ":";

                // const newMeasInput = document.createElement("input");
                // newMeasInput.type = "text";
                // newMeasInput.className ="senVal";
                // newMeasInput.name = "sensorMeasUnit" + (i+1);

                // Select with options to define alert or normal range of behaviour
                const newSelectLabel = document.createElement("label");
                newSelectLabel.innerHTML = "Select an option that fits best for one value or a range";
                
                const newSelect = document.createElement("select");
                newSelect.setAttribute("class","alertOption");
                //newSelect.name ="alertOption"

                // Select creation
                const newOptSel = document.createElement("option");
                newOptSel.setAttribute("class", "optDefault") ;
                newOptSel.setAttribute("selected","selected");
                newOptSel.setAttribute("value","selected");
                newOptSel.appendChild(document.createTextNode("Pick an option"));
                
                const newOpt1 = document.createElement("option");
                newOpt1.setAttribute("class","belowValue");
                
                newOpt1.setAttribute("value","below");
                
                newOpt1.appendChild(document.createTextNode("Alert when below normal value"));

                const newOpt2 = document.createElement("option");
                newOpt2.setAttribute("class","aboveValue");
                
                newOpt2.setAttribute("value","above");
                newOpt2.appendChild(document.createTextNode("Alert when above normal value above"));

                const newOpt3 = document.createElement("option");
                newOpt3.setAttribute("class","rangeValue");
                
                newOpt3.setAttribute("value","range");
                newOpt3.appendChild(document.createTextNode("Create a range of normal behaviour values"));

                newSelect.appendChild(newOptSel);
                newSelect.appendChild(newOpt1);
                newSelect.appendChild(newOpt2);
                newSelect.appendChild(newOpt3);
                
                const divOptions = document.createElement("div");
                divOptions.setAttribute("class","divOptions");
                // Append the label and input to the sensorsFields div
                sensorsFields.appendChild(newLabelName);
                sensorsFields.appendChild(newInputName);
                sensorsFields.appendChild(newLabInputValue);
                sensorsFields.appendChild(newInputValue);
                // sensorsFields.appendChild(newMeas);
                // sensorsFields.appendChild(newMeasInput);
                sensorsFields.appendChild(newSelectLabel);
                sensorsFields.appendChild(newSelect);
                sensorsFields.appendChild(divOptions);
            }
            // call function to detect changes in the select
            let selectClass = document.getElementsByClassName("alertOption");
            let divOptions = document.getElementsByClassName("divOptions");
            for (let i = 0; i < selectClass.length; i++) {
                for(let j = 0; j < divOptions.length; j++){
                    selectAlerts(selectClass[j],divOptions[j]);
                } 
            }
            
         });

         // Actuators creation
        numActs.addEventListener("change",()=>{
            // strVal();
            actuatorsFields.innerHTML = "";
            let numActuators = parseInt(numActs.value);
            console.log(numActuators);
            if (isNaN(numActuators)) {
                numActuators = 0;
            }

            for (let i = 0; i < numActuators; i++) {
                // Create a new label
                const newLabelName = document.createElement("label");
                newLabelName.innerHTML = "Actuator Name" + (i + 1) + ":";

                // Create a new input
                const newInputName = document.createElement("input");
                newInputName.type = "text";
                newInputName.className ="strVal";
                newInputName.name = "actuatorName" + (i + 1);

                // Append the label and input to the actuatorsFields div
                actuatorsFields.appendChild(newLabelName);
                actuatorsFields.appendChild(newInputName);
            }
        });   

})();