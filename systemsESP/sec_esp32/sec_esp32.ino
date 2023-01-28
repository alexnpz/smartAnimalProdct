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

////////////////////////////////////////////////////////////////////////


int * read_all_states(){
 // Read from firebase all the states from the sensors/actuators within third subsystem

    bool got_move_left = false;
    bool got_move_right = false;
    bool got_servo_left = false;
    bool got_servo_right = false;
    bool got_ultrassonic = false;
    bool got_lcd = false;

    int move_left_activ = 0;
    int move_right_activ = 0;
    int servo_left_activ = 0;
    int servo_right_activ = 0;
    int ultrassonic_activ = 0;
    int lcd_activ = 0;

    static int control_data_second[6];
 
    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/move_left_sec")) {   // change and complete
      if (fbdo.dataType() == "int") {
        move_left_activ = fbdo.intData();
        Serial.println(move_left_activ);
        control_data_second[0] = move_left_activ;
        got_move_left = true;
      }     
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/move_right_sec")) {
      if (fbdo.dataType() == "int") {
        move_right_activ = fbdo.intData();
        Serial.println(move_right_activ);
        control_data_second[1] = move_right_activ;
        got_move_right = true;
      }
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/servo_left_sec")) {
      if (fbdo.dataType() == "int") {
        servo_left_activ = fbdo.intData();
        Serial.println(servo_left_activ);
        control_data_second[2] = servo_left_activ;
        got_servo_left = true;
      }
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/servo_right_sec")) {
      if (fbdo.dataType() == "int") {
        servo_right_activ = fbdo.intData();
        Serial.println(servo_right_activ);
        control_data_second[3] = servo_right_activ;
        got_servo_right = true;
      }
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/ultrassonic")) {
      if (fbdo.dataType() == "int") {
        ultrassonic_activ = fbdo.intData();
        Serial.println(ultrassonic_activ);
        control_data_second[4] = ultrassonic_activ;
        got_ultrassonic = true;
      }
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.getInt(&fbdo, "/spaFirebase/lcd")) {
      if (fbdo.dataType() == "int") {
        lcd_activ = fbdo.intData();
        Serial.println(lcd_activ);
        control_data_second[5] = lcd_activ;
        got_lcd = true;
      }
    }
    else {
      Serial.println(fbdo.errorReason());
    }

    if(got_lcd && got_ultrassonic && got_servo_right && got_servo_left && got_move_right && got_move_left){
        Serial.println("All control bits were received with success ...");
    }else{
        Serial.println("Error receiving control bits. Trying again ...");
        control_data_second[0] = -100;
        control_data_second[1] = -100;
        control_data_second[2] = -100;
        control_data_second[3] = -100;
        control_data_second[4] = -100;
        control_data_second[5] = -100;
      
    }

 // return array with those states
 return control_data_second;
}

////////////////////////////////////////////////////////////////////////


float * delimiter_values_second_system(){

  float min_temp = 0;
  float max_temp = 0;
  float min_hum = 0;
  float max_hum = 0;
  float water_qual_trigger = 0;

  static float limits_sec[5];  

  if (Firebase.RTDB.getFloat(&fbdo, "/rules/min_temp")) {   // change and complete
      if (fbdo.dataType() == "float") {
        min_temp = fbdo.floatData();
        limits_sec[0] = min_temp;
        
      }
  }

  if (Firebase.RTDB.getFloat(&fbdo, "/rules/max_temp")) {   // change and complete
      if (fbdo.dataType() == "float") {
        max_temp = fbdo.floatData();
        limits_sec[1] = max_temp;
        
      }
  }

  if (Firebase.RTDB.getFloat(&fbdo, "/rules/min_hum")) {   // change and complete
      if (fbdo.dataType() == "float") {
        min_hum = fbdo.floatData();
        limits_sec[2] = min_hum;
        
      }
  }

   if (Firebase.RTDB.getFloat(&fbdo, "/rules/max_hum")) {   // change and complete
      if (fbdo.dataType() == "float") {
        max_hum = fbdo.floatData();
        limits_sec[3] = max_hum;
        
      }
   }

   if (Firebase.RTDB.getFloat(&fbdo, "/rules/water_qual_trigger")) {   // change and complete
      if (fbdo.dataType() == "int") {
        water_qual_trigger = fbdo.floatData();
        limits_sec[4] = water_qual_trigger;
        
      }
   }
   

   return limits_sec;  
}




////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////

#include "DHT.h"

#define DHTPIN 26    //23
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

const int ledPin_temp = 21;
const int ledPin_hum = 22;
const int pin_fan = 18;

const int ledPin_bad_qual = 12;
const int ledPin_mean_qual = 13;
const int ledPin_good_qual = 19;

const int ledPin_door_servomotor = 5;
const int ledPin_recharge_food = 23;

