require('dotenv').config()

var knx = require('knx');
//var dpts = require('knx/src/dptlib'); // pour utilisation fonction "dpts.fromBuffer()" qui permet de convertir données buffer KNX dans les unités du DPT correspondant
//var module_mysql = require('module_mysql');
var module_myknx = require('module_myknx');
//var module_weather = require('module_weather');
// var module_log = require('module_log');

var myknxconnection = knx.Connection({
  ipAddr: process.env.KNXROUTER_HOST, ipPort: 3671,
  physAddr: "1.1.50",
  handlers: {
    connected: function() {

      console.log('*** knx.Connection : connected to KNX bus');

      function datetime() {
        //myknxconnection.write("8/0/10", "12", "DPT10.001");
        myknxconnection.write("8/0/10", new Date(), "DPT10.001");
        myknxconnection.write("8/0/11", new Date(), "DPT11.001");
        myknxconnection.write("8/0/12", new Date(), "DPT19.001");
        setTimeout(datetime, 300000);
      }
      datetime();

      //function sunposluxrepeat(err) {
      //   if(err) console.log(" *** sunposluxrepeat *** ", err);
      //   module_weather.sunposlux(myknxconnection);
      //   setTimeout(sunposluxrepeat, 30000);
       //}
       //sunposluxrepeat();
        
       function checkdp() {
        var dp = new knx.Datapoint({ga: '2/4/9'}, myknxconnection);
        // Now send off a couple of requests:
        dp.read((src, value) => {
        console.log("**** RESPONSE %j reports current value: %j", src, value);
        });
        var dp = new knx.Datapoint({ga: '2/4/14'}, myknxconnection);
        // Now send off a couple of requests:
        dp.read((src, value) => {
        console.log("**** RESPONSE %j reports current value: %j", src, value);
        });
         setTimeout(checkdp, 10000)
       }
      checkdp();
      
        //myknxconnection.read("2/4/9", ("0.0.3", responsevalue) { console.log('*** responsevalue : ' + responsevalue);});
    },
    event: function(evt, src, dest, value) {
      console.log('*** knx.Connection event : ' + evt.toString() + ' source : ' + src.toString() + ' destination : ' + dest.toString() + ' hex value : ' + value.toString('hex'));
      module_myknx.insert_db_knx(evt, src, dest, value);
    }
  }
});
