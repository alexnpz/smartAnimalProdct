
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

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define LCD_COLUMNS 16
#define LCD_ROWS 2

// set LCD address, number of columns and rows
// if you don't know your display address, run an I2C scanner sketch
LiquidCrystal_I2C lcd(0x27, LCD_COLUMNS, LCD_ROWS); 

#include <Ultrasonic.h>
Ultrasonic ultrasonic(12);    

#define timeSeconds 5

float ultrassonic_floor = 18;   //100
float height_recip = 5;   //20
float dist_max = ultrassonic_floor - height_recip;
bool animal = false;
float lim_perc = 50;

float rem_dist = 400;
int count_same_dist = 0;
int lim_steady_state = 5;

const int motionSensor_first = 32;
unsigned long now_first = millis();
unsigned long lastTrigger_first = 0;
boolean startTimer_first = false;
bool detected_move_first = false;

const int motionSensor_second = 26;
unsigned long now_second = millis();
unsigned long lastTrigger_second = 0;
boolean startTimer_second = false;
bool detected_move_second = false;

int food_level_thresh = 5; // Threshold to adjust later by a gui or html page

// Servomotor 
#include <Servo.h>
Servo myservo_first;
int pinServo_first = 19;

Servo myservo_second;
int pinServo_second = 27;

int pin_left_led = 23;
int pin_right_led = 25;

float l_max = 50;
float p_max = 200;
float beta = 0.16;    // 0.32

////////////////////////////////////////////


float findBetaWithParams(float p_max, float d_max){
  float beta = 0;

  float beta_one = 0;

  float p_min = 4.273;
  beta_one = (1/0.085)*log((p_max-p_min)/(5*exp(p_max)));

  float max_weight = p_max-5; 

  beta = beta_one;

  return beta;
}

float * delimiter_values_third_system(){

  float ultrassonic_floor = 0;
  float height_recip = 0;
  float max_weight = 0;
  float max_dist = 0;  
  float lim_perc = 0;
  float lim_steady_state = 0;

  static float limits_third[6];
  
  if (Firebase.RTDB.getFloat(&fbdo, "/rulesChicken/ultrassonic_floor")) {   // change and complete
      if (fbdo.dataType() == "float") {
        ultrassonic_floor = fbdo.floatData();
        limits_third[0] = ultrassonic_floor;
        
      }
  }

  if (Firebase.RTDB.getFloat(&fbdo, "/rulesChicken/height_recip")) {   // change and complete
      if (fbdo.dataType() == "float") {
        height_recip = fbdo.floatData();
        limits_third[1] = height_recip;
        
      }
  }


  if (Firebase.RTDB.getFloat(&fbdo, "/rulesChicken/dist_max")) {   // change and complete
      if (fbdo.dataType() == "float") {
        max_dist = fbdo.floatData();
        limits_third[2] = max_dist;
        
      }
  }

  if (Firebase.RTDB.getFloat(&fbdo, "/rulesChicken/weight_max")) {   // change and complete
      if (fbdo.dataType() == "float") {
        max_weight = fbdo.floatData();
        limits_third[3] = max_weight;
        
      }
  }

  if (Firebase.RTDB.getFloat(&fbdo, "/rulesChicken/lim_perc")) {   // change and complete
      if (fbdo.dataType() == "float") {
        lim_perc = fbdo.floatData();
        limits_third[4] = lim_perc;
        
      }
  }

  if (Firebase.RTDB.getFloat(&fbdo, "/rulesChicken/lim_steady_state")) {   // change and complete
      if (fbdo.dataType() == "float") {
        lim_steady_state = fbdo.floatData();
        limits_third[5] = lim_steady_state;
        
      }
  }

  return limits_third;  
  
}



////////////////////////////////////////////


int * read_all_states(){
 // Read from firebase all the states from the sensors/actuators within third subsystem

    bool got_hum = false;
    bool got_temp = false;
    bool got_water_qual = false;
    bool got_minerals = false;
    bool got_servo_third = false;
    bool got_fan = false;

    int hum_activ = 0;
    int temp_activ = 0;
    int water_qual_activ = 0;
    int minerals_activ = 0;
    int door_servo_third_activ = 0;
    int fan_activ = 0;
    
    static int control_data_third[6];

    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/hum_sensor")) {   
      if (fbdo.dataType() == "int") {
        hum_activ = fbdo.intData();
        Serial.println(hum_activ);
        control_data_third[0] = hum_activ;
        got_hum = true;
      }     
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/temp_sensor")) {   
      if (fbdo.dataType() == "int") {
        temp_activ = fbdo.intData();
        Serial.println(temp_activ);
        control_data_third[1] = temp_activ;
        got_temp = true;
      }     
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/water_quality_sensor")) {   
      if (fbdo.dataType() == "int") {
        water_qual_activ = fbdo.intData();
        Serial.println(water_qual_activ);
        control_data_third[2] = water_qual_activ;
        got_water_qual = true;
      }     
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/minerals_servo")) {   
      if (fbdo.dataType() == "int") {
        minerals_activ = fbdo.intData();
        Serial.println(minerals_activ);
        control_data_third[3] = minerals_activ;
        got_minerals = true;
      }     
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/door_servo_third")) {   
      if (fbdo.dataType() == "int") {
        door_servo_third_activ = fbdo.intData();
        Serial.println(door_servo_third_activ);
        control_data_third[4] = door_servo_third_activ;
        got_servo_third = true;
      }     
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/fan")) {   
      if (fbdo.dataType() == "int") {
        fan_activ = fbdo.intData();
        Serial.println(fan_activ);
        control_data_third[5] = fan_activ;
        got_fan = true;
      }     
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if(got_fan && got_servo_third && got_minerals && got_water_qual && got_temp && got_hum){
        Serial.println("All control bits were received with success ...");
    }else{
        Serial.println("Error receiving control bits. Trying again ...");
        control_data_third[0] = -100;
        control_data_third[1] = -100;
        control_data_third[2] = -100;
        control_data_third[3] = -100;
        control_data_third[4] = -100;
        control_data_third[5] = -100;
    } 


 // return array with those states
 return control_data_third;
}



