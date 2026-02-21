export const CampaignData = {
    "1-1": {
        title: "외곽 쓰레기장 (The Scrapyard)",
        description: "녹슨 고철들이 나뒹구는 폐기장. 오리진으로 향하는 첫 발걸음.",
        enemyCar: "omni_police",
        playerCar: "junk_scrapper",
        cinematic: [
            { 
                time: 0, duration: 4, 
                cameraStart: { position: [0, 8, -25], lookAt: [0, 2, 0] }, 
                cameraEnd: { position: [2, 5, -15], lookAt: [0, 1, 0] }, 
                subtitle: "지구력 2563년. 제4구역, 외곽 쓰레기장.",
                sfx: "low_rumble",
                actors: [
                    { id: "player", startPos: [0, 0, 0], endPos: [0, 0, 0], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [0, 0, -200], endPos: [0, 0, -80], startRot: [0, 0, 0], endRot: [0, 0, 0] }
                ]
            },
            { 
                time: 4, duration: 6, 
                cameraStart: { position: [5, 2, -20], lookAt: [0, 1, -15] }, 
                cameraEnd: { position: [2, 1, -10], lookAt: [0, 1, -5] },
                subtitle: "[경고 시스템] 비정상적인 스펠 에너지 파장이 감지되었습니다.",
                audio: "/assets/voices/1-1_police_1.mp3",
                sfx: "glitch_beep",
                actors: [
                    { id: "player", startPos: [0, 0, 0], endPos: [0, 0, 0], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [0, 0, -80], endPos: [0, 0, -30], startRot: [0, 0, 0], endRot: [0, 0, 0] }
                ]
            },
            {
                time: 10, duration: 4.5,
                cameraStart: { position: [-4, 1.5, 2], lookAt: [0, 1, 0] },
                cameraEnd: { position: [-1, 1, -1], lookAt: [0, 1, 0] },
                subtitle: "[주인공] 젠장, 벌써 냄새를 맡았군...",
                audio: "/assets/voices/1-1_player_1.mp3",
                actors: [
                    { id: "player", startPos: [0, 0, 0], endPos: [0, 0, 0], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [0, 0, -30], endPos: [0, 0, -15], startRot: [0, 0, 0], endRot: [0, 0, 0] }
                ]
            },
            {
                time: 14.5, duration: 5.5,
                cameraStart: { position: [0, 2, -10], lookAt: [0, 0.5, 50] }, // Looking forward
                cameraEnd: { position: [10, 4, 130], lookAt: [5, 0.5, 150] }, // Fast tracking shot
                subtitle: "[주인공] 오리진 프로토콜 가동. 이 고철 덩어리가 얼마나 버틸지 보자고.",
                audio: "/assets/voices/1-1_player_2.mp3",
                sfx: "engine_rev",
                actors: [
                    // Player car drifts to the right and speeds off
                    { id: "player", startPos: [0, 0, 0], endPos: [15, 0, 150], startRot: [0, 0, 0], endRot: [0, 15, 0] },
                    { id: "omni_police", startPos: [0, 0, -15], endPos: [-5, 0, 110], startRot: [0, 0, 0], endRot: [0, 5, 0] }
                ]
            },
            {
                time: 20, duration: 5,
                cameraStart: { position: [20, 5, 150], lookAt: [15, 1, 200] },
                cameraEnd: { position: [10, 3, 350], lookAt: [15, 1, 400] },
                subtitle: "[옴니-폴리스] 용의자 도주 시도. 살상 무기 사용을 허가한다.",
                audio: "/assets/voices/1-1_police_2.mp3",
                sfx: "siren",
                actors: [
                    // Player continues speeding away at ~180km/h
                    { id: "player", startPos: [15, 0, 150], endPos: [15, 0, 400], startRot: [0, 15, 0], endRot: [0, 0, 0] },
                    // Police car chases right behind
                    { id: "omni_police", startPos: [-5, 0, 110], endPos: [5, 0, 360], startRot: [0, 5, 0], endRot: [0, 0, 0] }
                ]
            }
        ]
    }
};
