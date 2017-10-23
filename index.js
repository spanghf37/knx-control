require('dotenv').config();
var ets = require("./ets"); // JSON export from ETS CSV export
var knx = require('knx');
//var dpts = require('knx/src/dptlib'); // pour utilisation fonction "dpts.fromBuffer()" qui permet de convertir données buffer KNX dans les unités du DPT correspondant
var module_myknx = require('module_myknx');

var myknxconnection = knx.Connection({
	//ipAddr: process.env.KNXROUTER_HOST,
	//ipPort: process.env.KNXROUTER_PORT,
	//debug: true,
	interface: 'eth0',
	useMulticastTunneling: true,
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
				//console.log("****** knxgaTodpt " + " dest : " + dest.toString() + " knxgaTodpt : " + module_myknx.knxgaTodpt(dest, ets));
				var val;
				var dp = new knx.Datapoint({
					ga: dest.toString(),
					dpt: module_myknx.knxgaTodpt(dest, ets)
				}, myknxconnection);
				dp.read((src, value) => {
					console.log("**** RESPONSE %j reports current value: %j", src, value);
					val = value;
				});
				console.log("**** value of val " + val);
				setTimeout(function() { checkdp(dest); }, 30000);
				return val;
			}
			checkdp("2/4/9");
			console.log(" **** read value checkdp : " + checkdp("2/4/9"));
			checkdp("2/4/14");
			
			//function setdp(dest, value) {
			//	var dp = new knx.Datapoint({
			//		ga: dest.toString(),
			//		dpt: module_myknx.knxgaTodpt(dest, ets)
			//	}, myknxconnection);
			//	dp.read((src, value) => {
			//		console.log("**** RESPONSE %j reports current value: %j", src, value);
			//	});
			//}
			//setdp("2/4/15", 
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
