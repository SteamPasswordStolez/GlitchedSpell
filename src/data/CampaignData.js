export const CampaignData = {
    "1-1": {
        title: "외곽 쓰레기장 (The Scrapyard)",
        description: "녹슨 고철들이 나뒹구는 폐기장. 오리진으로 향하는 첫 발걸음.",
        config: {
            trackLength: 3000,
            fogColor: 0x050510,
            neonColors: [0x00ffff, 0xff00ff], // Cyan, Magenta
            checkpointColor: 0x00ffff,
            obstacleChance: 0.3,
            checkpoints: [
                [0, 15, 600],
                [30, 15, 1400],
                [0, 15, 2200]
            ]
        },
        enemyCar: "omni_police",
        playerCar: "junk_scrapper",
        cinematic: [
            { 
                time: 0, duration: 4, 
                fadeFromBlack: true,
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
                glitch: true, glitchDuration: 600, shake: 0.3,
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
                flash: true, shake: 1.5,
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
        ],
        outro: [
            {
                time: 0, duration: 5,
                fadeFromBlack: false, shake: 0.1,
                cameraStart: { position: [10, 2, -20], lookAt: [0, 1, 30] },
                cameraEnd: { position: [2, 1, -5], lookAt: [0, 1, 10] },
                subtitle: "[주인공] 1구역 돌파 완료. 타이어 마모율 15%... 아직 쓸만해.",
                sfx: "engine_rev",
                actors: [
                    { id: "player", startPos: [0, 0, 0], endPos: [0, 0, 100], startRot: [0, 0, 0], endRot: [0, 0, 0] }
                ]
            }
        ]
    },
    "1-2": {
        title: "지하 접속로 (The Underpass)",
        description: "추격을 피해 도시의 버려진 하수도로 진입했다. 공간이 좁아 피하기 쉽지 않다.",
        config: {
            trackLength: 5000,
            fogColor: 0x051005,
            neonColors: [0x00ff00, 0x8800ff], // Green, Deep Purple
            checkpointColor: 0x00ff00,
            obstacleChance: 0.55,
            checkpoints: [
                [0, 15, 800],
                [-40, 15, 1600],
                [40, 15, 2400],
                [0, 15, 3200],
                [20, 15, 4000]
            ]
        },
        enemyCar: "omni_police",
        playerCar: "junk_scrapper",
        cinematic: [
            { 
                time: 0, duration: 5, 
                fadeFromBlack: true,
                cameraStart: { position: [0, 15, -30], lookAt: [0, 5, 100] }, 
                cameraEnd: { position: [0, 5, 10], lookAt: [0, 2, 50] }, 
                subtitle: "[주인공] 따돌린 줄 알았더니 귀신같이 따라붙네. 하수도 냄새보다 지독한 놈들.",
                audio: "/assets/voices/1-2_player_1.mp3",
                sfx: "low_rumble",
                actors: [
                    { id: "player", startPos: [0, 0, 0], endPos: [0, 0, 80], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                ]
            },
            {
                time: 5, duration: 6,
                glitch: true, glitchDuration: 800, shake: 0.4,
                cameraStart: { position: [-10, 3, 20], lookAt: [0, 2, 50] },
                cameraEnd: { position: [10, 2, 100], lookAt: [0, 1, 150] },
                subtitle: "[경고 시스템] 전방에 대규모 차단선이 감지되었습니다. 우회 루트 탐색 불가.",
                audio: "/assets/voices/sys_warning_1.mp3",
                sfx: "glitch_beep",
                actors: [
                    { id: "player", startPos: [0, 0, 80], endPos: [0, 0, 180], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [-5, 0, 20], endPos: [-5, 0, 140], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [5, 0, 20], endPos: [5, 0, 140], startRot: [0, 0, 0], endRot: [0, 0, 0] }
                ]
            },
            {
                time: 11, duration: 5,
                flash: true, shake: 2.0,
                cameraStart: { position: [0, 4, 150], lookAt: [0, 2, 250] }, // Looking forward
                cameraEnd: { position: [-5, 5, 250], lookAt: [5, 1, 350] }, // Fast tracking shot
                subtitle: "[주인공] 우회할 생각 없다. 그냥 뚫어버린다. 꽉 잡아!",
                audio: "/assets/voices/1-2_player_2.mp3",
                sfx: "engine_rev",
                actors: [
                    { id: "player", startPos: [0, 0, 180], endPos: [0, 0, 350], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [-5, 0, 140], endPos: [-5, 0, 290], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [5, 0, 140], endPos: [5, 0, 290], startRot: [0, 0, 0], endRot: [0, 0, 0] }
                ]
            },
            {
                time: 16, duration: 6,
                shake: 0.5,
                cameraStart: { position: [0, 10, 300], lookAt: [0, 1, 400] },
                cameraEnd: { position: [15, 6, 450], lookAt: [0, 1, 550] },
                subtitle: "[옴니-폴리스] 타겟이 가속구간에 진입했습니다. 포획망을 전개합니다.",
                audio: "/assets/voices/1-2_police_1.mp3",
                sfx: "siren",
                actors: [
                    { id: "player", startPos: [0, 0, 350], endPos: [10, 0, 550], startRot: [0, 0, 0], endRot: [0, 10, 0] },
                    { id: "omni_police", startPos: [-5, 0, 290], endPos: [5, 0, 490], startRot: [0, 0, 0], endRot: [0, 5, 0] },
                    { id: "omni_police", startPos: [5, 0, 290], endPos: [15, 0, 490], startRot: [0, 0, 0], endRot: [0, 5, 0] }
                ]
            }
        ],
        outro: [
            {
                time: 0, duration: 6,
                glitch: true, glitchDuration: 1000, shake: 0.5,
                cameraStart: { position: [0, 5, 20], lookAt: [0, 2, -50] }, // Looking backwards at pursuing cops
                cameraEnd: { position: [0, 2, 5], lookAt: [0, 1, -100] },
                subtitle: "[경고 시스템] 구조적 결함 감지. 다음 섹터는 코어 방어벽입니다.",
                sfx: "glitch_beep",
                actors: [
                    { id: "player", startPos: [0, 0, 0], endPos: [0, 0, 120], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [-10, 0, -50], endPos: [-10, 0, 20], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [10, 0, -50], endPos: [10, 0, 20], startRot: [0, 0, 0], endRot: [0, 0, 0] }
                ]
            }
        ]
    },
    "1-3": {
        title: "코어 타워 외곽 (Neon Ascent)",
        description: "도시의 심장부로 다가갈수록 적들의 저항이 거세진다. 멈추면 죽는다.",
        config: {
            trackLength: 4500,
            fogColor: 0x100505,
            neonColors: [0xff3300, 0xffaa00], // Bright Red, Orange
            checkpointColor: 0xff3300,
            obstacleChance: 0.7,
            checkpoints: [
                [0, 15, 600],
                [30, 15, 1200],
                [-30, 15, 1800],
                [40, 15, 2500],
                [0, 15, 3200],
                [0, 15, 3800]
            ]
        },
        enemyCar: "omni_police",
        playerCar: "junk_scrapper",
        cinematic: [
            { 
                time: 0, duration: 6, 
                fadeFromBlack: true, shake: 0.3,
                cameraStart: { position: [20, 20, 0], lookAt: [0, 0, 50] }, 
                cameraEnd: { position: [-10, 5, 100], lookAt: [0, 2, 150] }, 
                subtitle: "[옴니-폴리스 통제소] 전 병력에 알린다. 용의자가 코어 섹터 3에 진입했다. 파괴를 허가한다.",
                audio: "/assets/voices/1-3_police_1.mp3",
                sfx: "siren",
                actors: [
                    { id: "player", startPos: [0, 0, 0], endPos: [0, 0, 100], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [-15, 0, -50], endPos: [-5, 0, 80], startRot: [0, 10, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [15, 0, -50], endPos: [5, 0, 80], startRot: [0, -10, 0], endRot: [0, 0, 0] }
                ]
            },
            {
                time: 6, duration: 5,
                flash: true, shake: 2.5,
                cameraStart: { position: [0, 3, 120], lookAt: [0, 2, 200] },
                cameraEnd: { position: [5, 2, 250], lookAt: [0, 0.5, 300] },
                subtitle: "[주인공] 드디어 본색을 드러내시네. 코어까지 얼마 안 남았어. 니트로 최대 출력!!",
                audio: "/assets/voices/1-3_player_1.mp3",
                sfx: "engine_rev",
                actors: [
                    { id: "player", startPos: [0, 0, 100], endPos: [0, 0, 300], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [-5, 0, 80], endPos: [-5, 0, 260], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [5, 0, 80], endPos: [5, 0, 260], startRot: [0, 0, 0], endRot: [0, 0, 0] }
                ]
            },
            {
                time: 11, duration: 6,
                glitch: true, glitchDuration: 1000, shake: 1.0,
                cameraStart: { position: [-10, 1, 280], lookAt: [0, 1, 400] }, // Looking up
                cameraEnd: { position: [0, 8, 450], lookAt: [0, 2, 600] }, // Panning across
                subtitle: "[경고 시스템] 후면 장갑 손상률 40%. 다수의 고속 접근 중.",
                audio: "/assets/voices/sys_warning_2.mp3",
                sfx: "glitch_beep",
                actors: [
                    { id: "player", startPos: [0, 0, 300], endPos: [0, 0, 600], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [-5, 0, 260], endPos: [-10, 0, 560], startRot: [0, 0, 0], endRot: [0, -5, 0] },
                    { id: "omni_police", startPos: [5, 0, 260], endPos: [10, 0, 560], startRot: [0, 0, 0], endRot: [0, 5, 0] },
                    { id: "omni_police", startPos: [0, 0, 220], endPos: [0, 0, 550], startRot: [0, 0, 0], endRot: [0, 0, 0] } // 4th police
                ]
            }
        ],
        outro: [
            {
                time: 0, duration: 8,
                flash: true, shake: 0.1,
                cameraStart: { position: [0, 1, 5], lookAt: [0, 1, 50] }, // Deep low angle close up 
                cameraEnd: { position: [-2, 0.5, 2], lookAt: [0, 1, 50] },
                subtitle: "[주인공] ...다 왔어. 심장부 장벽이 눈앞이다. \n곧 만나러 갈게.",
                sfx: "low_rumble",
                actors: [
                    { id: "player", startPos: [0, 0, 0], endPos: [0, 0, 50], startRot: [0, 0, 0], endRot: [0, 0, 0] } // Moves very slowly (bullet time feel)
                ]
            }
        ]
    },
    "1-4": {
        title: "코어 방어벽 (Alpha-Omega)",
        description: "모든 것을 파괴하는 거대 병기가 길을 막아섰다. 부딪히기 전에 박살내라.",
        boss: "alpha_omega",
        config: {
            trackLength: 6000,
            fogColor: 0x200505,
            neonColors: [0xff0000, 0xff0000], // Blood Red
            checkpointColor: 0xff0000,
            obstacleChance: 0.2, // Less obstacles to focus on boss
            checkpoints: [] // NO CHECKPOINTS FOR BOSS
        },
        enemyCar: "omni_police", // Minions if needed, but boss is primary
        playerCar: "junk_scrapper",
        cinematic: [
            { 
                time: 0, duration: 6, 
                fadeFromBlack: true, shake: 1.0, flash: true,
                cameraStart: { position: [0, 5, 100], lookAt: [0, 3, 200] }, 
                cameraEnd: { position: [0, 8, 250], lookAt: [0, 5, 300] }, 
                subtitle: "[경고 시스템] 치명적인 질량 구조체 접근 중. 회피 기동을 권장합니다.",
                sfx: "siren",
                actors: [
                    { id: "player", startPos: [0, 0, 0], endPos: [0, 0, 150], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [0, 0, 200], endPos: [0, 0, 350], startRot: [0, 0, 0], endRot: [0, 0, 0] } // Placeholder for Boss
                ]
            },
            {
                time: 6, duration: 5,
                glitch: true, glitchDuration: 1500, shake: 2.0,
                cameraStart: { position: [-15, 2, 250], lookAt: [0, 5, 350] },
                cameraEnd: { position: [-5, 5, 300], lookAt: [0, 5, 350] },
                subtitle: "[알파-오메가] 침입자 확인. 압살 프로토콜을 시작한다.",
                sfx: "low_rumble",
                actors: [
                    { id: "player", startPos: [0, 0, 150], endPos: [0, 0, 250], startRot: [0, 0, 0], endRot: [0, 0, 0] },
                    { id: "omni_police", startPos: [0, 0, 350], endPos: [0, 0, 350], startRot: [0, 0, 0], endRot: [0, 0, 0] } // Boss waits
                ]
            }
        ]
    }
};
