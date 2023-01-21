
///////////////////////////////////////////////////////
///////////////////// WRITE ////////////////////////////

#include <Arduino.h>
#include <time.h>
// Firebase
#include <WiFi.h>
#include <Firebase_ESP_Client.h>

//Define Firebase Data object
FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

FirebaseJson json;

//Provide the token generation process info.
#include "addons/TokenHelper.h"
//Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Insert your network credentials
#define WIFI_SSID "Vodafone-E346D8"                            // "MEO-CFA840"
#define WIFI_PASSWORD "fA9dxnpg3f2mdA8z"                       // "cc3c2f82a9"

// Insert Firebase project API Key
#define API_KEY "AIzaSyAezyy-fegJ-YCqFSXooVQwXSUMzU21-vQ"

// Insert RTDB URLefine the RTDB URL */
#define DATABASE_URL "https://dam20222023-d7271-default-rtdb.europe-west1.firebasedatabase.app/" 


unsigned long sendDataPrevMillis = 0;
unsigned long timerDelay = 180000;

// extern int control_data[15];

////////////////////////////////////////////////////////

bool lux = false;
bool door_servo = false;
bool buzzer = false;
bool move_left_sec = false;
bool move_right_sec = false;
bool servo_left_sec = false;
bool servo_right_sec = false;
bool ultrassonic = false;
bool lcd = false;
bool hum_sensor = false;
bool temp_sensor = false;
bool water_quality_sensor = false;
bool minerals_servo = false;
bool door_servo_third = false;
bool fan = false;


void initWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi ..");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(1000);
  }
  Serial.println(WiFi.localIP());
  Serial.println();
}

int * read_array_from_firebase(){

  static int control_data[15];
  
  if (!Firebase.RTDB.getArray(&fbdo, "data/control_array")) {
            Serial.println(fbdo.errorReason());
  }
  FirebaseJsonArray &arr = fbdo.jsonArray();
  int index = 0;

  int length_data = 15;

  int count_bad_recv_bits = 0;

  for(int index = 0; index < length_data; index++){
    FirebaseJsonData data;
    arr.get(data, index++);

    if(data.intValue != 0 && data.intValue != 1){
      Serial.println("Error reading control bit at line %d\n", index);     
      count_bad_recv_bits += 1; 
    }else{
      control_data[index] = data.intValue;
    }
  }

  if(count_bad_recv_bits <= 15 && count_bad_recv_bits > 0){
     json.set("/spaFirebase/gen_control", "BAD");
  }else if(count_bad_recv_bits == 0){
     json.set("/spaFirebase/gen_control", "GOOD");
  }

  return control_data;
}


////////////////////////////////////////////////////////

void getSensActuatorsFirstESP(int arr_first[]){

    if(arr_first[0] == 1){
        Serial.println("Lux sensor ON\n");
        lux = true;
    //    Firebase.setInt(fbdo, "/spaFirebase/lux", 1);
        json.set("/spaFirebase/lux", String(1));
    }else{
        Serial.println("Lux sensor OFF\n");
        lux = false;
 //       Firebase.setInt(fbdo, "/spaFirebase/lux", 0);
        json.set("/spaFirebase/lux", String(0));
    }

    if(arr_first[1] == 1){
        Serial.println("Door servomotor ON\n");
        door_servo = true;
  //      Firebase.setInt(fbdo, "/spaFirebase/door_servo", 1);
        json.set("/spaFirebase/door_servo", String(1));
    }else{
        Serial.println("Door servomotor OFF\n");
        door_servo = false;
  //      Firebase.setInt(fbdo, "/spaFirebase/door_servo", 0);
        json.set("/spaFirebase/door_servo", String(0));
    }

    if(arr_first[2] == 1){
        Serial.println("Buzzer ON\n");
        buzzer = true;
 //       Firebase.setInt(fbdo, "/spaFirebase/buzzer", 1);
        json.set("/spaFirebase/buzzer", String(1));
    }else{
        Serial.println("Buzzer OFF\n");
        buzzer = false;
   //     Firebase.setInt(fbdo, "/spaFirebase/buzzer", 0);
        json.set("/spaFirebase/buzzer", String(0));
    }
}