//-----------------------//

#include <Servo.h>
Servo myservoRechageFood;
int pinServoRechageFood = 5;

Servo myservoOpenDoor;
int pinServoOpenDoor = 19;

//-----------------------//
#define TdsSensorPin 27
#define VREF 3.3              // analog reference voltage(Volt) of the ADC
#define SCOUNT  30            // sum of sample point

int analogBuffer[SCOUNT];     // store the analog value in the array, read from ADC
int analogBufferTemp[SCOUNT];
int analogBufferIndex = 0;
int copyIndex = 0;

float averageVoltage = 0;
float tdsValue = 0;
float temperature = 25;       // current temperature for compensation

// median filtering algorithm
int getMedianNum(int bArray[], int iFilterLen){
  int bTab[iFilterLen];
  for (byte i = 0; i<iFilterLen; i++)
  bTab[i] = bArray[i];
  int i, j, bTemp;
  for (j = 0; j < iFilterLen - 1; j++) {
    for (i = 0; i < iFilterLen - j - 1; i++) {
      if (bTab[i] > bTab[i + 1]) {
        bTemp = bTab[i];
        bTab[i] = bTab[i + 1];
        bTab[i + 1] = bTemp;
      }
    }
  }
  if ((iFilterLen & 1) > 0){
    bTemp = bTab[(iFilterLen - 1) / 2];
  }
  else {
    bTemp = (bTab[iFilterLen / 2] + bTab[iFilterLen / 2 - 1]) / 2;
  }
  return bTemp;
}

int getMostFreqLevel(int qualLev[]) {
   int lev0 = 0; int lev1 = 1; int lev2 = 2;   
   int lev3 = 3; int lev4 = 4; int lev5 = 5;
   int lev6 = 6; int lev7 = 7; int lev8 = 8;

   int countLev0 = 0; int countLev1 = 0;
   int countLev2 = 0; int countLev3 = 0;
   int countLev4 = 0; int countLev5 = 0;
   int countLev6 = 0; int countLev7 = 0;
   int countLev8 = 0;   

   int array_counters[9];
   int maxNumber = 0;
   
   for (int i = 0; i < sizeof(qualLev); ++i) {
      if(qualLev[i] == lev0){
        countLev0 += 1;
      }else if(qualLev[i] == lev1){
        countLev1 += 1;
      }else if(qualLev[i] == lev2){
        countLev2 += 1;
      }else if(qualLev[i] == lev3){
        countLev3 += 1;
      }else if(qualLev[i] == lev4){
        countLev4 += 1;
      }else if(qualLev[i] == lev5){
        countLev5 += 1;
      }else if(qualLev[i] == lev6){
        countLev6 += 1;
      }else if(qualLev[i] == lev7){
        countLev7 += 1;
      }else if(qualLev[i] == lev8){
        countLev8 += 1;
      }
   }

   int numberLevels = 9;
   int lev_with_max = 0;
   
   array_counters[0] = countLev0;
   array_counters[1] = countLev1;
   array_counters[2] = countLev2;
   array_counters[3] = countLev3;
   array_counters[4] = countLev4;
   array_counters[5] = countLev5;
   array_counters[6] = countLev6;
   array_counters[7] = countLev7;
   array_counters[8] = countLev8;

   for(int i=0; i<numberLevels ; i++){
      if(array_counters[i] > maxNumber){
        maxNumber = array_counters[i];
        lev_with_max = i;
      }
   } 

   Serial.println("Most frequent water quality level for the current set of samples: ");
   Serial.print(lev_with_max);

   return lev_with_max;   
}


