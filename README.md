# knx-control node app
Composed of 3 dockers set by docker-compose:
- knx-control main node app
- knxd (https://github.com/spanghf37/knxd)
- homebridge-knx (https://github.com/spanghf37/homebridge-knx)

# 1. Configuration files

Copy and edit ```/config/config.json``` and ```/config/knx_config.json``` and ```/config/knxd.ini```.

# 2. /config/ets.json
Edit/update file ```/config/ets.json```.
Export CSV to JSON (http://www.csvjson.com/csv2json) - CSV saved as UTF8 with Notepad - first line of CSV needs to be:
```
knx_ga_groupname,knx_ga_address,knx_ga_central,knx_ga_unfiltered,knx_ga_description,knx_ga_datapointtype,knx_ga_security,knx_ga_id,knx_ga_value,knx_ga_dptsubtypeunit,knx_ga_timestamp,knx_ga_src
```

# 3. Edit iptables (firewall) rules
On Photon OS (VMWare), edit script ```iptables``` under ```/etc/systemd/scripts``` and add the following at the end of file:

```
#Homebridge-KNX rules
iptables -A INPUT -p tcp --dport 5353 -j ACCEPT
iptables -A INPUT -p udp --dport 5353 -j ACCEPT
iptables -A INPUT -p tcp --dport 51826 -j ACCEPT
iptables -A INPUT -p udp --dport 51826 -j ACCEPT
iptables -A INPUT -p tcp --dport 18081 -j ACCEPT

#knxd rules (assuming server listening on 6720 and 3671)
iptables -A INPUT -p tcp --dport 3671 -j ACCEPT
iptables -A INPUT -p udp --dport 3671 -j ACCEPT
iptables -A INPUT -p tcp --dport 6720 -j ACCEPT
```
