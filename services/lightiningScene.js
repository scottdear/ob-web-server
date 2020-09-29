const mongoose = require('mongoose');
const { SeaPod }= require('../models/seapod/seapod');
const { User } = require('../models/users/user');
const { LightiningScene } = require('../models/lightiningScene/lightiningScene');

class LightiningSceneService {
    async createLightScne(lightScene, seapodId, userId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const seapod = await SeaPod.findById(seapodId)
                .populate('lightScenes')
                .populate({
                    path: "users.lighting.lightScenes",
                    model: 'LightiningScenes'
                });

            if (!seapod) {
                return {
                    isError: true,
                    statusCode: 404,
                    error: 'SeaPod Not Found!'
                };
            }

            if (!this.isSeaPodUser(seapod, userId))
                return {
                    isError: true,
                    statusCode: 401,
                    error: 'Access denied. Not A member at the seapod!'
                }

            const user = await User.findById(userId);
            if (!user) {
                return {
                    isError: true,
                    statusCode: 404,
                    error: 'User Not Found!'
                };
            }

            let allLightScenes;
            seapod.users.forEach(sp => {
                if (sp._id == userId) {
                    allLightScenes = [...seapod.lightScenes,...sp.lighting.lightScenes];
                    return;
                }
            });

            for (var i in allLightScenes) {
                if (allLightScenes[i].sceneName.toLowerCase() === lightScene.sceneName.toLowerCase()) {
                    return {
                        isError: true,
                        statusCode: 400,
                        error: 'Duplicated Scene Name!'
                    };
                }
            }

            lightScene['seapodId'] = seapodId;
            lightScene['userId'] = userId;
            const lightiningScene = new LightiningScene(lightScene); 

            if (lightScene.source == 'seapod'){
                seapod.lightScenes.push(lightiningScene._id); //add to seapod
            } else if (lightScene.source == 'user'){
                this.addLightiningSceneId(seapod.users, userId, lightiningScene._id); //add to seaPodUser
            } else {  
                return {
                    isError: true,
                    statusCode: 400,
                    error: 'LightScene source is not defiend'
                };
            }
            
            await lightiningScene.save();
            await seapod.save();
            await session.commitTransaction();

            return {
                isError: false,
                statusCode: 201,
                lightiningScene: lightiningScene
            }

        } catch (error) {
            await session.abortTransaction();
            return {
                statusCode: 500,
                error: error.message
            };
        } finally {
            session.endSession();
        }

    }

    isSeaPodUser(seapod, userId) {
        for (const seaPodUser of seapod.users) {
            if (seaPodUser._id === userId)
                return true;
        }
        return false;
    }

    async updateLightScene(lightScene, seapodId, userId) {

        try {
            const seapod = await SeaPod.findById(seapodId)
                .populate('lightScenes')
                .populate({
                    path: "users.lighting.lightScenes",
                    model: 'LightiningScenes'
                });

            if (!seapod) {
                return {
                    isError: true,
                    statusCode: 404,
                    error: 'SeaPod Not Found!'
                };
            }

            if (!this.isSeaPodUser(seapod, userId))
                return {
                    isError: true,
                    statusCode: 401,
                    error: 'Access denied. Not A member at the seapod!'
                }

            const user = await User.findById(userId);
            if (!user) {
                return {
                    isError: true,
                    statusCode: 404,
                    error: 'User Not Found!'
                };
            }

            const selectedLighScene = await LightiningScene.findById(lightScene._id);

            let allLightScenes;
            seapod.users.forEach(sp => {
                if (sp._id == userId) {
                    allLightScenes = [...seapod.lightScenes,...sp.lighting.lightScenes];
                    return;
                }
            });

            for (var i in allLightScenes) {
                if (allLightScenes[i].sceneName.toLowerCase() === lightScene.sceneName.toLowerCase()) {
                    if (allLightScenes[i].sceneName.toLowerCase() === selectedLighScene.sceneName.toLowerCase()) continue;
                    return {
                        isError: true,
                        statusCode: 400,
                        error: 'Duplicated Scene Name!'
                    };
                }
            }

            await LightiningScene.updateOne({
                _id: lightScene._id
            }, {
                $set: lightScene
            });

            return {
                isError: false,
                statusCode: 200,
                lightiningScene: lightScene
            }

        } catch (error) {
            return {
                statusCode: 500,
                error: error.message
            };
        }

    }

    addLightiningSceneId(seaPodUsers, userId, sceneId) {
        seaPodUsers.forEach(sp => {
            if (sp._id == userId) {
                sp.lighting.lightScenes.push(sceneId);
                return;
            }
        });
    }

    async deleteLightScene(lightSceneId, userId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const user = await User.findById(userId);
            if (!user) {
                return {
                    isError: true,
                    statusCode: 404,
                    error: 'User Not Found!'
                };
            }

            const lightScene = await LightiningScene.findByIdAndDelete(lightSceneId);
            if (!lightScene) {
                return {
                    isError: true,
                    statusCode: 404,
                    error: 'Light Scene Not Found!'
                };
            }

            await SeaPod.updateMany(
                { _id: { $in: lightScene.seapodId } },
                { $pull: { 'users.$[element].lighting.lightScenes': lightSceneId } },
                { arrayFilters: [{ 'element._id': userId }] }
            );

            await SeaPod.updateMany(
                { _id: { $in: lightScene.seapodId } },
                { $pull: { 'lightScenes': lightSceneId } }
            );

            await lightScene.save();
            await session.commitTransaction();

            return {
                isError: false,
                statusCode: 200,
                lightiningScene: lightScene
            }

        } catch (error) {
            return {
                statusCode: 500,
                error: error.message
            };
        } finally {
            session.endSession();
        }
    }

    async updateManyLightScene(lightScenes, userId, seapodId, source) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const seapod = await SeaPod.findById(seapodId);
            if (!seapod) {
                return {
                    isError: true,
                    statusCode: 404,
                    error: 'SeaPod Not Found!'
                };
            }

            if (!this.isSeaPodUser(seapod, userId)) return {
                isError: true,
                statusCode: 401,
                error: 'Access denied. Not A member at the seapod!'
            }

            const user = await User.findById(userId);
            if (!user) return {
                isError: true,
                statusCode: 404,
                error: 'User Not Found!'
            };

            if(source == 'seapod'){
                await SeaPod.findByIdAndUpdate(seapodId, 
                    { $set: { 'lightScenes': lightScenes } }
                )
            } else if (source == 'user'){
                await SeaPod.findByIdAndUpdate(seapodId, 
                    { $set: { 'users.$[element].lighting.lightScenes': lightScenes } },
                    { arrayFilters: [{ 'element._id': userId }] }
                )
            } else {
                return {
                    isError: true,
                    statusCode: 400,
                    error: 'Invalid Source'
                };
            }

            await session.commitTransaction();

            return {
                isError: false,
                statusCode: 200,
                lightiningScene: lightScenes
            }

        } catch (error) {
            return {
                statusCode: 500,
                error: error.message
            };
        } finally {
            session.endSession();
        }

    }

    async updateLightSceneIntensity(userId, seapodId, intensity){
        const user = await User.findById(userId);
        if (!user) return {
            isError: true,
            statusCode: 404,
            error: 'User Not Found!'
        };

        const seapod = await SeaPod.findById(seapodId)
        .populate({
            path: 'users.lighting.lightScenes',
            model: 'LightiningScenes'
        });
        if (!seapod) return {
            isError: true,
            statusCode: 404,
            error: 'SeaPod Not Found!'
        };       

        const currentUser = seapod.users.find( user => user._id == userId )
        if(!currentUser) return {
            isError: true,
            statusCode: 401,
            error: 'Access denied. Not A member at the seapod!'
        }
    
        currentUser.lighting.intensity = intensity;
        await seapod.save();

        return {
            isError: false,
            statusCode: 200,
            lighting: currentUser.lighting
        }
    }

    async updateLightSceneStatus(userId, seapodId){
        const user = await User.findById(userId);
        if (!user) return {
            isError: true,
            statusCode: 404,
            error: 'User Not Found!'
        };
    
        const seapod = await SeaPod.findById(seapodId)
        .populate({
            path: 'users.lighting.lightScenes',
            model: 'LightiningScenes'
        });
        if (!seapod) return {
            isError: true,
            statusCode: 404,
            error: 'SeaPod Not Found!'
        };
        
        const currentUser = seapod.users.find( user => user._id == userId )
        if(!currentUser) return {
            isError: true,
            statusCode: 401,
            error: 'Access denied. Not A member at the seapod!'
        }
    
        currentUser.lighting.status = !currentUser.lighting.status;
        await seapod.save();
    
        return {
            isError: false,
            statusCode: 200,
            lighting: currentUser.lighting
        }
    }
    
    async updateSelectedLightScene(userId, seapodId, lightSceneId){
        const user = await User.findById(userId);
        if (!user) return {
            isError: true,
            statusCode: 404,
            error: 'User Not Found!'
        };
    
        const lightScene = await LightiningScene.findById(lightSceneId);
        if (!lightScene) return {
            isError: true,
            statusCode: 404,
            error: 'LightScene Not Found!'
        };
    
        const seapod = await SeaPod.findById(seapodId)
        .populate('lightScenes')
        .populate({
            path: 'users.lighting.lightScenes',
            model: 'LightiningScenes'
        });
        if (!seapod) return {
            isError: true,
            statusCode: 404,
            error: 'SeaPod Not Found!'
        };
        
        const currentUser = seapod.users.find( user => user._id == userId )
        if(!currentUser) return {
            isError: true,
            statusCode: 401,
            error: 'Access denied. Not A member at the seapod!'
        }
        
        let allLightScenes;
        seapod.users.forEach(sp => {
            if (sp._id == userId)
                allLightScenes = [...seapod.lightScenes,...sp.lighting.lightScenes];
        });
    
        const found = allLightScenes.find(scene => scene._id == lightSceneId);        
        if(!found) return {
            isError: true,
            statusCode: 401,
            error: 'Access denied. LightScene is not avaliable for this user'
        }
    
        currentUser.lighting.selectedScene = found;
        await seapod.save();
    
        return {
            isError: false,
            statusCode: 200,
            lighting: currentUser.lighting
        }
    }

    async updateLightIntensity(userId, lightSceneId, lightId, intensity){
        const user = await User.findById(userId);
        if (!user) return {
            isError: true,
            statusCode: 404,
            error: 'User Not Found!'
        };

        const lightScene = await LightiningScene.findById(lightSceneId)   
        if (!lightScene) return {
            isError: true,
            statusCode: 404,
            error: 'LightScene Not Found!'
        };

        let currentLight;
        lightScene.rooms.forEach(room =>{
            room.moodes.forEach(mood =>{
                if(mood._id == lightId) currentLight = mood
            })
        })
        
        currentLight.intensity = intensity;
        await lightScene.save();

        return {
            isError: false,
            statusCode: 200,
            lightScene: lightScene
        }
    }

    async updateLightStatus(userId, lightSceneId, lightId){
        const user = await User.findById(userId);
        if (!user) return {
            isError: true,
            statusCode: 404,
            error: 'User Not Found!'
        };

        const lightScene = await LightiningScene.findById(lightSceneId)   
        if (!lightScene) return {
            isError: true,
            statusCode: 404,
            error: 'LightScene Not Found!'
        };

        let currentLight;
        lightScene.rooms.forEach(room =>{
            room.moodes.forEach(mood =>{
                if(mood._id == lightId) currentLight = mood
            })
        })
        
        currentLight.status = !currentLight.status;
        await lightScene.save();

        return {
            isError: false,
            statusCode: 200,
            lightScene: lightScene
        }
    }

    async addDefaultLightScenes(userId, seapod){
        const day = new LightiningScene({
            source: "seapod",
            isDefault: true, 
            sceneName: "Default Day LightScene",
            rooms: [
                {
                    label: "BedRoom",
                    moodes: [
                        {
                            status: true,
                            intensity: 50,
                            lightName: "Lightstrip 1",
                            lightColor: "0xFF959B1B"
                        },
                        {
                            status: true,
                            intensity: 50,
                            lightName: "Lightstrip 2",
                            lightColor: "0xFF1322FF"
                        },
                        {
                            status: true,
                            intensity: 50,
                            lightName: "Counter 4",
                            lightColor: "0xFF9B1F0E"
                        },
                        {
                            status: true,
                            intensity: 50,
                            lightName: "Ocrhead 3",
                            lightColor: "0xFF219B8C"
                        }
                    ]
                },
                {
                    label: "Living",
                    moodes: [
                        {
                            status: true,
                            intensity: 50,
                            lightName: "Lightstrip 1",
                            lightColor: "0xFF959B1B"
                        },
                        {
                            status: true,
                            intensity: 50,
                            lightName: "Lightstrip 2",
                            lightColor: "0xFF1322FF"
                        },
                        {
                            status: true,
                            intensity: 50,
                            lightName: "Light 3",
                            lightColor: "0xFFFF1EEE"
                        }
                    ]
                }
            ],
            seapodId: seapod._id,
            userId: userId,
        });
        await day.save();

        const night = new LightiningScene({
            source: "seapod",
            isDefault: true,
            sceneName: "Default Night LightScene",
            rooms: [
                {
                    label: "BedRoom",
                    moodes: [
                        {
                            status: true,
                            intensity: 50,
                            lightName: "Lightstrip 1",
                            lightColor: "0xFF959B1B"
                        },
                        {
                            status: true,
                            intensity: 50,
                            lightName: "Lightstrip 2",
                            lightColor: "0xFF1322FF"
                        },
                        {
                            status: true,
                            intensity: 50,
                            lightName: "Counter 4",
                            lightColor: "0xFF9B1F0E"
                        },
                        {
                            status: true,
                            intensity: 50,
                            lightName: "Ocrhead 3",
                            lightColor: "0xFF219B8C"
                        }
                    ]
                },
                {
                    label: "Living",
                    moodes: [
                        {
                            status: true,
                            intensity: 50,
                            lightName: "Lightstrip 1",
                            lightColor: "0xFF959B1B"
                        },
                        {
                            status: true,
                            intensity: 50,
                            lightName: "Lightstrip 2",
                            lightColor: "0xFF1322FF"
                        },
                        {
                            status: true,
                            intensity: 50,
                            lightName: "Light 3",
                            lightColor: "0xFFFF1EEE"
                        }
                    ]
                }
            ],
            seapodId: seapod._id,
            userId: userId,
        });
        await night.save();

        seapod.lightScenes.push(
            day._id,
            night._id
        );
        await seapod.populate('lightScenes').execPopulate();

        const userAtSeapod = seapod.users.find(user =>  user._id == userId);
        if (!userAtSeapod) return {
            isError: true,
            statusCode: 404,
            error: 'User is not at Seapod'
        };
        userAtSeapod.lighting['selectedScene'] = day._id;
        await seapod.populate('users.lighting.selectedScene').execPopulate();
        
        return seapod;
    }
}

exports.LightiningSceneService = LightiningSceneService;