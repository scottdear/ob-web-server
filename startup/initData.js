const mongoose = require('mongoose');
const { SeaPodConfig } = require('../models/seapod/seaPodConfig');
const { LightConfig } = require('../models/seapod/lightConfig');

module.exports = async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //create lightConfig
        const bigBedroom5Lights = new LightConfig({
            label: "Big Bedroom 5 Lights",
            compatibleRoomTypes: ["Bedroom"],
            lights: [{
                label: "Led line 1",
                canChangeColor: false,
                canChangeIntensity: true
            },
            {
                label: "Led line 2",
                canChangeColor: false,
                canChangeIntensity: true
            },
            {
                label: "Big center bulb",
                canChangeColor: true,
                canChangeIntensity: false
            },
            {
                label: "Night lamp 1",
                canChangeColor: true,
                canChangeIntensity: true
            },
            {
                label: "Night lamp 2",
                canChangeColor: true,
                canChangeIntensity: true
            }]
        });
        LightConfig.exists({label: "Big Bedroom 5 Lights"}, async (err, res) => {
            if (!res) await bigBedroom5Lights.save();
        });
        
        const smallBedroom3Lights = new LightConfig({
            label: "Small Bedroom 3 Lights",
            compatibleRoomTypes: ["Bedroom"],
            lights: [{
                label: "Led line",
                canChangeColor: true,
                canChangeIntensity: true
            },
            {
                label: "Central ceiling light",
                canChangeColor: false,
                canChangeIntensity: true
            },
            {
                label: "Night lamp",
                canChangeColor: true,
                canChangeIntensity: true
            }]
        });
        LightConfig.exists({label: "Small Bedroom 3 Lights"}, async (err, res) => {
            if (!res) await smallBedroom3Lights.save();
        });
        
        const twoBrightLights = new LightConfig({
            label: "Two Bright Lights",
            compatibleRoomTypes: ['Bedroom', 'Bathroom', 'Kitchen', 'Living Room'],
            lights: [{
                label: "Ceiling light 1",
                canChangeColor: true,
                canChangeIntensity: false
            },
            {
                label: "Ceiling light 2",
                canChangeColor: true,
                canChangeIntensity: false
            }]
        });
        LightConfig.exists({label: "Two Bright Lights"}, async (err, res) => {
            if (!res) await twoBrightLights.save();
        });
        
        const oneCustomizableLight = new LightConfig({
            label: "One Customizable Light",
            compatibleRoomTypes: ["Bedroom", "Bathroom", "Kitchen", "Living Room"],
            lights: [{
                label: "The One",
                canChangeColor: true,
                canChangeIntensity: true
            }]
        });
        LightConfig.exists({label: "One Customizable Light"}, async (err, res) => {
            if (!res) await oneCustomizableLight.save();
        });

        //create seaPodConfig model "A"
        const modelA = new SeaPodConfig({
            model: "A",
            rooms: [{
                label: "Main Bedroom",
                type: "Bedroom",
                lightConfig: bigBedroom5Lights._id
            },
            {
                label: "Small Bedroom 1",
                type: "Bedroom",
                lightConfig: smallBedroom3Lights._id
            },
            {
                label: "Small Bedroom 2",
                type: "Bedroom",
                lightConfig: smallBedroom3Lights._id
            },
            {
                label: "Main Bathroom",
                type: "Bathroom",
                lightConfig: twoBrightLights._id
            },
            {
                label: "Secondary Bathroom",
                type: "Bathroom",
                lightConfig: oneCustomizableLight._id
            },
            {
                label: "Kitchen",
                type: "Kitchen",
                lightConfig: oneCustomizableLight._id
            }]
        });
        SeaPodConfig.exists({model: "A"}, async (err, res) => {
            if (!res) await await modelA.save();
        });

        await session.commitTransaction();

    } catch (error) {
        await session.abortTransaction();
        return {
            isError: true,
            statusCode: 500,
            error: error.message
        }
    } finally {
        session.endSession();
    }
};