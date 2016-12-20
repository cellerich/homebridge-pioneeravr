// Accessory for controlling Pioneer AVR via HomeKit

var request = require("request");
var inherits = require('util').inherits;
var Service, Characteristic;

// need to be global to be used in constructor
var maxVolume;
var minVolume;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-pioneeravr", "PioneerAVR", PioneerAVR);


  function PioneerAVR(log, config) {
    // configuration
    this.ip = config['ip'];
    this.name = config['name'];
    maxVolume = config['maxVolume'];
    minVolume = config['minVolume'];

    this.log = log;

    this.get_url = "http://" + this.ip + "/StatusHandler.asp";

    this.on_url = "http://" + this.ip + "/EventHandler.asp?WebToHostItem=PO";
    this.off_url = "http://" + this.ip + "/EventHandler.asp?WebToHostItem=PF";

    this.mute_on = "http://" + this.ip + "/EventHandler.asp?WebToHostItem=MO";
    this.mute_off = "http://" + this.ip + "/EventHandler.asp?WebToHostItem=MF";

    this.volume_url = "http://" + this.ip + "/EventHandler.asp?WebToHostItem=";
  }

  // Custom Characteristics and service...
  PioneerAVR.AudioVolume = function() {
    Characteristic.call(this, 'Volume', '4804a651-2f32-4e1f-ac75-dacf23d9df93');
    console.log("Maximum Volume", maxVolume);
    this.setProps({
      format: Characteristic.Formats.FLOAT,
      maxValue: maxVolume,
      minValue: minVolume,
      minStep: 0.5,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
    });
    this.value = this.getDefaultValue();
  };
  inherits(PioneerAVR.AudioVolume, Characteristic);
/*
  PioneerAVR.Muting = function() {
    Characteristic.call(this, 'Mute', '4804a652-2f32-4e1f-ac75-dacf23d9df93');
    console.log("Mute Characteristic")
    this.setProps({
      format: Characteristic.Formats.BOOL,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
    });
    this.value = this.getDefaultValue();
  };
  inherits(PioneerAVR.Muting, Characteristic);
*/
  PioneerAVR.AudioDeviceService = function(displayName, subtype) {
    Service.call(this, displayName, '4804a653-2f32-4e1f-ac75-dacf23d9df93', subtype);
    this.addCharacteristic(PioneerAVR.AudioVolume);
    //this.addCharacteristic(PioneerAVR.Muting);
  };
  inherits(PioneerAVR.AudioDeviceService, Service);

  PioneerAVR.prototype = {

    httpRequest: function(url, method, callback) {
      var that = this;

      request({
        url: url,
        method: method
      },
      function (error, response, body) {
        callback(error, response, body)
      })
    },

    getPowerState: function(callback) {

      var url;
      url = this.get_url;

      this.httpRequest(url, "GET", function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var jsonResponse = JSON.parse(body);
          powerState = jsonResponse['Z'][0]['P'];

          if (powerState == 1) {
            callback(null, true);
          }
          else {
            callback(null, false);
          }
          this.log("Power state is:", powerState);
        }
        else {
          this.log('HTTP getPowerState function failed: %s', error);
          callback(error);
        }
      }.bind(this))

    },

    setPowerState: function(powerOn, callback) {
      var url;

      if (powerOn) {
        url = this.on_url;
        this.log("Set", this.name, "to on");
      }
      else {
        url = this.off_url;
        this.log("Set", this.name, "to off");
      }

      this.httpRequest(url, "GET", function(error, response, body) {
        if (!error && response.statusCode == 200) {
          this.log('HTTP power function succeeded!');
          callback();
        }
        else {
          this.log('HTTP power function failed: %s', error);
          callback(error);
          }
      }.bind(this));
    },

    getMuteState: function(callback) {
      var url;
      url = this.get_url;

      this.httpRequest(url, "GET", function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var jsonResponse = JSON.parse(body);
          muteState = jsonResponse['Z'][0]['M'];

          if (muteState == 1) {
            callback(null, true);
          }
          else {
            callback(null, false);
          }
          this.log("Mute state is:", muteState);
        }
        else {
          this.log('HTTP getMuteState function failed: %s', error);
          callback(error);
        }
      }.bind(this))

    },

    setMuteState: function(muteOn, callback) {
      var url;

      if (muteOn) {
        url = this.mute_on;
        this.log(this.name, "muted");
      }
      else {
        url = this.mute_off;
        this.log(this.name, "unmuted");
      }

      this.httpRequest(url, "GET", function(error, response, body) {
        if (!error && response.statusCode == 200) {
          this.log('HTTP mute function succeeded!');
          callback();
        }
        else {
          this.log('HTTP mute function failed: %s', error);
          callback(error);
          }
      }.bind(this));
    },

    getVolume: function(callback) {
      var url;
      url = this.get_url;

      this.httpRequest(url, "GET", function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var jsonResponse = JSON.parse(body);
          volumeValue = Number(jsonResponse['Z'][0]['V']);
          volume = (volumeValue - 161) * 0.5

          callback(null, Number(volume));

          this.log("MasterVolume is:", volume);
        }
        else {
          this.log('HTTP getVolume function failed: %s', error);
          callback(error);
          }

      }.bind(this))

    },

    setVolume: function(value, callback) {
        var intValue = Math.round(value * 2 + 161);
        intValue = Math.max(intValue, 0);
        var valueStr = ("00" + intValue).slice(-3);
        
        url = this.volume_url + valueStr + "VL";

      this.httpRequest(url, "GET", function(error, response, body) {
        if (error) {
          this.log('HTTP volume function failed: %s', error);
          callback(error);
        }
        else {
          this.log("Set volume to", value, "db");
          callback();
          }
      }.bind(this));
    },

  getServices: function() {
    var that = this;

    var informationService = new Service.AccessoryInformation();
    informationService
          .setCharacteristic(Characteristic.Manufacturer, "Pioneer")
          .setCharacteristic(Characteristic.Model, "VSX-2020")
          .setCharacteristic(Characteristic.SerialNumber, "1234567890");

    var switchService = new Service.Switch(this.name);
    switchService
      .getCharacteristic(Characteristic.On)
        .on('get', this.getPowerState.bind(this))
        .on('set', this.setPowerState.bind(this));

    var audioDeviceService = new PioneerAVR.AudioDeviceService("Audio Functions");
    /*
    audioDeviceService
      .getCharacteristic(PioneerAVR.Muting)
        .on('get', this.getMuteState.bind(this))
        .on('set', this.setMuteState.bind(this));
*/
    audioDeviceService
      .getCharacteristic(PioneerAVR.AudioVolume)
        .on('get', this.getVolume.bind(this))
        .on('set', this.setVolume.bind(this));

    //return [informationService, switchService];
    return [informationService, switchService, audioDeviceService];
    }
  }
}
