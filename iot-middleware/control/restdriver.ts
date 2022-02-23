import {DriverType} from "../configuration/drivertype";
import {Driver} from "./driver";
import { Observable } from 'rxjs';
const xmlhttprequest = require("xmlhttprequest");



export class RestDriver extends Driver{
    type: DriverType;
    version: string;

    constructor(version: string) {
        super();
        this.type = DriverType.RestDriver;
        this.version = version;

    }

    performWrite(settings: Object, value: any) {
        return new Promise((resolve, reject) => {
            settings = Driver.replaceValue(settings, value)

            var xmlHttp = new xmlhttprequest.XMLHttpRequest();

            function onSuccess(responseText: string) {
                resolve(value);
            }

            function onFailure(responseText: string) {
                reject(responseText);
            }


            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                    onSuccess(xmlHttp.responseText);
                else if (xmlHttp.readyState == 4) {
                    onFailure(xmlHttp.responseText);
                }
            }
            xmlHttp.open(settings["request-type"], settings["access-point"], true); // true for asynchronous

            xmlHttp.send(settings["body"].replace('{value}', value));
        })
    }

    performRead(settings: Map<string, string>) {
        return new Promise((resolve, reject) => {
            var xmlHttp = new xmlhttprequest.XMLHttpRequest();
            xmlHttp.addEventListener("load", () => {
                let json;

                try {
                    json = JSON.parse(xmlHttp.responseText)
                } catch {
                    reject("Error: retrieved unparsable JSON")
                }

                if (json) {
                    const interpreter = new Function("response", settings['interpreter'])
                    resolve(interpreter(json))
                }

                reject('no json');
            });
            xmlHttp.addEventListener("error", () => {reject(xmlHttp.responseText)});
            xmlHttp.open(settings["request-type"], settings["access-point"], true); // true for asynchronous
            xmlHttp.send(settings["body"]);
        })

    }


    performMonitor(settings: Map<string, string>) {
        return new Observable(observer=>{
            const intervalId = setInterval(()=> {
                this.performRead(settings)
                    .then(res => {
                        observer.next(res);
                    })
                    .catch(error => {
                        //ignore
                    })
            }, 1000);

            return () => {
                clearInterval(intervalId);
            }
        })

    }

    stopPerformMonitor(settings: Map<string, string>) {

    }

    private interpreteResponse(response: string, interpreter: any) {
        //TODO implement RestDriver interpreteResponse (Do this in Driver?)
    }


}