int water_quality(float temperature){
  int mostFreqQualLevAlongSamples = 0;
  int qualLevAlongSamples[SCOUNT];
  int indQualLevel = 0;    
  
  static unsigned long analogSampleTimepoint = millis();
  if(millis()-analogSampleTimepoint > 40U){     //every 40 milliseconds,read the analog value from the ADC
    analogSampleTimepoint = millis();
    analogBuffer[analogBufferIndex] = analogRead(TdsSensorPin);    //read the analog value and store into the buffer
    analogBufferIndex++;
    if(analogBufferIndex == SCOUNT){ 
      analogBufferIndex = 0;
    }
  }   
  
  static unsigned long printTimepoint = millis();
  if(millis()-printTimepoint > 800U){
    printTimepoint = millis();
    for(copyIndex=0; copyIndex<SCOUNT; copyIndex++){
      analogBufferTemp[copyIndex] = analogBuffer[copyIndex];      
         
      // read the analog value more stable by the median filtering algorithm, and convert to voltage value
      averageVoltage = getMedianNum(analogBufferTemp,SCOUNT) * (float)VREF / 4096.0;
      
      //temperature compensation formula: fFinalResult(25^C) = fFinalResult(current)/(1.0+0.02*(fTP-25.0)); 
      float compensationCoefficient = 1.0+0.02*(temperature-25.0);
      //temperature compensation
      float compensationVoltage=averageVoltage/compensationCoefficient;
      
      //convert voltage value to tds value
      tdsValue=(133.42*compensationVoltage*compensationVoltage*compensationVoltage - 255.86*compensationVoltage*compensationVoltage + 857.39*compensationVoltage)*0.5;
      
      //Serial.print("voltage:");
      //Serial.print(averageVoltage,2);
      //Serial.print("V   ");
      Serial.print("TDS Value:");
      Serial.print(tdsValue,0);
      Serial.println("ppm");

      if(tdsValue >= 50 && tdsValue <= 250){
        Serial.println("Lacking minerals");
        indQualLevel = 6;
      }else if(tdsValue > 250 && tdsValue < 300){
        Serial.println("Acceptable water quality");
        indQualLevel = 7;
      }else if(tdsValue >= 300 && tdsValue <= 500){
        Serial.println("Good water quality");
        indQualLevel = 8;
      }else if(tdsValue > 500 && tdsValue < 600){
        Serial.println("Quite good water quality");
        indQualLevel = 5;
      }else if(tdsValue >= 600 && tdsValue <= 900){
        Serial.println("Water quality not so great");
        indQualLevel = 4;
      }else if(tdsValue > 900 && tdsValue < 1000){
        Serial.println("Quite bad water quality");
        indQualLevel = 3;
      }else if(tdsValue >= 1000 && tdsValue <= 2000){
        Serial.println("Bad water quality");
        indQualLevel = 2;
      }else if(tdsValue > 2000){
        Serial.println("Unacceptable water quality - Too much contamination !!!");
        indQualLevel = 1;
      }else{    // tdsValue < 50
        Serial.println("TDS Value too small. Make sure the TDS meter is under water");
        Serial.println("Discarding this value");
        indQualLevel = 0;
      }

      qualLevAlongSamples[copyIndex] = indQualLevel;
   }

   mostFreqQualLevAlongSamples = getMostFreqLevel(qualLevAlongSamples);
 } 

 return mostFreqQualLevAlongSamples;
}

//-----------------------//

void control_servomotorRechage(){
    
//  Firebase.setString(fbdo, "/ESP32_APP/REC_FOOD_SERVO", "ON");
  json.set("/ESPSheep/actuators/minerals", "ON");

  for (int pos = 0; pos <= 180; pos += 1) { // goes from 0 degrees to 180 degrees
    // in steps of 1 degree
    myservoRechageFood.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15ms for the servo to reach the position
  }

//  Firebase.setString(fbdo, "/ESP32_APP/REC_FOOD_SERVO", "OFF");
  json.set("/ESPSheep/actuators/minerals", "OFF");
}