void getSensActuatorsSecondESP(int arr_second[]){

    if(arr_second[0] == 1){
        Serial.println("Left motion sensor ON\n");
        move_left_sec = true;
  //      Firebase.setInt(fbdo, "/spaFirebase/move_left_sec", 1);
        json.set("/spaFirebase/move_left_sec", String(1));
    }else{
        Serial.println("Left motion sensor OFF\n");
        move_left_sec = false;
    //    Firebase.setInt(fbdo, "/spaFirebase/move_left_sec", 0);
        json.set("/spaFirebase/move_left_sec", String(0));
    }

    if(arr_second[1] == 1){
        Serial.println("Right motion sensor ON\n");
        move_right_sec = true;
  //      Firebase.setInt(fbdo, "/spaFirebase/move_right_sec", 1);
        json.set("/spaFirebase/move_right_sec", String(1));
    }else{
        Serial.println("Right motion sensor OFF\n");
        move_right_sec = false;
  //      Firebase.setInt(fbdo, "/spaFirebase/move_right_sec", 0);
        json.set("/spaFirebase/move_right_sec", String(0));
    }

    if(arr_second[2] == 1){
        Serial.println("Left servomotor ON\n");
        servo_left_sec = true;
  //      Firebase.setInt(fbdo, "/spaFirebase/servo_left_sec", 1);
        json.set("/spaFirebase/servo_left_sec", String(1));
    }else{
        Serial.println("Left servomotor OFF\n");
        servo_left_sec = false;
  //      Firebase.setInt(fbdo, "/spaFirebase/servo_left_sec", 0);
        json.set("/spaFirebase/servo_left_sec", String(0));
    }

    if(arr_second[3] == 1){
        Serial.println("Right servomotor ON\n");
        servo_right_sec = true;
   //     Firebase.setInt(fbdo, "/spaFirebase/servo_right_sec", 1);
        json.set("/spaFirebase/servo_right_sec", String(1));
    }else{
        Serial.println("Right servomotor OFF\n");
        servo_right_sec = false;
  //      Firebase.setInt(fbdo, "/spaFirebase/servo_right_sec", 0);
        json.set("/spaFirebase/servo_right_sec", String(0));
    }

    if(arr_second[4] == 1){
        Serial.println("Ultrassonic sensor ON\n");
        ultrassonic = true;
  //      Firebase.setInt(fbdo, "/spaFirebase/ultrassonic", 1);
        json.set("/spaFirebase/ultrassonic", String(1));
    }else{
        Serial.println("Ultrassonic sensor OFF\n");
        ultrassonic = false;
    //    Firebase.setInt(fbdo, "/spaFirebase/ultrassonic", 0);
        json.set("/spaFirebase/ultrassonic", String(0));
    }

    if(arr_second[5] == 1){
        Serial.println("LCD ON\n");
        lcd = true;
  //      Firebase.setInt(fbdo, "/spaFirebase/lcd", 1);
        json.set("/spaFirebase/lcd", String(1));
    }else{
        Serial.println("LCD OFF\n");
        lcd = false;
 //       Firebase.setInt(fbdo, "/spaFirebase/lcd", 0);
        json.set("/spaFirebase/lcd", String(0));
    }
}

void getSensActuatorsThirdESP(int arr_third[]){

    if(arr_third[0] == 1){
        Serial.println("Humidity sensor ON\n");
        hum_sensor = true;
//        Firebase.setInt(fbdo, "/spaFirebase/hum_sensor", 1);
        json.set("/spaFirebase/hum_sensor", String(1));
    }else{
        Serial.println("Humidity sensor OFF\n");
        hum_sensor = false;
 //       Firebase.setInt(fbdo, "/spaFirebase/hum_sensor", 0);
        json.set("/spaFirebase/hum_sensor", String(0));
    }

    if(arr_third[1] == 1){
        Serial.println("Temperature sensor ON\n");
        temp_sensor = true;
//        Firebase.setInt(fbdo, "/spaFirebase/temp_sensor", 1);
        json.set("/spaFirebase/temp_sensor", String(1));
    }else{
        Serial.println("Temperature sensor OFF\n");
        temp_sensor = false;
//        Firebase.setInt(fbdo, "/spaFirebase/temp_sensor", 0);
        json.set("/spaFirebase/temp_sensor", String(0));
    }

    if(arr_third[2] == 1){
        Serial.println("Water quality ON\n");
        water_quality_sensor = true;
 //       Firebase.setInt(fbdo, "/spaFirebase/water_quality_sensor", 1);
        json.set("/spaFirebase/water_quality_sensor", String(1));
    }else{
        Serial.println("Water quality OFF\n");
        water_quality_sensor = false;
//        Firebase.setInt(fbdo, "/spaFirebase/water_quality_sensor", 0);
        json.set("/spaFirebase/water_quality_sensor", String(0));
    }

    if(arr_third[3] == 1){
        Serial.println("Minerals servomotor ON\n");
        minerals_servo = true;
 //       Firebase.setInt(fbdo, "/spaFirebase/minerals_servo", 1);
        json.set("/spaFirebase/minerals_servo", String(1));
    }else{
        Serial.println("Minerals servomotor OFF\n");
        minerals_servo = false;
 //       Firebase.setInt(fbdo, "/spaFirebase/minerals_servo", 0);
        json.set("/spaFirebase/minerals_servo", String(01));
    }

    if(arr_third[4] == 1){
        Serial.println("Door servomotor ON\n");
        door_servo_third = true;
 //       Firebase.setInt(fbdo, "/spaFirebase/door_servo_third", 1);
        json.set("/spaFirebase/door_servo_third", String(1));
    }else{
        Serial.println("Door servomotor OFF\n");
        door_servo_third = false;
//        Firebase.setInt(fbdo, "/spaFirebase/door_servo_third", 0);
        json.set("/spaFirebase/door_servo_third", String(0));
    }

    if(arr_third[5] == 1){
        Serial.println("Fan ON\n");
        fan = true;
 //       Firebase.setInt(fbdo, "/spaFirebase/fan", 1);
        json.set("/spaFirebase/fan", String(1));
    }else{
        Serial.println("Fan OFF\n");
        fan = false;
 //      Firebase.setInt(fbdo, "/spaFirebase/fan", 0);
        json.set("/spaFirebase/fan", String(0));
    }
}





