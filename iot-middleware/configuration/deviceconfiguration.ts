import {DriverReference} from "./driverreference";


export class DeviceConfiguration {
    // properties
    deviceId: string;
    type: string;
    settings: Object;
    driverReference: DriverReference;

    //constructor
    constructor(deviceId: string, type: string, settings: Object) {
        this.deviceId = deviceId;
        this.type = type;
        this.settings = settings;
        this.driverReference = new DriverReference(type);
    }

    static fromJSON(json: DeviceConfiguration): DeviceConfiguration {
        let deviceConfig: DeviceConfiguration = Object.create(DeviceConfiguration.prototype);
        return Object.assign(deviceConfig, json, {
            driverReference: new DriverReference(json.type)
        });
    }
}