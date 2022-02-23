const fs = require('fs')
const path = require("path");
const smiot_engine = require('../iot-middleware/control/engine');
const jsonminify = require('jsonminify')


var pl = require('tau-prolog');
require("tau-prolog/modules/js")(pl);
require("tau-prolog/modules/os")(pl);
require("tau-prolog/modules/random")(pl);
require("tau-prolog/modules/lists")(pl);
require("tau-prolog/modules/promises")(pl);
require("tau-prolog/modules/statistics")(pl);



const events = require('events');
const asset_1 = require("../iot-middleware/configuration/asset");
var prologEngine;



class PrologEngine {
    #jsToPrologEventEmitter;
    #smiotEngine
    #setupPerformed = false;

    constructor() {
        console.log('engine')
        require("./connector")(pl, this);
        this.#jsToPrologEventEmitter = new events.EventEmitter();
        this.#smiotEngine = new smiot_engine.Engine();
        this.prologToJsEventEmitter = new events.EventEmitter();
        this.program = fs.readFileSync(path.resolve(__dirname, "./main.pl")).toString();

        // prologEngine = this;
        //needed so tau prolog can access this engine to
        //global.prologEngine  = this;
    }

    monitor(asset, listener) {
        var randomId = Math.floor(Math.random() * 100);
        this.#jsToPrologEventEmitter.emit('app_event', {
            type: "action",
            action: "notify",
            id: randomId,
            creator: "app",
            subject: asset,
            data: {
                parameter: "alarm"
            }
        });

        this.listenToEvent('update', evt => {
                if (evt.subject === asset) listener(evt);
            })

    }

    read(asset, listener) {
        this.#jsToPrologEventEmitter.emit('app_event', {
            type: "action",
            action: "read",
            id: randomId,
            creator: "jan",
            subject: asset
        });
    }



    addEventListener(evt, fn) {
        this.#jsToPrologEventEmitter.on(evt, fn);
    }

    listenToEvent(evt, fn) {
        this.prologToJsEventEmitter.on(evt, fn);
    }

    handlePrologEvent(Source, Type, Value) {
        console.log("handlePrologEvent " + Source + " " + Type + " " + Value);
        switch (Type) {
            case "asset_value":
                this.prologToJsEventEmitter.emit(Type, {value: Value, asset: Source[0], property: Source[1]});
                break;
        }
    }

    setup(assets, devices) {
        this.#smiotEngine.setup(assets, devices);
        this.loadAssets(assets)
        this.#setupPerformed =true;
    }

    loadAssets(assetFilePath) {
        let assets = Object.entries(JSON.parse(jsonminify(fs.readFileSync(assetFilePath).toString()))).map(([key, value]) => asset_1.Asset.fromJSON(value));
        var prologAssetFileName = "prolog-assets.pl";
        if (fs.existsSync(prologAssetFileName))
            fs.unlinkSync(prologAssetFileName);
        assets.forEach((asset) => {
            fs.appendFileSync(prologAssetFileName, "asset(" + asset.type + "," + asset.assetId.toLowerCase() + ").\n");
            asset.coupledAssets.forEach((coupledAsset, coupleType) => {
                fs.appendFileSync(prologAssetFileName, "asset_relation(" + coupleType + "," + asset.assetId.toLowerCase() + "," + coupledAsset + ").\n");
            });
            asset.devices.forEach((deviceId) => {
                fs.appendFileSync(prologAssetFileName, "has_device(" + asset.assetId.toLowerCase() + "," + deviceId + ").\n");
            });
        });
        this.appendToProgram(fs.readFileSync(prologAssetFileName).toString());
    }

    appendToProgram(programmingCode) {
        this.program = this.program.concat(programmingCode);
    }


    getDevice(id) {
        //TODO ask permission to reasoning engine
        return this.#smiotEngine.getDevice(id);
}

    run(callback) {
        console.log("run engine");

        if(!this.#setupPerformed){
            throw Error("Engine not yet configured, configure engine using the setup method")
        } else {

            var session = pl.create(1000000);

            session.consult(this.program, {
                success: function () {
                    // print alle rules in sessie uit
                    console.log(session.rules);
                    // Query the goal
                    session.query("init.", {
                        success: function () {
                            // Look for answers
                            session.answers(answer =>
                                console.log(session.format_answer(answer)));
                        },
                        error: function (err) {
                            session.answers(x => console.log(pl.format_answer(x)));
                            console.log(err);
                        }

                    });
                },
                error: function (err) {
                    console.log(err);
                    console.log(pl.format_answer(err))
                }
            });
        }



    }

    sendEvent(event_type, event) {
        this.#jsToPrologEventEmitter.emit(event_type, event)
    }
}

exports.PrologEngine = PrologEngine;
