import { getDatabase, ref,set,onValue,off} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

var app = (function() {
        const db = getDatabase();
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

            let jsonData = {};
            for (const [key, value] of formData.entries()) {
                jsonData[key] = value;
                
            }
            console.log(jsonData);
            const zoneName = formData.get("zoneName");
            // console.log(typeof zoneName);
            // // const jsonString = JSON.stringify(jsonData);
            const stringZone = "/ESP" + zoneName;
            console.log(stringZone);
            // TODO: Create 3 childs: sensors, alerts and actuators

            const dbPath = ref(db,stringZone);
            
            set(dbPath, jsonData);
            const routesPath = ref(db,"routes");
            let routeObj = {};
            let key = Math.floor(Math.random() * Math.pow(10, 8));
            routeObj[key] = zoneName;
            // set(routesPath,zoneName);
            
            // Check if value exists, if does then appends new value and if doesn't create the table
            let locationExists = false;
            onValue(routesPath,(snapshot)  => {
                if (snapshot.exists() && !locationExists){
                    console.log("Location exists");
                    locationExists = true;
                    let data = snapshot.val();
                    Object.assign(data,routeObj);
                    console.log(data);
                    set(routesPath,data);
                    off(routesPath);
                    return;
                }
                if(!snapshot.exists() && !locationExists){
                    console.log("Location doesnt exist");
                    locationExists = true;
                    let data = {};
                    Object.assign(data,routeObj);
                    set(routesPath,data);
                    off(routesPath);
                    return;
                }
            });   
        }
        document.getElementById("addDetails").addEventListener("click",()=>{
            console.log("hurray");
            valForm();
        });
        
        const numSens = document.getElementById("numSens");
        const numActs = document.getElementById("numActs");
        const sensorsFields = document.getElementById("sensorsFields");
        const actuatorsFields = document.getElementById("actuatorsFields");
        
        //TODO validate alerts
        function alertValidation(alertArray){
            if (alertArray.length() === 2){

            }
        }
        function selectAlerts(selectId,divOptions){
            // strVal();
            selectId.addEventListener("change", () => {
                divOptions.innerHTML = "";
                let alertArray = [];
                if(selectId.value ==="selected"){
                    return;
                }
                else if(selectId.value === "range"){
                    const newLabMinValue = document.createElement("label");
                    newLabMinValue.innerHTML = "Min Value" + ":";
    
                    const newMinValue = document.createElement("input");
                    newMinValue.id = "alertMinValueId";
                    alertArray.push(newMinValue.id);
                    newMinValue.type = "number";
                    newMinValue.className ="numbVal";
                    newMinValue.name = "sensorMinValue";
    
                    const newLabMaxValue = document.createElement("label");
                    newLabMaxValue.innerHTML = "Max Value" + ":";
    
                    const newMaxValue = document.createElement("input");
                    newMaxValue.id = "alertMaxValueId";
                    alertArray.push(newMaxValue.id);
                    newMaxValue.type = "number";
                    newMaxValue.className ="numbVal";
                    newMaxValue.name = "sensorMaxValue";

                    divOptions.appendChild(newLabMinValue);
                    divOptions.appendChild(newMinValue);
                    divOptions.appendChild(newLabMaxValue);
                    divOptions.appendChild(newMaxValue);
                    return alertArray;
                }
                else if(selectId.value === "below") {
                    const newLabAlertValue = document.createElement("label");
                    newLabAlertValue.innerHTML = "Alert Value" + ":";
    
                    const newAlertValue = document.createElement("input");
                    newAlertValue.id = "alertValueBelowId";
                    alertArray.push(newAlertValue.id);

                    newAlertValue.type = "number";
                    newAlertValue.className ="numbVal";
                    newAlertValue.name = "sensorAlertValue";
                    divOptions.appendChild(newLabAlertValue);
                    divOptions.appendChild(newAlertValue);
                    return alertArray;
                }
                else if(selectId.value === "above"){
                    const newLabAlertValue = document.createElement("label");
                    newLabAlertValue.innerHTML = "Alert Value" + ":";
    
                    const newAlertValue = document.createElement("input");
                    newAlertValue.id = "alertValueAboveId";
                    alertArray.push(newAlertValue.id);

                    newAlertValue.type = "number";
                    newAlertValue.className ="numbVal";
                    newAlertValue.name = "sensorAlertValue";
                    divOptions.appendChild(newLabAlertValue);
                    divOptions.appendChild(newAlertValue);
                    return alertArray;
                }
            });
        }
        
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
                newInputName.name = "sensorName" + (i + 1);

                const newLabInputValue = document.createElement("label");
                newLabInputValue.innerHTML = "Normal Value" + ":";

                const newInputValue = document.createElement("input");
                newInputValue.type = "number";
                newInputValue.className ="numbVal";
                newInputValue.name = "sensorNormalValue" + (i+1);

                // Create measurement unit
                const newMeas = document.createElement("label");
                newMeas.innerHTML = "Measurement Unit" + ":";

                const newMeasInput = document.createElement("input");
                newMeasInput.type = "text";
                newMeasInput.className ="numbVal";
                newMeasInput.name = "sensorMeasUnit" + (i+1);

                // Select with options to define alert or normal range of behaviour
                const newSelectLabel = document.createElement("label");
                newSelectLabel.innerHTML = "Select an option that fits best for one value or a range";
                
                const newSelect = document.createElement("select");
                newSelect.id = "alertOption";
                newSelect.name ="alertOption"

                // Select creation
                const newOptSel = document.createElement("option");
                newOptSel.id = "optDefault";
                newOptSel.setAttribute("selected","selected");
                newOptSel.setAttribute("value","selected");
                newOptSel.appendChild(document.createTextNode("Pick an option"));
                
                const newOpt1 = document.createElement("option");
                newOpt1.id = "belowValue";
                
                newOpt1.setAttribute("value","below");
                
                newOpt1.appendChild(document.createTextNode("Alert when below normal value"));

                const newOpt2 = document.createElement("option");
                newOpt2.id = "aboveValue";
                
                newOpt2.setAttribute("value","above");
                newOpt2.appendChild(document.createTextNode("Alert when above normal value above"));

                const newOpt3 = document.createElement("option");
                newOpt3.id = "rangeValue";
                
                newOpt3.setAttribute("value","range");
                newOpt3.appendChild(document.createTextNode("Create a range of normal behaviour values"));

                newSelect.appendChild(newOptSel);
                newSelect.appendChild(newOpt1);
                newSelect.appendChild(newOpt2);
                newSelect.appendChild(newOpt3);
                
                const divOptions = document.createElement("div");
                divOptions.id = "divOptions";
                // Append the label and input to the sensorsFields div
                sensorsFields.appendChild(newLabelName);
                sensorsFields.appendChild(newInputName);
                sensorsFields.appendChild(newLabInputValue);
                sensorsFields.appendChild(newInputValue);
                sensorsFields.appendChild(newMeas);
                sensorsFields.appendChild(newMeasInput);
                sensorsFields.appendChild(newSelectLabel);
                sensorsFields.appendChild(newSelect);
                sensorsFields.appendChild(divOptions);

            }
            // call function to detect changes in the select
            let selectId = document.getElementById("alertOption");
            let divOptions = document.getElementById("divOptions");
            selectAlerts(selectId,divOptions);
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