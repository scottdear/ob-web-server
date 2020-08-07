exports.generateFakeData = (dataSetsNumber) => {
    const fakeDataSets = [];
    for (let index = 0; index < dataSetsNumber; index++)
        fakeDataSets.push(generateFakeSeaPodData());
    return fakeDataSets;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFakeSeaPodData() {
    return {
        insideTemperature: getRandomIntInclusive(15, 40),
        drinkingWaterPercentage: getRandomIntInclusive(0, 101),
        co2Percentage: getRandomIntInclusive(0, 101),
        movementAngle: getRandomIntInclusive(0, 151),
        frostWindowsPercentage: getRandomIntInclusive(0, 101),
        lowerStairsPercentage: getRandomIntInclusive(0, 101),
        solarBatteryPercentage: getRandomIntInclusive(0, 101),
        batteryPercentageWaterLeak: getRandomIntInclusive(0, 101),
        batteryPercentageFireDetectors: getRandomIntInclusive(0, 101),
        batteryPercentageC02: getRandomIntInclusive(0, 101),
    }
}

function getSeapodUser(seapodUsers, userId) {
    let user;
    seapodUsers.forEach(seaPodUser => {
        if (seaPodUser._id === userId)
            user = seaPodUser;
    });

    return user;
}
exports.isOwnerAtSeaPod = function (seapodUsers, userId) {
    const user = getSeapodUser(seapodUsers, userId);
    return user !== undefined ? user.type === "OWNER" : false;
}