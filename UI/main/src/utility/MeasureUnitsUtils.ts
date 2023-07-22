export enum MeasureUnit {
    METRIC = 0,
    FREEDOM = 1
}

export enum TemperatureUnit {
    CELSIUS = 0,
    FARENHEIT = 1,
    KELVIN = 2
}

export function kilogramsTo(value: number, unit: MeasureUnit, perMonth: boolean = false): [string, Record<string, string>] {
    const keyPath = perMonth ? "montly" : "linear";
    const unitArr = MetricUnitsEntries.mass[keyPath][unit];
    switch (unit) {
        case MeasureUnit.FREEDOM:
            if (value > 910) {
                const val = kilogramToShortTon(value);
                return [unitArr[1], { VALUE: val.toFixed(Math.max(0, 3 - val.toFixed(0).length)) }]
            } else {
                return [unitArr[0], { VALUE: kilogramToPounds(value).toFixed(0) }]
            }
        default:
            if (value > 1000) {
                const val = kilogramToTon(value);
                return [unitArr[1], { VALUE: val.toFixed(Math.max(0, 3 - val.toFixed(0).length)) }]
            } else {
                return [unitArr[0], { VALUE: value.toFixed(0) }]
            }
    }
}


export function metersTo(value: number, unit: MeasureUnit): [string, Record<string, string>] {
    const unitArr = MetricUnitsEntries.distance.linear[unit];
    switch (unit) {
        case MeasureUnit.FREEDOM:
            if (value > 1610) {
                const val = meterToMile(value);
                return [unitArr[2], { VALUE: val.toFixed(Math.max(0, 3 - val.toFixed(0).length)) }]
            } else if (value > 33) {
                const val = meterToYard(value);
                return [unitArr[1], { VALUE: val.toFixed(Math.max(0, 3 - val.toFixed(0).length)) }]
            } else {
                return [unitArr[0], { VALUE: meterToFoot(value).toFixed(0) }]
            }
        default:
            if (value > 1000) {
                const val = meterToKilometer(value);
                return [unitArr[1], { VALUE: val.toFixed(Math.max(0, 3 - val.toFixed(0).length)) }]
            } else {
                return [unitArr[0], { VALUE: value.toFixed(0) }]
            }
    }
}


export function squareMetersTo(value: number, unit: MeasureUnit, perMonth: boolean = false): [string, Record<string, string>] {
    const keyPath = perMonth ? "montly" : "linear";
    const unitArr = MetricUnitsEntries.mass[keyPath][unit];
    switch (unit) {
        case MeasureUnit.FREEDOM:
            if (value > 4050) {
                const val = squareMeterToAcres(value);
                return [unitArr[1], { VALUE: val.toFixed(Math.max(0, 3 - val.toFixed(0).length)) }]
            } else {
                return [unitArr[0], { VALUE: squareMeterToSquareFoot(value).toFixed(0) }]
            }
        default:
            if (value > 1000) {
                const val = squareMeterToSquareKilometer(value);
                return [unitArr[1], { VALUE: val.toFixed(Math.max(0, 3 - val.toFixed(0).length)) }]
            } else {
                return [unitArr[0], { VALUE: value.toFixed(0) }]
            }
    }
}

export function cubicMetersTo(value: number, unit: MeasureUnit, perMonth: boolean = false): [string, Record<string, string>] {
    const keyPath = perMonth ? "montly" : "linear";
    const unitArr = MetricUnitsEntries.mass[keyPath][unit];
    switch (unit) {
        case MeasureUnit.FREEDOM:
            return [unitArr[0], { VALUE: cubicMeterToGallons(value).toFixed(0) }]
        default:
            return [unitArr[0], { VALUE: value.toFixed(0) }]

    }
}

export const MetricUnitsEntries = {
    volume: {
        linear: {
            [MeasureUnit.FREEDOM]: ["Common.VALUE_GALLON"],
            [MeasureUnit.METRIC]: ["Common.VALUE_CUBIC_METER"],
        },
        monthly: {
            [MeasureUnit.FREEDOM]: ["Common.VALUE_GALLON_PER_MONTH"],
            [MeasureUnit.METRIC]: ["Common.VALUE_CUBIC_METER_PER_MONTH"],
        }
    },
    area: {

        linear: {
            [MeasureUnit.FREEDOM]: ["Common.VALUE_SQUARE_FOOT", "Common.VALUE_ACRE"],
            [MeasureUnit.METRIC]: ["Common.VALUE_SQUARE_METER", "Common.VALUE_SQUARE_KILOMETER"],
        },
        monthly: {
            [MeasureUnit.FREEDOM]: ["Common.VALUE_SQUARE_FOOT_PER_MONTH", "Common.VALUE_ACRE_PER_MONTH"],
            [MeasureUnit.METRIC]: ["Common.VALUE_SQUARE_METER_PER_MONTH", "Common.VALUE_SQUARE_KILOMETER_PER_MONTH"],
        }
    },
    distance: {
        linear: {
            [MeasureUnit.FREEDOM]: ["Common.VALUE_FOOT", "Common.VALUE_YARD", "Common.VALUE_MILE"],
            [MeasureUnit.METRIC]: ["Common.VALUE_METER", "Common.VALUE_KILOMETER"],
        }
    },
    mass: {
        linear: {
            [MeasureUnit.FREEDOM]: ["Common.VALUE_POUND", "Common.VALUE_SHORT_TON"],
            [MeasureUnit.METRIC]: ["Common.VALUE_KILOGRAM", "Common.VALUE_TON"],
        },
        monthly: {
            [MeasureUnit.FREEDOM]: ["Common.VALUE_POUND_PER_MONTH", "Common.VALUE_SHORT_TON_PER_MONTH"],
            [MeasureUnit.METRIC]: ["Common.VALUE_KILOGRAM_PER_MONTH", "Common.VALUE_TON_PER_MONTH"],
        }
    }
}


function celsiusToFarenheit(e: number) { return 9 * e / 5 + 32 }
function celsiusToKelvin(e: number) { return e + 273.16 }
function cubicMeterToGallons(e: number) { return 264.172 * e }
function kilogramToPounds(e: number) { return e / .45359237 }
function kilogramToShortTon(e: number) { return e / 907.18474 };
function kilogramToTon(e: number) { return e / 1000 };
function squareMeterToSquareFoot(e: number) { return e / .092903 };
function squareMeterToAcres(e: number) { return e / 4046.873 };
function squareMeterToSquareKilometer(e: number) { return e / 1_000_000 };
function meterToFoot(e: number) { return e / .3048 };
function meterToYard(e: number) { return e / .9144 };
function meterToMile(e: number) { return e / 1609.344 };
function meterToKilometer(e: number) { return e / 1_000 };
/**
 * 
 */

