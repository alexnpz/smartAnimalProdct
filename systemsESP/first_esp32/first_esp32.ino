
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


//

// Servomotor 
#include <Servo.h>
Servo myservo;
int pinServo = 19;

int ledPin_servomotor = 12;
int ledPin_ledsSet = 13;

int LS06Spin = 14;
int value = 0;
int levelLux = 0;

//////////////////////////////////////////////////////

int freq = 500;    //2500
int pinBuzzer = 25;

////////////////////////////////////////////////////////////////////////

//int get_











////////////////////////////////////////////////////////////////////////


int * delimiter_values_first_system(){

  int buzzer_freq = 0;
  int thresh_lower_lux = 0;
  int thresh_upper_lux = 0;

  static int limits_first[3];
  
  if (Firebase.RTDB.getInt(&fbdo, "/rulesChicken/buzzer_freq")) {   // change and complete
      if (fbdo.dataType() == "int") {
        buzzer_freq = fbdo.intData();
        limits_first[0] = buzzer_freq;
        
      }
  }

  if (Firebase.RTDB.getInt(&fbdo, "/rulesChicken/rluminositymin")) {   // change and complete
      if (fbdo.dataType() == "int") {
        thresh_lower_lux = fbdo.intData();
        limits_first[1] = thresh_lower_lux;
        
      }
  }

  if (Firebase.RTDB.getInt(&fbdo, "/rulesChicken/rluminositymax")) {   // change and complete
      if (fbdo.dataType() == "int") {
        thresh_upper_lux = fbdo.intData();
        limits_first[2] = thresh_upper_lux;
        
      }
  }

  return limits_first;
  
}

////////////////////////////////////////////////////////////////////////


int * read_all_states(){
 // Read from firebase all the states from the sensors/actuators within third subsystem

    int lux_activ = 0;
    int door_servo_activ = 0;
    int buzzer_activ = 0;

    bool got_lux = false;
    bool got_servo = false;
    bool got_buzzer = false;

    static int control_data_first[3];

    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/lux")) {
      if (fbdo.dataType() == "int") {
        lux_activ = fbdo.intData();
        Serial.println(lux_activ);
        control_data_first[0] = lux_activ;
        got_lux = true;
      }
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/door_servo")) {
      if (fbdo.dataType() == "int") {
        door_servo_activ = fbdo.intData();
        Serial.println(door_servo_activ);
        control_data_first[1] = door_servo_activ;
        got_servo = true;
      }
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/buzzer")) {    // cut  off this one
      if (fbdo.dataType() == "int") {
        buzzer_activ = fbdo.intData();
        Serial.println(buzzer_activ);
        control_data_first[2] = buzzer_activ;
        got_buzzer = true;
      }
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if(got_buzzer && got_lux && got_servo){
        Serial.println("All control bits were received with success ...");
    }else{
        Serial.println("Error receiving control bits. Trying again ...");
        control_data_first[0] = -100;
        control_data_first[1] = -100;
        control_data_first[2] = -100;
    }

 

 // return array with those states
 return control_data_first;
}



////////////////////////////////////////////////////////////////////////

void buzzer_on(boolean stateBuzzer, int pinBuzzer, int freq){
  if(stateBuzzer){
    Serial.println("Buzzer on");
    ledcSetup(1, freq, 8);  
    ledcAttachPin(pinBuzzer, 1);  
    ledcWrite(1, 100);      
  }else{
    Serial.println("Buzzer off");
    ledcWrite(1, 0); 
  }
}

void control_buzzer(int pinBuzzer, int freq){
   buzzer_on(true, pinBuzzer, freq); 
//   Firebase.setString(fbdo, "/ESP32_APP/BUZZER", "ON");

   json.set("/ESPChicken/actuators/buzzer", "ON");
   
   delay(5000);
   buzzer_on(false, pinBuzzer, freq); 
//   Firebase.setString(fbdo, "/ESP32_APP/BUZZER", "OFF");

   json.set("/ESPChicken/actuators/buzzer", "OFF");
   
}

//////////////////////////////////////////////////////

void initialize(){
  myservo.attach(pinServo);  // attaches the servo on pin 13 to the servo object 

  pinMode (ledPin_servomotor, OUTPUT);
  pinMode (ledPin_ledsSet, OUTPUT);
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
  // put your setup code here, to run once:

  Serial.begin(115200);  
  initialize();
  firebase_init();  
}

