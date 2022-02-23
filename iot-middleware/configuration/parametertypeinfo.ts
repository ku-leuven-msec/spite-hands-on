import {ParameterType} from "./parametertype";

export class ParameterTypeInfo {
    parameterType: ParameterType;
    validator;
    //TODO validator
    unit: string;


    constructor(parameterType: ParameterType, validator, unit: string) {
        this.parameterType = parameterType;
        this.validator = validator;
        this.unit = unit;
        //TODO parse validator
    }
}