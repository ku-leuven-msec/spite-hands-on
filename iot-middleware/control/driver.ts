import {DriverType} from "../configuration/drivertype";
import {DriverInfo} from "../configuration/driverinfo";


export abstract class Driver {
    type: DriverType;
    version: string;

    toString(){
        return DriverType[this.type]+" "+this.version;
    }

    static replaceValue(settings: Object, value: any) {
        let settingsCopy = {};
        for (let [k, v] of Object.entries(settings)) {
            settingsCopy[k]=settings[k].replace(new RegExp("{value}"), value);

        }
        return settingsCopy
    }

    abstract performWrite(settings: Object, value: any);
    abstract performRead(settings:Object);
    abstract performMonitor(settings: Object);
    abstract stopPerformMonitor(settings: Object);
}