int readLS06S(){
  value = analogRead(LS06Spin);    //21
  //Serial.println("Luminosidade: ");
  Serial.print(value);
  Serial.print("lux");
  Serial.println("\n");
  //bar.setLevel(value);
  delay(1000);

  //checkLuminosity(value);

  int ind_lux = 0;

  if(value >= 0.0001 && value < 0.0011){
    Serial.println("Overcast Night");
    ind_lux = 1;
  }else if(value >= 0.0011 && value < 0.0108){
    Serial.println("Starlight");
    ind_lux = 2;
  }else if(value >= 0.0108 && value < 0.108){
    Serial.println("Quarter Moon");
    ind_lux = 3;
  }else if(value >= 0.108 && value < 1.08){
    Serial.println("Full Moon");
    ind_lux = 4;
  }else if(value >= 1.08 && value < 10.8){    //
    Serial.println("Deep Twilight");
    ind_lux = 5;
  }else if(value >= 10.8 && value < 107){
    Serial.println("Twilight");
    ind_lux = 6;
  }else if(value >= 107 && value < 1075){
    Serial.println("Very Dark Day");
    ind_lux = 7;
  }else if(value >= 1075 && value < 10752){    //
    Serial.println("\nOvercast Day");
    ind_lux = 8;
  }else if(value >= 10752 && value < 107527){
    Serial.println("\nFull Daylight");
    ind_lux = 9;
  }else if(value >= 107527){
    Serial.println("\nSunlight");
    ind_lux = 10;
  }else{     // lux_value < 0.0001
    Serial.println("Error reading lux sensor !!!");    
  }

  return ind_lux; 
}

void control_servomotor(){

  for (int pos = 0; pos <= 180; pos += 1) { // goes from 0 degrees to 180 degrees
    // in steps of 1 degree
    myservo.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15ms for the servo to reach the position
  }
}

//int getIntFromChr(char* charsToInt){
//  int int_value = 0;
//  
//  for( size_t i = 0; i < sizeof(charsToInt); i++){
//    int_value += (charsToInt[i])*(10^(sizeof(charsToInt)-(i+1)));   
//  }
//
//  return int_value;    
//}
//
//float getFloatFromChr(char* charToFloat){
//  float float_value = 0;
//  int part_int = 0;  
//  int part_dec = 0;
//
//  bool dot = false;
//  bool decim = false;
//
//  int n_dig_bef_dot = 0;
//  int n_dig_after_dot = 0;
//
//  int count_bef = 0;
//  int count_after = 0;
//
//  for( size_t i = 0; i < sizeof(charToFloat); i++){
//    if(charToFloat[i] == '.'){
//      dot = true;
//      decim = true;
//    }else{
//      if(decim == false){
//        count_bef += 1;
//      }else{
//        count_after += 1;
//      }      
//    }
//  }
//
//  dot = false;
//  decim = false;
//  
//
//  for( size_t i = 0; i < sizeof(charToFloat); i++){
//    if(charToFloat[i] == '.'){
//      dot = true;
//      decim = true;
//    }else{
//      if(decim == false){
//        part_int += (charToFloat[i])*(10^(n_dig_bef_dot-(count_bef+1)));
//        count_bef += 1;
//      }else{
////        part_float += int(value[i])*(10^(n_dig_after_dot-(count_after+1)));
////        count_after += 1;
//        Serial.println("Just analysing integer part");
//
//      }
//    }
//  }
//
//  float_value = part_int;      // + part_float/n_dig_after_dot;
//
//  return float_value;  
//}


