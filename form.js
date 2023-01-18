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
                 if(input.value == ""){
                    alert("All fields must be filled out.");
                    return false;
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
            const zoneName = formData.get("zoneName");
            console.log(typeof zoneName);
            // const jsonString = JSON.stringify(jsonData);
            const stringZone = "/ESP" + zoneName;
            console.log(stringZone);
            const dbPath = ref(db,stringZone);
            set(dbPath, jsonData);
            const routesPath = ref(db,"routes");
            // set(routesPath,zoneName);

            // Check if value exists, if does then appends new value and if doesn't create the table
            let locationExists = false;
            onValue(routesPath,(snapshot)  => {
                if (snapshot.exists() && !locationExists){
                    console.log("Location exists");
                    locationExists = true;
                    const data = snapshot.val();
                    data.push(zoneName);
                    console.log(typeof data);
                    set(routesPath,data);
                    off(routesPath);
                    return;
                }
                else if(!snapshot.exists() && !locationExists){
                    console.log("Location doesnt exist");
                    locationExists = true;
                    let data = [];
                    data.push(zoneName);
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
        
        const numbSensors = document.getElementById("numbSensors");
        const numbActuators = document.getElementById("numbActuators");
        const sensorsFields = document.getElementById("sensorsFields");
        const actuatorsFields = document.getElementById("actuatorsFields");
        
        numbSensors.addEventListener("change",()=>{
            sensorsFields.innerHTML = "";
            let numSensors = parseInt(numbSensors.value);
            console.log(numSensors);
            if (isNaN(numSensors)) {
                numSensors = 0;
            }
            for (let i = 0; i < numSensors; i++) {
                // Create a new label
                const newLabel = document.createElement("label");
                newLabel.innerHTML = "Sensor" + (i + 1) + ":";

                // Create a new input
                const newInput = document.createElement("input");
                newInput.type = "text";
                newInput.name = "sensorName" + (i + 1);

                const newNormalValue = document.createElement("label");
                newNormalValue.innerHTML = "Normal Value" + ":";

                const newNormalInput = document.createElement("input");
                newNormalInput.type = "text";
                newNormalInput.name = "sensorNormalValue" + (i+1);
                
                const newAlert = document.createElement("label");
                newAlert.innerHTML = "Alert Value" + ":";

                const newAlertInput = document.createElement("input");
                newAlertInput.type = "text";
                newAlertInput.name = "sensorAlertlValue" + (i+1);

                // Append the label and input to the sensorsFields div
                sensorsFields.appendChild(newLabel);
                sensorsFields.appendChild(newInput);
                sensorsFields.appendChild(newNormalValue);
                sensorsFields.appendChild(newNormalInput);
                sensorsFields.appendChild(newAlert);
                sensorsFields.appendChild(newAlertInput);
            }
         });

        numbActuators.addEventListener("change",()=>{
            actuatorsFields.innerHTML = "";
            let numActuators = parseInt(numbActuators.value);
            console.log(numActuators);
            if (isNaN(numActuators)) {
                numActuators = 0;
            }

            for (let i = 0; i < numActuators; i++) {
                // Create a new label
                const newLabel = document.createElement("label");
                newLabel.innerHTML = "Actuator" + (i + 1) + ":";

                // Create a new input
                const newInput = document.createElement("input");
                newInput.type = "text";
                newInput.name = "actuatorName" + (i + 1);
                
                const newState = document.createElement("label");
                newState.innerHTML = "Alert Value" + ":";

                // dropdown 2 options ON/OFF
                const newStateInput = document.createElement("input");
                newStateInput.type = "text";
                newStateInput.name = "actuatorAlertlValue" + (i+1);

                // Append the label and input to the sensorsFields div
                actuatorsFields.appendChild(newLabel);
                actuatorsFields.appendChild(newInput);
                actuatorsFields.appendChild(newState);
                actuatorsFields.appendChild(newStateInput);
            }
        });   

})();