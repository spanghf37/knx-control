require('dotenv').config();
var ets = require("./ets"); // JSON export from ETS CSV export
var knx = require('knx');
//var dpts = require('knx/src/dptlib'); // pour utilisation fonction "dpts.fromBuffer()" qui permet de convertir données buffer KNX dans les unités du DPT correspondant
var module_myknx = require('module_myknx');

var myknxconnection = knx.Connection({
	ipAddr: process.env.KNXROUTER_HOST,
	ipPort: process.env.KNXROUTER_PORT,
	//debug: true,
	//interface: 'eth0',
	//useMulticastTunneling: true,
	physAddr: process.env.KNX_SOURCEADDRESS,
	handlers: {
		connected: function() {
			console.log('*** knx.Connection : connected to KNX bus');

			function datetime() {
				myknxconnection.write("8/0/10", new Date(), "DPT10.001");
				myknxconnection.write("8/0/11", new Date(), "DPT11.001");
				myknxconnection.write("8/0/12", new Date(), "DPT19.001");
				setTimeout(datetime, 300000);
			}
			datetime();

			function checkdp(dest) {
				var dp = new knx.Datapoint({
					ga: dest.toString(),
					dpt: module_myknx.knxgaTodpt(dest, ets)
				}, myknxconnection);
				dp.read((src, value) => {
					console.log("**** RESPONSE %j reports current value: %j", src, value);
				});
				setTimeout(function() {
					checkdp(dest);
				}, 30000);
			}
			checkdp("2/4/9");
			checkdp("2/4/14");
			
			function setupDatapoint(groupadress, statusga) {
  				var dp = new knx.Datapoint({
    					ga: groupadress,
    					status_ga: statusga,
   					dpt: "DPT1.001",
    					autoread: true
  				}, myknxconnection);
  				dp.on('change', (oldvalue, newvalue) => {
    					console.log("**** %s current value: %j", groupadress, newvalue);
    					console.log("options.ga==%s", dp.options.ga);
  				});
  				return dp;
			}
			setupDatapoint("0/0/6", "0/1/6");
			console.log("**** *********** : " + setupDatapoint("0/0/6", "0/1/6"));

			//Mise à jour objet "logic1" du AKU 16 : LED piscine autorisée selon état rideau piscine.
			function setlogicledpool(logicga, coverposition, ledpoolswitch, ledpoolstate) {
				var dplogicga = new knx.Datapoint({
					ga: logicga.toString(),
					dpt: module_myknx.knxgaTodpt(logicga, ets)
				}, myknxconnection);
				var dpcoverposition = new knx.Datapoint({
					ga: coverposition.toString(),
					dpt: module_myknx.knxgaTodpt(coverposition, ets)
				}, myknxconnection);
				var dpledpoolswitch = new knx.Datapoint({
					ga: ledpoolswitch.toString(),
					dpt: module_myknx.knxgaTodpt(ledpoolswitch, ets)
				}, myknxconnection);
				var dpledpoolstate = new knx.Datapoint({
					ga: ledpoolstate.toString(),
					dpt: module_myknx.knxgaTodpt(ledpoolstate, ets),
					autoread: true
				}, myknxconnection);
				console.log("******* ******* test " + dpledpoolstate.current_value);
				dpcoverposition.read((src, value) => {
					console.log("**** RESPONSE %j reports current value: %j", src, value);
					if (value === 255) { //rideau fermé
						console.log("**** rideau fermé - value : " + value);
						myknxconnection.write(logicga, 0);
					} else { //rideau ouvert ou partiellement ouvert
						console.log("**** rideau ouvert ou partiellement ouvert - value : " + value);
						myknxconnection.write(logicga, 1);
					}
				});
				console.log("***** je ne veux pas donner la valeur ");
				dpledpoolstate.read((statesrc, statevalue) => {
					console.log("**** FONCTION RESPONSE %j reports current value: %j", statesrc, statevalue);
					if (statevalue === 0){
						myknxconnection.write(ledpoolswitch, "Off", "DPT1.001");
					}
					else {
						myknxconnection.write(ledpoolswitch, "On", "DPT1.001");
					}
				});
					
				setTimeout(function() {
					setlogicledpool(logicga, coverposition, ledpoolswitch, ledpoolstate);
				}, 30000);
			}
			setlogicledpool("2/4/15", "2/4/9", "0/0/6", "0/1/1");

		},
		event: function(evt, src, dest, value) {
			console.log('*** knx.Connection event : ' + evt.toString() + ' source : ' + src.toString() + ' destination : ' + dest.toString() + ' hex value : ' + value.toString('hex'));
			module_myknx.insert_emoncms(evt, src, dest, value);
		},
		error: function(connstatus) {
			console.log("**** ERROR: %j", connstatus);
		}
	}
});