////////////////////////////////////////////

float load_estimation(int l_max, int p_max, float c, float beta){
  float p = 0;
  
  p = -c*exp((p_max/l_max)*beta)+p_max;           // c*exp((-p_max/l_max)*beta)+p_max
  float P_rounded = ceil(p * 100.0) / 100.0;

  Serial.println("Estimated weight for the current load: ");
  Serial.print(P_rounded);
  Serial.println(" kg");

  return P_rounded;  
}

void control_servomotor_first(){

//  Firebase.setString(fbdo, "/ESP32_APP/LEFT_SERVO", "ON");
  json.set("/ESPChicken/actuators/motorFood", "ON");  
  
  for (int pos = 0; pos <= 180; pos += 1) { // goes from 0 degrees to 180 degrees
    // in steps of 1 degree
    myservo_first.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15ms for the servo to reach the position 
  }

//  Firebase.setString(fbdo, "/ESP32_APP/LEFT_SERVO", "OFF");
  json.set("/ESPChicken/actuators/motorFood", "OFF");  
}

void control_servomotor_second(){

//  Firebase.setString(fbdo, "/ESP32_APP/RIGHT_SERVO", "ON");
  json.set("/ESPChicken/actuators/motorFood", "ON");  

  for (int pos = 0; pos <= 180; pos += 1) { // goes from 0 degrees to 180 degrees
    // in steps of 1 degree
    myservo_second.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15ms for the servo to reach the position
  }

//  Firebase.setString(fbdo, "/ESP32_APP/RIGHT_SERVO", "OFF");
  json.set("/ESPChicken/actuators/motorFood", "OFF");  
}


void IRAM_ATTR detectsMovement_first() {
  Serial.println("MOTION DETECTED!!!");  
  String msg_on = "ON";
//  Firebase.setString(fbdo, "/ESP32_APP/MOVE_LEFT", msg_on);
  json.set("/ESPChicken/actuators/move_det", "ON"); 
  detected_move_first = true;
  startTimer_first = true;
  lastTrigger_first = millis();
}

void IRAM_ATTR detectsMovement_second() {
  Serial.println("MOTION DETECTED!!!");
  String msg_on = "ON";
//  Firebase.setString(fbdo, "/ESP32_APP/MOVE_RIGHT", msg_on);
  json.set("/ESPChicken/actuators/move_det", "ON");
  detected_move_second = true;
  startTimer_second = true;
  lastTrigger_second = millis();
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

  // Different baud rates require different serial ports

//  Serial.begin(9600);  // For ultrassonic sensor
  
  Serial.begin(115200);  // For the remaining sensors/atuators

  Wire.begin();  //SDA and SCL pins

  lcd.init();
  // turn on LCD backlight                      
  lcd.backlight(); 

  lcd.setCursor(0, 0);   

  firebase_init();
  
  pinMode(motionSensor_first, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(motionSensor_first), detectsMovement_first, RISING);
  
  pinMode(motionSensor_second, INPUT_PULLUP); 
  attachInterrupt(digitalPinToInterrupt(motionSensor_second), detectsMovement_second, RISING);

  myservo_first.attach(pinServo_first);  // attaches the servo on pin 13 to the servo object 
  myservo_second.attach(pinServo_second);  // attaches the servo on pin 13 to the servo object 

  pinMode (pin_left_led, OUTPUT);
  pinMode (pin_right_led, OUTPUT);

}

float read_ultrassonic_sensor(){
  
  float dist = ultrasonic.read(CM);
  Serial.print("Ultrassonic sensor: ");
  Serial.print(dist); 
  Serial.println("cm"); 

  return dist;
}

