import { getDatabase, ref, onValue, update,off,remove} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {doorAPI} from "./doorCont.js"
var app = (function() {
    const db = getDatabase();
    
    const doorC = doorAPI();
    
    function toggleHideShow(){
        let areaId = document.getElementById("areaId");
        let alertsId = document.getElementById("alertsId");
        let rulesId = document.getElementById("rulesId");
        
        if (areaId.style.display === "none") {
            areaId.style.display = "block";
        } else {
            areaId.style.display = "none";
        }
        if (alertsId.style.display === "none") {
            alertsId.style.display = "block";
        } else {
            alertsId.style.display = "none";
        }
        if (rulesId.style.display === "none") {
            rulesId.style.display = "block";
        } else {
            rulesId.style.display = "none";
        }
        if (editZoneId.style.display === "none") {
            editZoneId.style.display = "block";
        } else {
            editZoneId.style.display = "none";
        }

    }
    
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
    let editZoneId = document.getElementById("zoneElem");
    let selZoneEdit = document.getElementById("optElem");
    function visualizeArea(optPick){
        const pathName = 'ESP' + optPick;
        const path = ref(db,pathName);
        onValue(path,(snapshot) =>{
            if(snapshot.exists()){
                areaId.innerHTML = "";
                alertsId.innerHTML = "";
                const data = snapshot.val();
                const sensorsArrays = Object.entries(data.sensors);
                const actuatorsArrays = Object.entries(data.actuators);
                //console.log(sensorsArrays.length);
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
                    areaId.appendChild(outerDiv);
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
                        alertsId.appendChild(outerDiv);
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
    function rulesZone(optPick){
        const pathName = 'ESP' + optPick;
        const path = ref(db,pathName);
        rulesId.innerHTML = "";
        onValue(path,(snapshot) => {
            if(snapshot.exists()){
            // rulesId.innerHTML = "";
                
                const data = snapshot.val();
                
                const keysAlerts = Object.keys(data.alerts);
                
                const alertsVals = Object.values(data.alerts);
                const alertsDB = Object.entries(data.alerts);
                console.log(alertsVals);
                console.log(alertsVals[0].alertOption);
                
                const divRowLabels = document.createElement("div");
                divRowLabels.setAttribute("class"," row d-flex mt-1");
                const divColPar = document.createElement("div");
                divColPar.setAttribute("class","col");
                const divColAct = document.createElement("div");
                divColAct.setAttribute("class","col hstack gap-2 ms-auto");
                const colParText = document.createTextNode("Parameter");
                const colParAction = document.createTextNode("Action");
                const divColParAction = document.createElement("div");
                divColParAction.setAttribute("class","mx-auto");
                rulesId.appendChild(divRowLabels);
                divRowLabels.appendChild(divColPar);
                divRowLabels.appendChild(divColAct);
                divColPar.append(colParText);
                divColAct.appendChild(divColParAction);
                divColParAction.appendChild(colParAction);

                for(let i = 0; i < alertsVals.length; i++){
                    const divRowRules = document.createElement("div");
                    divRowRules.setAttribute("class"," row formRules");
                    const leftMostDiv = document.createElement("div");
                    leftMostDiv.setAttribute("class","col")
                    const leftStrCnt = document.createElement("strong");
                    //console.log(keysAlerts[i]);
                    
                    leftStrCnt.append(keysAlerts[i]);
                    leftMostDiv.append(leftStrCnt);
                    divRowRules.appendChild(leftMostDiv);
                    rulesId.appendChild(divRowRules);
                    
                    const rightMostDiv = document.createElement("div");
                    rightMostDiv.setAttribute("class","col hstack gap-2 ms-auto");
                    divRowRules.appendChild(rightMostDiv);
                    
                    if(alertsVals[i].alertOption === "range"){
                        console.log("here");
                        const minVal = document.createElement("input");
                        minVal.setAttribute("type","number");
                        minVal.setAttribute("name",keysAlerts[i]+":" + "alertMinValue");
                        minVal.setAttribute("placeholder","Current Min Value: " + alertsVals[i].alertMinValue);

                        const maxVal = document.createElement("input");
                        maxVal.setAttribute("type","number");
                        maxVal.setAttribute("name",keysAlerts[i]+":" +"alertMaxValue");
                        maxVal.setAttribute("placeholder","Current Max Value: " + alertsVals[i].alertMaxValue);

                        const divColMin = document.createElement("div")
                        divColMin.setAttribute("class","col")
                        const divColMax = document.createElement("div")
                        divColMax.setAttribute("class","col hstack gap-2 ms-auto");

                        rightMostDiv.appendChild(divColMin);
                        rightMostDiv.appendChild(divColMax);
                        divColMin.appendChild(minVal);
                        divColMax.appendChild(maxVal);
                    }
                    else{
                        const valLimit= document.createElement("input");
                        valLimit.setAttribute("type","number");
                        valLimit.setAttribute("name",keysAlerts+":" +"alertValue");
                        valLimit.setAttribute("placeholder","Current Value: " + alertsVals[i].alertValue);
                        rightMostDiv.appendChild(valLimit);
                    }

                    
                }
                const divSubm = document.createElement("div");
                divSubm.setAttribute("class","d-flex");
                rulesId.appendChild(divSubm);
                let submBtn = document.createElement("button");
                submBtn.setAttribute("id","btnSaveRules");
                submBtn.setAttribute("class","btn btn-primary float-right");
                submBtn.setAttribute("type","submit");
                let textSubBtn = document.createTextNode("Submit");
                divSubm.appendChild(submBtn);
                submBtn.append(textSubBtn); 
                const btnSaveRules = document.getElementById("btnSaveRules")
                btnSaveRules.addEventListener("click", ()=>{

                    // Form operations to get updated Object to send
                    const inputSel = document.getElementsByTagName("input");

                    const inputsByName = Array.from(inputSel)
                    .filter(input => input.value !== "")
                    .reduce((acc, input) => {
                        const [sensorType, alertType] = input.name.split(":");
                        if (!acc[sensorType]) {
                        acc[sensorType] = {};
                        }
                        acc[sensorType][alertType] = input.value;
                        return acc;
                    }, {});

                    
                    let finalObject = {
                        alerts: Object.fromEntries(
                            Object.entries(inputsByName).map(([sensorType, alerts]) => [sensorType, alerts])
                        )
                    };

                    for (let i = 0; i < alertsDB.length; i++) {
                    const sensorType = alertsDB[i][0];
                    const alertOption = alertsDB[i][1].alertOption;
                    finalObject.alerts[sensorType].alertOption = alertOption;
                }

                    console.log(finalObject.alerts.alertOption);

                    update(path, finalObject);
                    off(path);
                    alert("Successful sent info");
                    
                })

            }
        });

    }
    
    function visualizeRules(optPick,rulesId){
        rulesId.innerHTML = "";
        let getTable = "/ESP"+ optPick + arrayZones[1];
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

    // Function Removal Elements
    function zoneRemoval(optPick){
        const pathName = 'ESP' + optPick;
        const path = ref(db,pathName);
        console.log(optPick);
        onValue(path,(snapshot)=>{
            if (snapshot.exists()){
                const data = snapshot.val();
                const keysSensors = Object.keys(data.sensors);
                const keysActuators = Object.keys(data.actuators);
                console.log(keysSensors);
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
                
                // Create multiple checkbox for Sensors
                keysSensors.forEach((key) => {     
                    const checkboxContainer = document.createElement("label");
                    const checkbox = document.createElement("input");
                    checkbox.setAttribute("type","checkbox");
                    checkboxContainer.appendChild(checkbox);
                    const checkboxText = document.createTextNode(key);
                    checkboxContainer.appendChild(checkboxText);
                    divColSens.appendChild(checkboxContainer);
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
                
                // Detect checkboxes selected by creating a listener in all input type = "checkbox" 
                // and an event to detect if changed, then set the attribute to checked
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
                // Event listener on click of form submission of all those checkedCheckboxes, send "0" to Topic to stop sensoring/actuating
                // and remove from visual _> remove from db by path
                btZnEdit.addEventListener("click",() =>{
                    const pathSPA = ref(db,"/spaFirebase");
                    const checkedCheckboxes = document.querySelectorAll("input[type='checkbox'][checked]");
                    let newSpaFirebase = {};
                    
                    for (let i = 0; i < checkedCheckboxes.length; i++) {
                        let parent = checkedCheckboxes[i].parentNode;
                        let keyText = parent.textContent;
                        newSpaFirebase[keyText] = "0";
                        
                        // remove element
                        if(data.sensors.hasOwnProperty(keyText)){
                            let pathSens = ref(db,pathName+"/sensors/" + keyText);
                            console.log(pathSens);
                            remove(pathSens);
                        }
                        else if(data.actuators.hasOwnProperty(keyText)){
                            let pathActs = ref(db,pathName+"/actuators/" + keyText);
                            remove(pathActs);
                        }
                    }
                    
                    update(pathSPA,newSpaFirebase)
                    
                    off(pathSPA);
                    //reloadComponent("zoneElem");
                    alert("Successful removal");
                    document.getElementById("zoneElem").innerHTML = "";


                    });
                }  
            }

        );
    }
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
                //zoneAdd();
                break;
            case "remove":
                const optPick = routeSel();
                zoneRemoval(optPick);
                break;
                // Show all sensors & actuators taken from database, with a checkbox and create submit button
                // After submit, verify checkbox marked, those marked send 0 to SPAFirebase to disconnect element
                // Also submit, delete HTML elements related with those marked 
        }
    });

    let select = document.getElementById("routing");
    function routeSel(){
        if (select.value === "default"){
            areaId.innerHTML ="";
            alertsId.innerHTML ="";
            rulesId.innerHTML ="";
            return false;
        }
        else{
        let optionSelected = select.options[select.selectedIndex].text;
        return optionSelected;
    }}
    
    select.addEventListener("change",() =>{
        const optPick = routeSel();
        visualizeArea(optPick);
        rulesZone(optPick);
        
    });
   
})();