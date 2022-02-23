import {Driver} from "./driver";
import {DriverType} from "../configuration/drivertype";
import {Observable} from "rxjs";
import {IClientOptions} from "mqtt/types/lib/client";
import {log} from "util";
const mqtt = require('mqtt')

export class MqttDriver extends Driver {
    type: DriverType;
    version: string;

    constructor(version: string) {
        super();
        this.type = DriverType.MQTTDriver;
        this.version = version;

    }

    performMonitor(settings: Object) {
        const client = mqtt.connect(settings["access-point"], {username:"user", password:"password"});
        client.on('connect', ()=>{
            console.log("mqtt client succesfully connected to " + settings["access-point"] )
            client.subscribe(settings["topic"], function (err) {
                if (!err) {
                    console.log("mqtt client succesfully subscribed to " + settings["topic"])
                }
            })
        });

        return new Observable(observer=>{
            client.on('message', function (topic, message) {
                // message is Buffer
                const interpreter = new Function("response", settings['interpreter']);
                const res= interpreter(JSON.parse(message.toString()))
                if(res){
                    observer.next(res);
                }
            })
                return () => {
                client.end()
            }

        })
    }

    performRead(settings: Object) {
    }

    performWrite(settings: Object,  value: any) {

    }

    stopPerformMonitor(settings: Object) {
    }

}