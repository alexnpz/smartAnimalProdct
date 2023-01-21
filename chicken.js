import { getDatabase, ref,set, onValue, update,off,remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

var app = (function() {
    const db = getDatabase();
    const spaSendFb = {
        'lux': [0,1],
        'door_servo': 1, //Door ChickenCoop
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
        'door_servo_third': 1, // Door SheepFold
        'fan': [0,1]                
    };

    let selZoneEdit = document.getElementById("optElem");
    selZoneEdit.addEventListener("change",() =>{
        let selVal = selZoneEdit.value;
        switch(selVal){
            case "selected":
                //Do "nothing"
                document.getElementById("zoneElem").innerHTML = "";
                break;
            case "add":
                // Create 2 inputs specifying numbers of sensors & actuators, then each one, then values and submit -> See form.js    
                document.getElementById("zoneElem").innerHTML = "";
                zoneAdd();
                break;
            case "remove":
                document.getElementById("zoneElem").innerHTML = "";
                zoneEdit();
                break;
                // Show all sensors & actuators taken from database, with a checkbox and create submit button
                // After submit, verify checkbox marked, those marked send 0 to SPAFirebase to disconnect element
                // Also submit, delete HTML elements related with those marked 
        }
    });

    function zonEditSection (){
        const divZoneElem = document.getElementById("zoneElem");
        // Create form
        const zoneEditForm = document.createElement("form");
        zoneEditForm.setAttribute("id","zoneEditForm");
        zoneEditForm.setAttribute("class","formRules");
        divZoneElem.appendChild(zoneEditForm);

        //Create div row
        const divRowElem = document.createElement("div");
        divRowElem.setAttribute("id","divRowElem");
        divRowElem.setAttribute("class","row");
        zoneEditForm.appendChild(divRowElem);
        // Create Column Sensor
        const divColSens = document.createElement("div");
        divColSens.setAttribute("id","divColSens");
        divColSens.setAttribute("class","col");
        divRowElem.appendChild(divColSens);
        // Create Label Sensors
        const labSens = document.createElement("div");
        divColSens.appendChild(labSens);
        const labSensText = document.createTextNode("Sensors");
        labSens.appendChild(labSensText);

        // Create Column Actuator
        const divColActs = document.createElement("div");
        divColActs.setAttribute("id","divColActs");
        divColActs.setAttribute("class","col");
        divRowElem.appendChild(divColActs);

        // Create Label Actuators
        const labActs = document.createElement("div");
        divColActs.appendChild(labActs);
        const labActsText = document.createTextNode("Actuators");
        labActs.appendChild(labActsText);
    }
    
    function zoneEdit(){
        onValue(path,(snapshot)=>{
            if (snapshot.exists()){
                document.getElementById("zoneElem").innerHTML = "";
                const data = snapshot.val();
                const keysSensors = Object.keys(data.sensors);
                const keysActuators = Object.keys(data.actuators);
                
                zonEditSection();
                
                
                //console.log(data);
                // Create multiple checkbox for Sensors
                keysSensors.forEach((key) => {     
                    const checkboxContainer = document.createElement("label");
                    const checkbox = document.createElement("input");
                    checkbox.setAttribute("type","checkbox");
                    checkboxContainer.appendChild(checkbox);
                    const checkboxText = document.createTextNode(key);
                    checkboxContainer.appendChild(checkboxText);
                    divColSens.appendChild(checkboxContainer);

                    //console.log(`${key}: ${data[key]}`);
                });
                // Create multiple checkbox for Sensors
                keysActuators.forEach((key) => {
                    const checkboxContainer = document.createElement("label");
                    const checkbox = document.createElement("input");
                    checkbox.setAttribute("type","checkbox");
                    checkboxContainer.appendChild(checkbox);
                    const checkboxText = document.createTextNode(key);
                    checkboxContainer.appendChild(checkboxText);
                    divColActs.appendChild(checkboxContainer);
                });
                // Create submit button of form
                const btnZoneEdit = document.createElement("input");
                btnZoneEdit.setAttribute("id","zoneFormBtn");
                btnZoneEdit.setAttribute("type","button");
                btnZoneEdit.setAttribute("value","Submit");
                zoneEditForm.appendChild(btnZoneEdit);
                    //console.log(data.key);         
                let btZnEdit = document.getElementById("zoneFormBtn");
                const checkboxes = document.querySelectorAll("input[type='checkbox']");
                for (let i = 0; i < checkboxes.length; i++) {
                    checkboxes[i].addEventListener("change", function(event) {
                        if (this.checked) {
                            this.setAttribute("checked", true);
                        } else {
                            this.removeAttribute("checked");
                        }
                    });
                }
                
                btZnEdit.addEventListener("click",() =>{
                    const pathSPA = ref(db,"/spaFirebase");
                    const checkedCheckboxes = document.querySelectorAll("input[type='checkbox'][checked]");
                    let newSpaFirebase = {};
                    for (let i = 0; i < checkedCheckboxes.length; i++) {
                        let parent = checkedCheckboxes[i].parentNode;
                        let keyText = parent.textContent;
                        newSpaFirebase[keyText] = "0";
                        }
                    //console.log(newSpaFirebase);
                    update(pathSPA,newSpaFirebase)
                    // use remove to sensor, fi was then use remove
                    off(pathSPA);
                    });
                }  
            }

        );
    }

    // function selectAlerts(selectClass,divOptions){
    //     strVal();
    //     selectClass.addEventListener("change", () => {
    //         divOptions.innerHTML = "";
    //         let alertArray = [];
    //         if(selectClass.value ==="selected"){
    //             return false;
    //         }
    //         else if(selectClass.value === "range"){
    //             const newLabMinValue = document.createElement("label");
    //             newLabMinValue.innerHTML = "Min Value" + ":";

    //             const newMinValue = document.createElement("input");
    //             newMinValue.type = "number";
    //             newMinValue.className ="alertSenValMin";
    //             newMinValue.name = "alertMinValue";
    //             alertArray.push(newMinValue.className);

    //             const newLabMaxValue = document.createElement("label");
    //             newLabMaxValue.innerHTML = "Max Value" + ":";

    //             const newMaxValue = document.createElement("input"); 
    //             newMaxValue.type = "number";
    //             newMaxValue.className ="alertSenValMax";
    //             newMaxValue.name = "alertMaxValue";
    //             alertArray.push(newMaxValue.className);

    //             divOptions.appendChild(newLabMinValue);
    //             divOptions.appendChild(newMinValue);
    //             divOptions.appendChild(newLabMaxValue);
    //             divOptions.appendChild(newMaxValue);
    //             return alertArray;
    //         }
    //         else if(selectClass.value === "below") {
    //             const newLabAlertValue = document.createElement("label");
    //             newLabAlertValue.innerHTML = "Alert Value" + ":";

    //             const newAlertValue = document.createElement("input");
        
    //             newAlertValue.type = "number";
    //             newAlertValue.className ="alertSenVal";
    //             alertArray.push(newAlertValue.className);
    //             newAlertValue.name = "alertValue";
    //             divOptions.appendChild(newLabAlertValue);
    //             divOptions.appendChild(newAlertValue);
    //             return alertArray;
    //         }
    //         else if(selectClass.value === "above"){
    //             const newLabAlertValue = document.createElement("label");
    //             newLabAlertValue.innerHTML = "Alert Value" + ":";

    //             const newAlertValue = document.createElement("input");
               
    //             newAlertValue.type = "number";
    //             newAlertValue.className ="alertSenVal";
    //             newAlertValue.name = "alertValue";
    //             alertArray.push(newAlertValue.className);
    //             divOptions.appendChild(newLabAlertValue);
    //             divOptions.appendChild(newAlertValue);
    //             return alertArray;
    //         }
    //     });
    // }
    const path = ref(db,"ESPChicken");
    function zoneAdd(){ 
        zonEditSection();
        const numSens = document.createElement("input");
        numSens.setAttribute("id","numSensId");
        numSens.setAttribute("type","number");
        numSens.setAttribute("placeholder","Introduce number of sensors");
        divColSens.appendChild(numSens);

        const numActs = document.createElement("input");
        numActs.setAttribute("id","numActsId");
        numActs.setAttribute("type","number");
        numActs.setAttribute("placeholder","Introduce number of actuators");
        divColActs.appendChild(numActs);

        const numSensId = document.getElementById("numSensId");
        const numActsId = document.getElementById("numActsId");
        //TODO, create new div row, 2 div col with Ids divColSensAdd & divColActsAdd
        const divRowAdd = document.createElement("div");
        divRowAdd.setAttribute("id","divRowAdd");
        divRowAdd.setAttribute("class","row");
        zoneEditForm.appendChild(divRowAdd);

        const divColSensAdz = document.createElement("div");
        divColSensAdz.setAttribute("id","divColSensAdd");
        divColSensAdz.setAttribute("class","col");
        divRowAdd.appendChild(divColSensAdz);

        const divColActsAdz = document.createElement("div");
        divColActsAdz.setAttribute("id","divColActsAdd");
        divColActsAdz.setAttribute("class","col");
        divRowAdd.appendChild(divColActsAdz);

        const divColSensAdd = document.getElementById("divColSensAdd");
        const divColActsAdd = document.getElementById("divColActsAdd");
        // Sensors creation
        numSensId.addEventListener("change",()=>{
            // strVal();
            divColSensAdd.innerHTML = "";
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
                newSelect.id = "alertOption";
                newSelect.name ="alertOption"

                // Select creation
                const newOptSel = document.createElement("option");
                newOptSel.class = "optDefault";
                newOptSel.setAttribute("selected","selected");
                newOptSel.setAttribute("value","selected");
                newOptSel.appendChild(document.createTextNode("Pick an option"));
                
                const newOpt1 = document.createElement("option");
                newOpt1.className = "belowValue";
                
                newOpt1.setAttribute("value","below");
                
                newOpt1.appendChild(document.createTextNode("Alert when below normal value"));

                const newOpt2 = document.createElement("option");
                newOpt2.className = "aboveValue";
                
                newOpt2.setAttribute("value","above");
                newOpt2.appendChild(document.createTextNode("Alert when above normal value above"));

                const newOpt3 = document.createElement("option");
                newOpt3.className = "rangeValue";
                
                newOpt3.setAttribute("value","range");
                newOpt3.appendChild(document.createTextNode("Create a range of normal behaviour values"));

                newSelect.appendChild(newOptSel);
                newSelect.appendChild(newOpt1);
                newSelect.appendChild(newOpt2);
                newSelect.appendChild(newOpt3);
                
                const divOptions = document.createElement("div");
                divOptions.className = "divOptions";
                // Append the label and input to the divColSensAdd div
                divColSensAdd.appendChild(newLabelName);
                divColSensAdd.appendChild(newInputName);
                divColSensAdd.appendChild(newLabInputValue);
                divColSensAdd.appendChild(newInputValue);
                // divColSensAdd.appendChild(newMeas);
                // divColSensAdd.appendChild(newMeasInput);
                divColSensAdd.appendChild(newSelectLabel);
                divColSensAdd.appendChild(newSelect);
                divColSensAdd.appendChild(divOptions);

            }
            // call function to detect changes in the select
            let selectClass = document.getElementById("alertOption");
            let divOptions = document.querySelectorAll("divOptions");
            //console.log(selectClass);
            // selectClass.addEventListener("change",() => {
            //     console.log(selectClass);
            //     console.log(divOptions);
            // });
            //selectAlerts(selectClass,divOptions);
         });
         // Actuators creation
        numActsId.addEventListener("change",()=>{
            // strVal();
            divColActsAdd.innerHTML = "";
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
                newInputName.className ="actNam";
                newInputName.name = "actuatorName" + (i + 1);

                // Append the label and input to the divColActsAdd div
                divColActsAdd.appendChild(newLabelName);
                divColActsAdd.appendChild(newInputName);
            }
        });

        // Create submit button of form
        const btnZoneEdit = document.createElement("input");
        btnZoneEdit.setAttribute("id","zoneFormBtn");
        btnZoneEdit.setAttribute("type","button");
        btnZoneEdit.setAttribute("value","Submit");
        zoneEditForm.appendChild(btnZoneEdit);
        let btZnEdit = document.getElementById("zoneFormBtn");

        //Capture event onSubmit
        btZnEdit.addEventListener("click",() =>{
            const senNams = document.getElementsByClassName("senNam");
            const senVals = document.getElementsByClassName("senVal");
            const numActs = document.getElementsByClassName("numActs");
            console.log(senNams);
            //const alertVals = document.getElementsByClassName("alertVal");
        //     let newElems = {};
        //     let newAlertDef = {};
        //     let sensName = "";
        //     let normValue = "";
        //     for (let i = 0; i < formAdd.elements.length - 1; i++) {
        //         let input = formAdd.elements[i];
               
        //         console.log(input.name);
        //         if(input.value == "" || input.value == "selected"){
        //            alert("All fields must be filled out.");
        //            return false;
        //         }
        //         else if(input.name.includes("actuator") ){
        //            newElems[input.value] ="OFF";
        //         }
                
        //         else if(input.name.includes("sensorName") ) {
        //             let sensName = input.value;
        //         }
                
                
        //         //console.log(formData);
        //    //     alert(formData);
        //    }
            //console.log(newSpaFirebase);
            const path = ref(db,"/ESPChicken");
            update(path,updateChicken)
            off(path);
        });
        

    }
    
    const controlOptions = {
        'servoDoorNight' : 'Front Door',
        'minerals' : 'Minerals Motor',
        'fan' : 'Fan',
        'temperature': 'Temperature',
        'humidity': 'Humidity',
        'waterQ': 'Water Quality',
        'motorFood' : 'Food Motor',
        'lux' : 'Light',
        'buzzer' : 'Buzzer', 
    };

    // Create js-array and if necessary, create possibility to add using web (later)
    // String array with path for every system associated with areas
    const elemsSystems = ['/ESPChicken/sensors/','/ESPChicken/actuators/'];
   // const dir = ref (db, systSelected);
   // TODO: Door Opening in the morning -> SetInterval min + API request + sendToFirebase

   // TODO: Door Closing in the afternoon -> SetInterval 5 min + API request +sendToFirebase

//    async function doorControl (){
//     let doorControl = document.getElementById("servoDoorNight");
//     // let response = await fetch('https://www.boredapi.com/api/activity?type=' + idActivity[selectionValue]);
//     // let data = await response.json();

//    }
   let areaChickenId = document.getElementById("areaChickenId");
   let alertChickenId = document.getElementById("alertChickenId");
   function visualizeArea(){
    let getElems = "/ESPChicken";
        const path = ref(db,getElems);
        onValue(path,(snapshot) =>{
            if(snapshot.exists()){
                areaChickenId.innerHTML = "";
                alertChickenId.innerHTML = "";
                const data = snapshot.val();
                const sensorsArrays = Object.entries(data.sensors);
                const actuatorsArrays = Object.entries(data.actuators);
                console.log(sensorsArrays.length);
                let senObj = {};
                let actObj = {};
                //Area, show sensors and their values
                for(let i = 0; i < sensorsArrays.length; i++){
                    const outerDiv = document.createElement("div");
                    outerDiv.setAttribute("class","d-flex mt-1");
                    const leftMostDiv = document.createElement("div");
                    const leftStrCnt = document.createElement("strong");
                    leftStrCnt.append(sensorsArrays[i][0]);
                    const centDiv = document.createElement("div");
                    centDiv.setAttribute("class","hstack gap-2 ms-auto")
                    const rightMostDiv = document.createElement("div");
                    areaChickenId.appendChild(outerDiv);
                    outerDiv.appendChild(leftMostDiv);
                    outerDiv.appendChild(centDiv);
                    centDiv.appendChild(rightMostDiv);
                    leftMostDiv.append(leftStrCnt);
                    rightMostDiv.append(sensorsArrays[i][1]);
                    
                }
                // Alerts, here create SetInterval with CSS Properties in red for Alerts and SetTimeout for actuators
                // Alerts, check alertOption and check vs value
                // check if actuatorsArrays[i][1] =="OFF" ,then not visualize
                for(let i = 0; i < actuatorsArrays.length; i++){
                    if(actuatorsArrays[i][1] === "ON"){
                        const outerDiv = document.createElement("div");
                        outerDiv.setAttribute("class","d-flex mt-1");
                        const leftMostDiv = document.createElement("div");
                        const leftStrCnt = document.createElement("strong");
                        leftStrCnt.append(actuatorsArrays[i][0]);
                        const centDiv = document.createElement("div");
                        centDiv.setAttribute("class","hstack gap-2 ms-auto")
                        const rightMostDiv = document.createElement("div");
                        alertChickenId.appendChild(outerDiv);
                        outerDiv.appendChild(leftMostDiv);
                        outerDiv.appendChild(centDiv);
                        centDiv.appendChild(rightMostDiv);
                        leftMostDiv.append(leftStrCnt);
                        rightMostDiv.append(actuatorsArrays[i][1]);
                    }  
                }
            }
        });
   }
   visualizeArea();

//    function getFbValues(systSelected){
//         const path = ref(db,systSelected);
//         onValue(path,(snapshot)=>{
//             if (snapshot.exists()){
//                 const data = snapshot.val();
//                 const keys = Object.keys(data);
//                 //console.log(data);
//                 keys.forEach((key,index) => {
//                     const id = '#'+ key;
//                     let controlOptVal = controlOptions[key];
//                     //console.log(controlOptVal);
//                     //console.log(data[key]);
                
//                     if(key ==='temperature' && (data[key] > 30 || data[key] < 20)){
//                         $('#temperaturemsg').text('YES');
                        
//                     } else if (key ==='temperature' && (data[key] < 30 || data[key] > 20) ){
//                         $('#temperaturemsg').text('NO');
//                     }
//                     else if (key ==='humidity' && (data[key] > 85 || data[key] < 25) ){
//                         $('#humiditymsg').text('YES');
//                     }
//                     else if (key ==='humidity' && (data[key] < 85 || data[key] > 25) ){
//                         $('#humiditymsg').text('NO');
//                     }
//                     $(id).text(data[key]);
//                     // CODE TO ALTER
//                     if (systSelected.includes('sensors')){
//                         $('#sensors').append('<option value="' + index + '">' + controlOptVal + '</option>');
//                     } else{
//                         $('#actuators').append('<option value="' + index + '">' + controlOptVal + '</option>');
//                         }
//                     //console.log(`${key}: ${data[key]}`);
//                 });
//                     // END OF CODE TO ALTER
//                     //console.log(data.key);         
//                 }  
//             }  
//         );
//     }
    
//    getFbValues(elemsSystems[0]);
//    getFbValues(elemsSystems[1]);
        
    
    //Control Panel add&remove visualization with use of add/remove to Firebase
    // Send add/remove to Firebase
    // function sendFbValues (spaSendFb,dbDir) {
    //     const path = ref(db,dbDir);
    //     const postFirebase = set(path, spaSendFb);
        
    // }

    //sendFbValues(spaSendFb,'/spaFirebase'); //-> rulesControl adapt
    
    function rulesControl(id,pathFile){
        let formRules = document.getElementById(id);
        let formData = {};
        for (let i = 0; i < formRules.elements.length - 1; i++) {
            let input = formRules.elements[i];
            
            console.log(input.name);
            if (input.value == "" || input.value == "selected" ){
                alert("All fields must be filled out.");
                return false;
            }
            else{
                formData[input.name] = input.value
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

    document.getElementById("btnSaveRulesChicken").addEventListener("click", () => rulesControl("chickencoopform","/rulesChicken"));    
   

    
})();