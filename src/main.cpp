#include <Arduino.h>
#include <MKRWAN.h>
#include <Arduino_MKRENV.h>
#include <CayenneLPP.h>
#include "secrets.h"

// Murata Module
LoRaModem modem(Serial1);

// LoRaWAN Configuration
// Get your devEUI from Murata Module
#define LORAREGION US915

// CayenneLPP Configuration
CayenneLPP lpp(51);

int delaySecondsIntial = 10;
int delaySecondsConnected = 60;

int dataRate = -1;

void setup()
{

  // put your setup code here, to run once:
  Serial.begin(9600);
  // while (!Serial)
  //   ;

  // change this to your regional band (eg. US915, AS923, ...)
  if (!modem.begin(LORAREGION))
  {
    Serial.println("Failed to start module");
    while (1)
    {
    }
  };

  Serial.print("Your module version is: ");
  Serial.println(modem.version());
  Serial.println();
  Serial.print("Your device EUI is: ");
  Serial.println(modem.deviceEUI());
  Serial.println();

  // Enable US915-928 channels
  // LoRaWAN® Regional Parameters and TTN specification: channels 8 to 15 plus 65
  // modem.configureBand(US915);
  // modem.sendMask("ff000001f000ffff00020000");
  // Serial.println("Because we're in the US, we need this mask:");
  // Serial.println(modem.getChannelMask());
  // Serial.println();
  modem.dataRate(7);
  // modem.setADR(true);

  // Connect via LoRaWAN
  int connected = modem.joinOTAA(APP_EUI, APP_KEY);

  // Check Connectivity
  if (!connected)
  {
    Serial.println("Something went wrong; are you indoor? Move near a window and retry");
    Serial.println("Retrying JOIN in 60 seconds");
    delay(15000);
    Serial.println("Retrying JOIN in 45 seconds");
    delay(15000);
    Serial.println("Retrying JOIN in 30 seconds");
    delay(15000);
    Serial.println("Retrying JOIN in 15 seconds");
    delay(15000);
    setup();
  }

  // We are connected ... idle a few
  delay(1000);

  // init ENV Board
  if (!ENV.begin())
  {
    Serial.println("Failed to initialize MKR ENV shield!");
    while (1)
      ;
  }

  // All Done ... idle a few
  delay(1000);
}

void loop()
{

  // Read Sensors from ENV Board
  float temperature = ENV.readTemperature(FAHRENHEIT);
  float humidity = ENV.readHumidity();
  float pressure = ENV.readPressure();
  float illuminance = ENV.readIlluminance();
  // float uva = ENV.readUVA();
  // float uvb = ENV.readUVB();
  // float uvIndex = ENV.readUVIndex();

  // print each of the sensor values
  Serial.print("Temperature = ");
  Serial.print(temperature);
  Serial.println(" °F");

  Serial.print("Humidity    = ");
  Serial.print(humidity);
  Serial.println(" %");

  Serial.print("Pressure    = ");
  Serial.print(pressure);
  Serial.println(" kPa");

  Serial.print("Illuminance = ");
  Serial.print(illuminance);
  Serial.println(" lx");

  // print an empty line
  Serial.println();

  dataRate = modem.getDataRate();
  Serial.print("Current dataRate: ");
  Serial.print(dataRate);
  Serial.println();

  // Create LPP
  lpp.reset();
  lpp.addTemperature(0, temperature);
  lpp.addRelativeHumidity(0, humidity);
  lpp.addBarometricPressure(0, pressure);
  lpp.addLuminosity(0, illuminance);
  // lpp.addTemperature(1, uva);
  // lpp.addTemperature(2, uvb);
  // lpp.addTemperature(3, uvIndex);

  // Send LPP Packet over LoRaWAN
  modem.beginPacket();
  modem.write(lpp.getBuffer(), lpp.getSize());
  int err = modem.endPacket(true);

  // Check for errors
  if (err > 0)
  {
    Serial.println("Message sent correctly!");
    Serial.print(err);
    Serial.print(" bytes\n");
  }
  else
  {
    Serial.println("Error sending message :(");
    Serial.println("(you may send a limited amount of messages per minute, depending on the signal strength");
    Serial.println("it may vary from 1 message every couple of seconds to 1 message every minute)");
  }

  // Idle 60 secs and start again
  if (dataRate > 0)
  {
    delay(delaySecondsConnected * 1000);
  }
  else
  {
    Serial.print("Low Data Rate detected, retrying in ");
    Serial.print(delaySecondsIntial);
    Serial.println(" seconds");
    delay(delaySecondsIntial * 1000);
  }
}