void parse_control_array(int * sensor_sel){

    char * msg_gen;

    if (Firebase.RTDB.getString(&fbdo, "/spaFirebase/gen_control")) {
      if (fbdo.dataType() == "String") {
        msg_gen = fbdo.stringData();
      }

      if(strcmp (msg_gen, "GOOD") == 0){
      
        int sensor_sel_first[3];
        int sensor_sel_second[6];
        int sensor_sel_third[6];
    
        int size_arr_element = 4;
    
        for(int i = 0; i < 15; i++){
            if(i >= 0 && i < 3){
                sensor_sel_first[i] = sensor_sel[i];
            }
    
            if(i >= 3 && i < 9){
                sensor_sel_second[i-3] = sensor_sel[i];
            }
    
            if(i >= 9 && i < 15){
                sensor_sel_third[i-9] = sensor_sel[i];
            }
        }
    
        Serial.print(sensor_sel_first[0]);
        Serial.print(sensor_sel_first[1]);
    
    //    Serial.println("%d, %d, %d", sizeof(sensor_sel_first)/size_arr_element, sizeof(sensor_sel_second)/size_arr_element, sizeof(sensor_sel_third)/size_arr_element);
    
        Serial.println("First set: \n");
    
        for(int i = 0; i< sizeof(sensor_sel_first)/size_arr_element; i++){
            Serial.println(sensor_sel_first[i]);
        }
    
        Serial.println("\n\n");
    
        getSensActuatorsFirstESP(sensor_sel_first);
    
        Serial.println("\n\n\n");
    
        Serial.println("Second set: \n");
    
        for(int i = 0; i< sizeof(sensor_sel_second)/size_arr_element; i++){
            Serial.println(sensor_sel_second[i]);
        }
    
        Serial.println("\n\n");
    
        getSensActuatorsSecondESP(sensor_sel_second);
    
        Serial.println("\n\n\n");
    
        Serial.println("Third set: \n");
    
        for(int i = 0; i< sizeof(sensor_sel_third)/size_arr_element; i++){
            Serial.println(sensor_sel_third[i]);
        }
    
        Serial.println("\n\n");
    
        getSensActuatorsThirdESP(sensor_sel_third); 
     }else{
        Serial.println("Ending ...\n")  
     }

}


void firebase_init(){
  
  config.api_key = API_KEY;

  // Assign the RTDB URL (required)
  config.database_url = DATABASE_URL;

  Firebase.reconnectWiFi(true);
  fbdo.setResponseSize(4096);

  // Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h

  // Assign the maximum retry of token generation
  config.max_token_generation_retry = 5;

  // Initialize the library with the Firebase authen and config
  Firebase.begin(&config, &auth);

  // Getting the user UID might take a few seconds
  Serial.println("Getting User UID");
  while ((auth.token.uid) == "") {
    Serial.print('.');
    delay(1000);
  }  
}


void setup() {
  Serial.begin(115200);

  firebase_init();

}

void loop() {

  if (Firebase.ready() && (millis() - sendDataPrevMillis > timerDelay || sendDataPrevMillis == 0)){
    sendDataPrevMillis = millis();
    
    parse_control_array(read_array_from_firebase());        // read and parse control array   // and then write state of sensores/actuators of all ESPs to Firebase

  }

}