void loop() {

  if (Firebase.ready() && (millis() - sendDataPrevMillis > timerDelay || sendDataPrevMillis == 0)){
    sendDataPrevMillis = millis();

    int * control_data_third = read_all_states();

    ////////////////// Just for firebase rules input ////////////////////

    float beta_found = findBetaWithParams(p_max, l_max);

    /////////////////////////////////////////////////////////////////////

    float * delims_third = delimiter_values_third_system();

    float ultrassonic_floor = delims_third[0];
    float height_recip = delims_third[1];
    float l_max = delims_third[2];
    float dist_max = ultrassonic_floor - height_recip;
    float p_max = delims_third[3];
    float lim_perc = delims_third[4];
    float lim_steady_state = delims_third[5];
    

    if(control_data_third[4] != -100){

      float dist = read_ultrassonic_sensor();
  
      float p_rounded = load_estimation(l_max, p_max, dist, beta);
    
      if(p_rounded < 0){
        p_rounded = 0;
      }
    
  
  //    Firebase.setString(fbdo, "/ESP32_APP/LCD", "ON");
  
      if(control_data_third[5] != -100){
        json.set("/ESPChicken/actuators/lcd", "ON");
      }
    
      lcd.print(String(p_rounded) + " Kg");       // LCD  
      
      
      if(dist > 2 && dist < 350){
    
  //      Firebase.setString(fbdo, "/ESP32_APP/ULTRASSONIC_STATE", "ON");
  
        json.set("/ESPChicken/sensors/ultrassonic_state", "ON");
        
        if(dist == rem_dist){
          count_same_dist += 1;
    
          if(dist < dist_max){
            Serial.println("Object detected !!!");
    
       //     Serial.println("Servomotor OFF"); 
            
            if(count_same_dist > lim_steady_state){
              animal = true;
              Serial.println("Animal is eating");
            }
          }
        }else{
          animal = false;
          count_same_dist = 0;
        }    
      
        rem_dist = dist;
      
    //    if(dist < dist_max){
    //      animal = true;
    //      Serial.println("Animal detected !!!");  
    //    }
    
        Serial.println("Limiar: ");
        Serial.print(dist_max + height_recip - (lim_perc/100)*height_recip); 
      
        if(dist > dist_max + (1-(lim_perc/100))*height_recip){  
    
          Serial.print(detected_move_first);
  
          if((control_data_third[0] != -100) && (control_data_third[1] != -100)){
    
            if(detected_move_first == false && detected_move_second == false){   // detected_move_second == false
              Serial.println("Servomotor ON");   
    
              if(control_data_third[2] != -100){
                digitalWrite(pin_left_led, HIGH);
                control_servomotor_first();
              }
    
              if(control_data_third[3] != -100){
                digitalWrite(pin_right_led, HIGH);
                control_servomotor_second();
              }
        
              delay(1000);
        
              digitalWrite(pin_left_led, LOW);
              digitalWrite(pin_right_led, LOW);   
            }   
          }
        }
      }else{
   //     Firebase.setString(fbdo, "/ESP32_APP/ULTRASSONIC_STATE", "OFF");
        json.set("/ESPChicken/sensors/ultrassonic_state", "OFF");
        Serial.println("Error detected !!!");
      }
    
   //   Firebase.setFloat(fbdo, "/ESP32_APP/ULTRASSONIC", dist);
  
      if(control_data_third[4] != -100){
        json.set("/ESPChicken/sensors/ultrassonic", dist);
      }
      
      delay(2000);
  
  
      if(control_data_third[0] != -100){  
        if(detected_move_first == true){
          String msg_off = "OFF";
     //     Firebase.setString(fbdo, "/ESP32_APP/MOVE_LEFT", msg_off);
          json.set("/ESPChicken/actuators/move_det", "OFF");
          detected_move_first = false;
        }
      }
  
      if(control_data_third[1] != -100){  
        if(detected_move_second == true){
          String msg_off = "OFF";
     //     Firebase.setString(fbdo, "/ESP32_APP/MOVE_RIGHT", msg_off);
          json.set("/ESPChicken/actuators/move_det", "OFF");
          detected_move_second = false;
        } 
      }
    
      delay(500);
  
      if(control_data_third[5] != -100){  
  
        json.set("/ESPChicken/actuators/lcd", "OFF");
      
    
     //   Firebase.setString(fbdo, "/ESP32_APP/LCD", "OFF");
        
        lcd.clear();                         // LCD
        lcd.setCursor(0, 0);                 // LCD
  
      }
  }
    
  
  //  if(read_ultrassonic_sensor() > food_level_thresh){
  //    if(detected_move_first == false){
  //      digitalWrite(pin_left_led, HIGH);
  //      control_servomotor_first();
  //      delay(1000);
  //        
  //      digitalWrite(pin_left_led, LOW); 
  //    }
  //
  //    if (detected_move_second == false){
  //      digitalWrite(pin_right_led, HIGH);
  //      control_servomotor_second();
  //      delay(1000);
  //     
  //      digitalWrite(pin_right_led, LOW);   
  //      
  //    }
  //  }
  
  }

}
