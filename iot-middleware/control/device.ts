import {Engine} from "./engine";
import {ParameterInfo} from "../configuration/parameterinfo";
import {DeviceConfiguration} from "../configuration/deviceconfiguration";
import {Action} from "../configuration/action";
import {Observable} from 'rxjs';
import {tap, map} from "rxjs/operators";

export class Device {

    // properties
    configurations: DeviceConfiguration;
    engine: Engine;
    private subscriptions = [];

    // construtor
    constructor(config: DeviceConfiguration, engine: Engine) {
        this.configurations = config;
        this.engine = engine;
    }


    //methods
    connect() {
        //TODO connect to device
    }

    disconnect() {
        //TODO disconnect from device
    }

    getParameterReferences() {
        return this.configurations.driverReference.parameters.map(paramInfo => paramInfo.parameterReference);
    }

    setParameter(parameterReference: string, value: any) {
        const parameter: ParameterInfo = this.configurations.driverReference.parameters.find(item => item.parameterReference === parameterReference);
        console.log(parameter.parameterReference)
        if (this.validateValue(value, parameter.parameterTypeInfo.validator)) {
            return this.engine.performWrite(parameter.actions[Action.Write].replaceDynamicValues(this.configurations.settings), value);
        } else {
            return Promise.reject("value is not valid");
        }
    }

    getParameter(parameterReference: string) {
        const parameter: ParameterInfo = this.configurations.driverReference.parameters.find(item => item.parameterReference === parameterReference);
        const deviceId = this.configurations.deviceId;
        return this.engine.performRead(parameter.actions[Action.Read].replaceDynamicValues(this.configurations.settings)).then((x) => {
            // @ts-ignore
           //global.eventEmitter.emit('new_value', {value: x, param: parameterReference, devid: deviceId});
            return x;
        });
    }

    monitorParameter(parameterReference: string, onNewValue: Function, onError?: Function) {
        console.log("start_monitor_param " + parameterReference);
        const parameter: ParameterInfo = this.configurations.driverReference.parameters.find(item => item.parameterReference === parameterReference);
        const deviceId = this.configurations.deviceId;
        // return new Observable(
        //     observer=> {
        //         this.engine.performMonitor(parameter.actions.get(Action.Monitor).replaceDynamicValues(this.configurations.settings)).subscribe(
        //            x => {
        //                 // console.log("new_value "+x);
        //                 // // @ts-ignore
        //                 // global.eventEmitter.emit('new_value', {
        //                 //     value: x, param: parameterReference, devid: deviceId
        //                 // });
        //                 observer.next(x);
        //             })
        //     }
        // );

        var tempSubscription = this.engine.performMonitor(
            parameter.actions[Action.Monitor].replaceDynamicValues(this.configurations.settings)
        ).subscribe(onNewValue, onError);

        const subscription = this.subscriptions.find( subs => subs.parameter === parameterReference )
        if(subscription){
            subscription.subscriber.unsubscribe();
            const index = this.subscriptions.indexOf(subscription);

            if (index > -1) {
                this.subscriptions.splice(index, 1);
            }
        }

        this.subscriptions.push({parameter: parameterReference, subscriber : tempSubscription})
        return tempSubscription ;

        // return this.engine.performMonitor(parameter.actions.get(Action.Monitor).replaceDynamicValues(this.configurations.settings)).pipe(
        //     map(x => {
        //         console.log("new_value "+x);
        //         // @ts-ignore
        //         global.eventEmitter.emit('new_value', {
        //             value: x, param: parameterReference, devid: deviceId
        //         });
        //         return x;
        //     })
        // );

    }

    stopMonitorParameter(parameterReference: string) {
       var tempSub = this.subscriptions.find(subs =>{return subs.parameter===parameterReference})

        if(tempSub && tempSub.subscriber) {
            tempSub.subscriber.unsubscribe();
        }
        // const parameter: ParameterInfo = this.configurations.driverReference.parameters.find(item => item.parameterReference === parameterReference);
        // const deviceId = this.configurations.deviceId;
        // return this.engine.stopPerformMonitor(parameter.actions[Action.Monitor].replaceDynamicValues(this.configurations.settings));
    }

    newValueEvent(x) {


        return x;
    };

    private validateValue(value: any, validator) {
        //TODO validate value using validator
        return true;
    }


    print() {
        console.log("device: " + this.configurations.toString());
    }
}