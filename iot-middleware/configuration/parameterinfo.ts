import {ParameterTypeInfo} from "./parametertypeinfo";
import {DriverInfo} from "./driverinfo";
import {Action} from "./action";
import {ParameterType} from "./parametertype";

export class ParameterInfo {
    parameterReference: string;
    parameterTypeInfo: ParameterTypeInfo;
    actions: Object

    static fromJSON(json: ParameterInfo): ParameterInfo {
        let paramInfo:ParameterInfo = Object.create(ParameterInfo.prototype);
        return Object.assign(paramInfo, json, {
            parameterTypeInfo: new ParameterTypeInfo(ParameterType[json.parameterTypeInfo.parameterType.toString()],json.parameterTypeInfo.validator, json.parameterTypeInfo.unit),
            // actions: new Map<Action, DriverInfo>(Object.entries(json.actions).map(([key, value]) => ([Action[key],DriverInfo.fromJSON(value)])))
            actions: ParameterInfo.configurActions(json.actions)

        });
    }

    private static configurActions(actions: Object) {
        var res = {};
        for (let [key, value] of Object.entries(actions)) {
            res[Action[key]]=DriverInfo.fromJSON(value);
        }
        return res;
    }
}
