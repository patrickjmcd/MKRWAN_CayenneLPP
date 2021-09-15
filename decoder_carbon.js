var LPP_TYPE_DIGITAL_INPUT = 0x00;
var LPP_TYPE_DIGITAL_OUTPUT = 0x01;
var LPP_TYPE_ANALOG_INPUT = 0x02;
var LPP_TYPE_ANALOG_OUTPUT = 0x03;
var LPP_TYPE_ILLUMINANCE_SENSOR = 0x65;
var LPP_TYPE_PRESENCE_SENSOR = 0x66;
var LPP_TYPE_TEMPERATURE_SENSOR = 0x67;
var LPP_TYPE_HUMIDITY_SENSOR = 0x68;
var LPP_TYPE_ACCELEROMETER = 0x71;
var LPP_TYPE_MAGNETOMETER = 0x72;
var LPP_TYPE_BAROMETER = 0x73;
var LPP_TYPE_GYROMETER = 0x86;
var LPP_TYPE_GPS_LOCATION = 0x88;

function lpp_decode(hexPayload) {
    // var buffer = Buffer.from(hexPayload, 'hex');
    var index = 0;
    var result = {};
    while (index < hexPayload.length - 1) {
        var channel = parseInt(hexPayload.substr(index, 2), 16);
        index += 2;
        var property = "";
        var byteStr = "";
        var value = 0;
        switch (parseInt(hexPayload.substr(index, 2), 16)) {
            case LPP_TYPE_DIGITAL_INPUT:
                property = "digital_input";
                value = parseInt(hexPayload.substr(index + 2, 2), 16);
                index += 4;
                break;
            case LPP_TYPE_DIGITAL_OUTPUT:
                property = "digital_output";
                value = parseInt(hexPayload.substr(index + 2, 2), 16);
                index += 4;
                break;
            case LPP_TYPE_ANALOG_INPUT:
                property = "analog_input";
                byteStr = hexPayload.substr(index + 4, 4);
                value = parseInt(byteStr, 16) / 100.0;
                index += 6;
                break;
            case LPP_TYPE_ANALOG_OUTPUT:
                property = "analog_input";
                byteStr = hexPayload.substr(index + 4, 4);
                value = parseInt(byteStr, 16) / 100.0;
                index += 6;
                break;
            case LPP_TYPE_ILLUMINANCE_SENSOR:
                property = "illuminance_sensor";
                byteStr = hexPayload.substr(index + 4, 4);
                value = parseInt(byteStr, 16);
                index += 6;
                break;
            case LPP_TYPE_PRESENCE_SENSOR:
                property = "presence_sensor";
                value = parseInt(hexPayload.substr(index + 2, 2), 16);
                index += 4;
                break;
            case LPP_TYPE_TEMPERATURE_SENSOR:
                property = "temperature_sensor";
                byteStr = hexPayload.substr(index + 2, 4);
                value = parseInt(byteStr, 16) / 10.0;
                index += 6;
                break;
            case LPP_TYPE_HUMIDITY_SENSOR:
                property = "humidity_sensor";
                byteStr = hexPayload.substr(index + 2, 2);
                value = parseInt(byteStr, 16) / 2.0;
                index += 4;
                break;
            case LPP_TYPE_ACCELEROMETER:
                property = "accelerometer";
                value = {};
                byteStr = hexPayload.substr(index + 2, 4);
                value["x"] = parseInt(byteStr, 16) / 1000.0;
                byteStr = hexPayload.substr(index + 6, 4);
                value["y"] = parseInt(byteStr, 16) / 1000.0;
                byteStr = hexPayload.substr(index + 10, 4);
                value["z"] = parseInt(byteStr, 16) / 1000.0;
                index += 14;
                break;
            case LPP_TYPE_MAGNETOMETER:
                property = "magnetometer";
                value = {};
                byteStr = hexPayload.substr(index + 2, 4);
                value["x"] = parseInt(byteStr, 16) / 1000.0;
                byteStr = hexPayload.substr(index + 6, 4);
                value["y"] = parseInt(byteStr, 16) / 1000.0;
                byteStr = hexPayload.substr(index + 10, 4);
                value["z"] = parseInt(byteStr, 16) / 1000.0;
                index += 14;
                break;
            case LPP_TYPE_BAROMETER:
                property = "barometer";
                byteStr = hexPayload.substr(index + 2, 4);
                value = parseInt(byteStr, 16) / 10.0;
                index += 6;
                break;
            case LPP_TYPE_GYROMETER:
                property = "gyrometer";
                value = {};
                byteStr = hexPayload.substr(index + 2, 4);
                value["x"] = parseInt(byteStr, 16) / 1000.0;
                byteStr = hexPayload.substr(index + 6, 4);
                value["y"] = parseInt(byteStr, 16) / 1000.0;
                byteStr = hexPayload.substr(index + 10, 4);
                value["z"] = parseInt(byteStr, 16) / 1000.0;
                index += 14;
                break;
        }
        if (result[property] === undefined) {
            result[property] = {};
        }
        result[property][channel] = value;
    }
    return result;
}

//var parsed = lpp_decode("0067031a00686b007303d600650022");
var parsed = lpp_decode(ctx.value);
// log(JSON.stringify(parsed, null, 2));

if (parsed.temperature_sensor) {
    sendAsNodeByUniqueId(
        ctx.uniqueId,
        "temperature",
        parsed.temperature_sensor[0],
        "raw_cayennelpp",
        ctx.parentNodeUniqueId
    );
}

if (parsed.humidity_sensor) {
    sendAsNodeByUniqueId(
        ctx.uniqueId,
        "humimdity",
        parsed.humidity_sensor[0],
        "raw_cayennelpp",
        ctx.parentNodeUniqueId
    );
}
if (parsed.barometer) {
    sendAsNodeByUniqueId(
        ctx.uniqueId,
        "pressure",
        parsed.barometer[0],
        "raw_cayennelpp",
        ctx.parentNodeUniqueId
    );
}

if (parsed.illuminance_sensor) {
    sendAsNodeByUniqueId(
        ctx.uniqueId,
        "illuminance",
        parsed.illuminance_sensor[0],
        "raw_cayennelpp",
        ctx.parentNodeUniqueId
    );
}
