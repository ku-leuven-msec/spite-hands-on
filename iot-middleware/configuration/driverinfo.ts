import {DriverType} from "./drivertype";

export class DriverInfo {

    driverType: DriverType;
    version: string;
    settings: Object
    interpreter;
    //TODO interpreter
    
    static fromJSON(json): DriverInfo {
        let driverInfo: DriverInfo = Object.create(DriverInfo.prototype);
        return  Object.assign(driverInfo, json, {
            driverType: DriverType[json.driverType]
        });
    }

    replaceDynamicValues(deviceSettings: Object): DriverInfo {
        // for (let [key, value] of this.settings) {
        for (let [key, value] of Object.entries(this.settings)) {
            var dynamicValues=value.match(/\{.*?\}/g);
            if(dynamicValues!= null){
                for (let dynamicValue of dynamicValues){
                    var replacementValue = deviceSettings[dynamicValue.replace(/(\{|\})/g, '' )];
                    if(replacementValue!=null){
                        //this.settings.set(key, this.settings[key].replace(new RegExp(dynamicValue), replacementValue))
                        this.settings[key]= this.settings[key].replace(new RegExp(dynamicValue), replacementValue);
                    }

                }
            }
        }
        return this
    }


}