//void send_to_firebase(fbdo fbdo, char* topic, char* value, String time_now){
//
//// String value, String time_now){
//
//   bool number_flag = true;
//   bool isint = false;
//   bool isfloat = false;
//
//   /* Ensure that input is a number */
//   for( size_t i = 0; i < sizeof(value); i++){
//        if( !isdigit(value[i])){           
//            number_flag = false;
//            break;
//        }
//   }      
//
//   if(number_flag == true){
//      if(strchr(value, '.') != NULL){
//        isfloat = true;
//      }else{
//        isint = true;
//      }
//   }      
//   
//   if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0)){
//    sendDataPrevMillis = millis();
//    
//    if(isint == true){
//      int count = getIntFromChr(value);    // int(value)
//      if (Firebase.RTDB.setInt(&fbdo, topic, count)){    // "test/int"
//        Serial.println("PASSED");   
//      }else{   
//        Serial.println("FAILED"); 
//      }
//    }
//
//    if(isfloat == true){
//  //    float count = getFloatFromChr(value);   // round(float(value),2)
//      int count = getIntFromChr(value);
//      
//      if (Firebase.RTDB.setFloat(&fbdo, topic, count)){
//        Serial.println("PASSED");
//      }else{   
//        Serial.println("FAILED"); 
//      }
//    }
//  }
//}
 

void loop() {

  if (Firebase.ready() && (millis() - sendDataPrevMillis > timerDelay || sendDataPrevMillis == 0)){
    sendDataPrevMillis = millis();


    // when morning // servomotor on // led on // buzzer on
    // control_buzzer(pinBuzzer, freq) 


    int * control_data_first = read_all_states();
    
    int * delims_first = delimiter_values_first_system();

    if(control_data_first[0] != -100){
       levelLux = readLS06S(); 
    }

    int freq = delims_first[0];
    int lower_lux = delims_first[1];
    int upper_lux = delims_first[2];
   
  
  //  String levelLuxStr = String(levelLux);
  //
  //  String topicLux = "ESP1/lux";
  //
  //  time_t t = time(NULL);
  //  struct tm tm = *localtime(&t);
  //  const char *h_str = "";
  //  const char *mins_str = "";
  //  const char *sec_str = "";
  //
  //  sprintf(h_str, "%d", tm.tm_hour);
  //  sprintf(mins_str, "%d", tm.tm_min);
  //  sprintf(sec_str, "%d", tm.tm_sec);
  //  
  //
  //  const char *time_now = "";
  //
  ////  const char *h_str = hours;
  ////  const char *mins_str = minutes;
  ////  const char *sec_str = sec; 
  //
  //  if(sizeof(h_str) == 1){
  //    h_str = strcat("0", h_str);
  //  }
  //
  //  if(sizeof(mins_str) == 1){
  //    mins_str = strcat("0", mins_str);
  //  }
  //
  //  if(sizeof(sec_str) == 1){
  //    sec_str = strcat("0", sec_str);
  //  }
  //  
  //  
  //  time_now = strcat(time_now, h_str);
  //  time_now = strcat(time_now, ":");
  //  time_now = strcat(time_now, mins_str);
  //  time_now = strcat(time_now, ":");
  //  time_now = strcat(time_now, sec_str);  
  
  //  send_to_firebase(fbdo, topicLux, levelLuxStr, time_now);
  
    
  
   // digitalWrite(ledPin_servomotor, HIGH);


    if(control_data_first[2] != -100){
  
      if(levelLux <= lower_lux){     // 5
     //   Firebase.setString(fbdo, "/ESP32_APP/LUX", "LOW");
        json.set("/ESPChicken/sensors/lux", "LOW");
        digitalWrite(ledPin_ledsSet, HIGH);
        control_buzzer(pinBuzzer, freq);
      }else{
        digitalWrite(ledPin_ledsSet, LOW);
    
        if(levelLux > lower_lux && levelLux < upper_lux){      // 5 // 8
     //     msg = "MEAN"
     //     Firebase.setString(fbdo, "/ESP32_APP/LUX", "MEAN");
          json.set("/ESPChicken/sensors/lux", "MEAN");
        }else{
      //    msg = "HIGH"
    //      Firebase.setString(fbdo, "/ESP32_APP/LUX", "HIGH");
          json.set("/ESPChicken/sensors/lux", "HIGH"); 
        }
      } 
    }

    if(control_data_first[1] != -100){
    
       // Control servomotor by the moment of the day   
       // Open servomotor if it´s morning (like 7 a.m.)
      
        digitalWrite(ledPin_servomotor, HIGH);
      
        json.set("/ESPChicken/actuators/servmDoorNight", "true"); 
        control_servomotor();  
        digitalWrite(ledPin_servomotor, LOW); 
   
        json.set("/ESPChicken/actuators/servmDoorNight", "false"); 
    }
  }
}
