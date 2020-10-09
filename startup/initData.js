const mongoose = require('mongoose');
const { SeaPodConfig } = require('../models/seapod/seaPodConfig');
const { RoomConfig } = require('../models/seapod/roomConfig');

module.exports = async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //create roomConfig
        const bigBedroom5Lights = new RoomConfig({
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
        RoomConfig.exists({label: "Big Bedroom 5 Lights"}, async (err, res) => {
            if (!res) await bigBedroom5Lights.save();
        });
        
        const smallBedroom3Lights = new RoomConfig({
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
        RoomConfig.exists({label: "Small Bedroom 3 Lights"}, async (err, res) => {
            if (!res) await smallBedroom3Lights.save();
        });
        
        const twoBrightLights = new RoomConfig({
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
        RoomConfig.exists({label: "Two Bright Lights"}, async (err, res) => {
            if (!res) await twoBrightLights.save();
        });
        
        const oneCustomizableLight = new RoomConfig({
            label: "One Customizable Light",
            compatibleRoomTypes: ["Bedroom", "Bathroom", "Kitchen", "Living Room"],
            lights: [{
                label: "The One",
                canChangeColor: true,
                canChangeIntensity: true
            }]
        });
        RoomConfig.exists({label: "One Customizable Light"}, async (err, res) => {
            if (!res) await oneCustomizableLight.save();
        });

        //create seaPodConfig model "A"
        const modelA = new SeaPodConfig({
            model: "A",
            rooms: [{
                label: "Main Bedroom",
                type: "Bedroom",
                roomConfig: bigBedroom5Lights._id
            },
            {
                label: "Small Bedroom 1",
                type: "Bedroom",
                roomConfig: smallBedroom3Lights._id
            },
            {
                label: "Small Bedroom 2",
                type: "Bedroom",
                roomConfig: smallBedroom3Lights._id
            },
            {
                label: "Main Bathroom",
                type: "Bathroom",
                roomConfig: twoBrightLights._id
            },
            {
                label: "Secondary Bathroom",
                type: "Bathroom",
                roomConfig: oneCustomizableLight._id
            },
            {
                label: "Kitchen",
                type: "Kitchen",
                roomConfig: oneCustomizableLight._id
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