void readingDHT11(int * control_data_second, float min_temp, float max_temp, float min_hum, float max_hum, float water_qual_trigger){
  // Wait a few seconds between measurements.
  //delay(2000);

  float humi = 0;
  float t = 0;

  static int  data[2];

  // Reading temperature or humidity takes about 250 milliseconds!
  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  humi = dht.readHumidity();
  Serial.println("Read Humidity");
  // Read temperature as Celsius (the default)
  t = dht.readTemperature();
  Serial.println("Read Temperature");
  // Read temperature as Fahrenheit (isFahrenheit = true)
  float f = dht.readTemperature(true);

  if(humi > 100){
    humi -= 100;
  }

  if(t <-5){
    t = abs(t);
  }


  int humInUnits = int(humi);

  int tempInUnits = int(t);

  //delay(2000);

  // Check if any reads failed and exit early (to try again).
  if (isnan(humi) || isnan(t)) {   //|| isnan(f)
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  // Compute heat index in Fahrenheit (the default)
  float hif = dht.computeHeatIndex(f, humi);
  // Compute heat index in Celsius (isFahreheit = false)
  float hic = dht.computeHeatIndex(t, humi, false);

  Serial.print(F("Humidity: "));
  Serial.print(humi);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.print(F("°C "));
  Serial.print(f);
  Serial.print(F("°F  Heat index: "));
  Serial.print(hic);
  Serial.print(F("°C "));
  Serial.print(hif);
  Serial.println(F("°F"));

  /////////////////////////////////////

  if(control_data_second[0] != -100){
    json.set("/ESPChicken/sensors/humidity", humi);
  }

  if(control_data_second[1] != -100){ 
    json.set("/ESPChicken/sensors/temperature", t);
  }
  
//  Firebase.setFloat(fbdo, "/ESP32_APP/HUM", humi);
//  Firebase.setFloat(fbdo, "/ESP32_APP/TEMP", t);

  ////////////////////////////////////

  if((humi < min_hum) || (humi > max_hum)){     // Normal range for humidity     // 30 // 50
    digitalWrite (ledPin_hum, HIGH);   
  }else{
    digitalWrite (ledPin_hum, LOW); 
  }


  if(control_data_second[5] != -100){ 

    if((t < min_temp) || (t > max_temp)){     // Normal range for temperature    --15 --24
      digitalWrite (ledPin_temp, HIGH);
  
      if(t >= max_temp){    // 24
        Serial.println("Turning on fan ...");
        digitalWrite (pin_fan, HIGH); 
  
        json.set("/ESPSheep/actuators/fan", "ON");     
  
      }else{
        digitalWrite (pin_fan, LOW);
  
        json.set("/ESPSheep/actuators/fan", "OFF");
      }
    }else{
      digitalWrite (ledPin_temp, LOW); 
    }
  }


  int water_quality_level = water_quality(float(t));

  Serial.println("Here");
  Serial.print(water_quality_level);

  if(control_data_second[2] != -100){ 

    if(water_quality_level < water_qual_trigger){          // 7
      digitalWrite (ledPin_bad_qual, HIGH);
      digitalWrite (ledPin_mean_qual, LOW);
      digitalWrite (ledPin_good_qual, LOW);
  
  //    Firebase.setString(fbdo, "/ESP32_APP/WATER_QUALITY", "Bad");
  
      json.set("/ESPSheep/sensors/waterQ", "DANGER");     

      if(control_data_second[3] != -100){  
        digitalWrite (ledPin_recharge_food, HIGH);    
        control_servomotorRechage();
      }
      
      delay(5000);    
    }else{

      if(control_data_second[3] != -100){
        digitalWrite (ledPin_recharge_food, LOW);
      }
  
      if(water_quality_level == water_qual_trigger){           // 7
         digitalWrite (ledPin_mean_qual, HIGH); 
         digitalWrite (ledPin_bad_qual, LOW);
         digitalWrite (ledPin_good_qual, LOW);  
  
    //     Firebase.setString(fbdo, "/ESP32_APP/WATER_QUALITY", "Mean");
  
         json.set("/ESPSheep/sensors/waterQ", "OK");
      
      }else{      
         digitalWrite (ledPin_good_qual, HIGH);
         digitalWrite (ledPin_bad_qual, LOW);    
         digitalWrite (ledPin_mean_qual, LOW); 
        
  //       Firebase.setString(fbdo, "/ESP32_APP/WATER_QUALITY", "Good");
  
         json.set("/ESPSheep/sensors/waterQ", "GOOD");
              
      }
    }
  }
}



void control_servomotor(int * control_data_second){
   
//  Firebase.setString(fbdo, "/ESP32_APP/MORNING_SERVO", "ON");

  if(control_data_second[4] != -100){

    json.set("/ESPSheep/actuators/servomDoorNight", "OPEN");
    
    for (int pos = 0; pos <= 180; pos += 1) { // goes from 0 degrees to 180 degrees
      // in steps of 1 degree
      myservoOpenDoor.write(pos);              // tell servo to go to position in variable 'pos'
      delay(15);                       // waits 15ms for the servo to reach the position
    }
  
  //  Firebase.setString(fbdo, "/ESP32_APP/MORNING_SERVO", "OFF");
  
    json.set("/ESPSheep/actuators/servomDoorNight", "CLOSE");
  }
}

void setup() {
  Serial.begin(115200); 

  firebase_init();

  pinMode (ledPin_temp, OUTPUT);
  pinMode (ledPin_hum, OUTPUT);
  pinMode (ledPin_bad_qual, OUTPUT);
  pinMode (ledPin_mean_qual, OUTPUT);
  pinMode (ledPin_good_qual, OUTPUT); 
  pinMode (pin_fan, OUTPUT); 

  pinMode (ledPin_door_servomotor, OUTPUT); 
  pinMode (ledPin_recharge_food, OUTPUT);  

  myservoRechageFood.attach(pinServoRechageFood);
  myservoOpenDoor.attach(pinServoOpenDoor);

}

void loop() {

  if (Firebase.ready() && (millis() - sendDataPrevMillis > timerDelay || sendDataPrevMillis == 0)){
    sendDataPrevMillis = millis();

    int * control_data_second = read_all_states();

    float * delims_second = delimiter_values_second_system();

    float min_temp = delims_second[0];
    float max_temp = delims_second[1];
    float min_hum = delims_second[2];
    float max_hum = delims_second[3];
    float water_qual_trigger = delims_second[4];

    control_servomotor(control_data_second);

    readingDHT11(control_data_second, min_temp, max_temp, min_hum, max_hum, water_qual_trigger); 
    delay(3000);
  }
}
