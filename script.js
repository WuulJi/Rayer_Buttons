//Vue3 setup() 語法
const { createApp, ref, onMounted, onUnmounted } = Vue;

const app = createApp({
    setup() {
        const sounds = ref([]);
        const playingKey = ref(null);
        let audioMap = {}; // 預載音效
        let playingAudios = [];

        const fetchSounds = async () => {
            const jsonURL = "https://wuulji.github.io/Rayer_Buttons/sounds.json";
            try {
                const response = await fetch(jsonURL);
                sounds.value = await response.json();
                console.log("音效列表載入完成:", sounds.value);

                // 預載音效
                sounds.value.forEach(({ key, sound }) => {
                    audioMap[key] = new Audio(sound);
                });
            } catch (error) {
                console.error("載入 JSON 失敗:", error);
            }
        };

        const handleKeydown = (event) => {
            const key = event.key.toLowerCase();
            
            if (key === "escape") {
                playingAudios.forEach(audio => {
                    audio.pause();
                    audio.currentTime = 0;
                });
                playingAudios = [];
            } else if (audioMap[key]) {
                audioMap[key].currentTime = 0;
                audioMap[key].play();
                playingAudios.push(audioMap[key]);
                playingKey.value = key;

                setTimeout(() => {
                    playingKey.value = null;
                }, 300);
            }
        };

        onMounted(() => {
            fetchSounds();
            document.addEventListener("keydown", handleKeydown);
        });

        onUnmounted(() => {
            document.removeEventListener("keydown", handleKeydown);
        });

        return { sounds, playingKey };
    }
});

//Vue2 methods 語法
/*const keyMap = { "q": 0, "w": 1, "e": 2, "a": 3, "s": 4, "d": 5, "z": 6, "x": 7, "c": 8 };

// Vue 應用程式
const app = Vue.createApp({
    data() {
        return { 
			sounds: [],
			audioMap: {}, // 儲存 key -> Audio 物件的映射
			playingKey: null // 記錄當前播放的按鍵
		};
    },
    async created() {
        const jsonURL = "https://wuulji.github.io/Rayer_Buttons/sounds.json";
        try {
            const response = await fetch(jsonURL);
            this.sounds = await response.json();
			console.log("音效列表載入完成:", this.sounds);
			
			// 預先載入音效並存入 audioMap
			this.sounds.forEach((soundObj, index) => {
			const key = Object.keys(keyMap).find(k => keyMap[k] === index);
			if (key) {
				this.audioMap[key] = new Audio(soundObj.sound);
			}
			});
		
        } catch (error) {
            console.error("載入 JSON 失敗:", error);
        }
    },
    mounted() {
	// **音效載入完成後才監聽鍵盤事件**
	document.addEventListener("keydown", this.handleKeydown);
	},
		
	methods: {
		handleKeydown(event) {
			const key = event.key.toLowerCase(); // 轉小寫，確保大小寫無關
			
			if (key === "escape") {
				// 停止所有音效
				Object.values(this.audioMap).forEach(audio => {
					audio.pause();
					audio.currentTime = 0; // 重置播放位置
				});
				this.playingKey = null;
			}
			else if (this.audioMap[key]) {
						const audio = this.audioMap[key];
						audio.currentTime = 0; // 重新播放
						audio.play();
						
						this.playingKey = key;
						setTimeout(() => {
							this.playingKey = null;
						}, 300);
			}			
		}
	},
	beforeUnmount() {
		// **離開頁面時移除鍵盤監聽，避免記憶體洩漏**
		document.removeEventListener("keydown", this.handleKeydown);
	}
});*/

// Vue 組件
app.component("sound-button", {
    props: ["label", "sound", "playingKey"],
    template: `
        <button class="sound-button" :class="{ playing: isPlaying }" @click="playSound">
            {{ label }}
        </button>
    `,
	setup(props, { emit }) {
		// 音效播放狀態
		//const isPlaying = Vue.computed(() => props.playingKey === props.label[0].toLowerCase());
		const isPlaying = Vue.computed(() => {
			const currentKey = props.label[0].toLowerCase(); // 取得按鍵對應的字母
			return props.playingKey === currentKey; // 檢查是否正在播放
		});

		// 播放音效的方法
		const playSound = (event) => {
			const audio = new Audio(props.sound); // 使用 prop 中的 sound URL
			audio.play().catch(error => {
				console.error("音效播放失敗:", error);
			});
			
			// 發送播放事件
			emit("update:playingKey", props.label[0].toLowerCase()); // 通知父層播放_同步音效和動畫

			// 設定超時移除效果
			setTimeout(() => {
				emit("update:playingKey", null);
			}, 300);
		};

		return {
			isPlaying,  // 將狀態暴露給模板template
			playSound,  // 將方法暴露給模板template
		};
	},
    
    /*methods: {
        playSound() {
            const audio = new Audio(this.sound);
            audio.play();
            this.$emit("play", this.label);
			
			// 加入視覺回饋效果
			const button = event.target;
			button.classList.add("playing");

			// 短時間後移除 class，讓動畫能夠重新觸發
			setTimeout(() => button.classList.remove("playing"), 300);
        }
    }*/
});

// 掛載 Vue 應用
app.mount("#app");

// 夜間模式切換
document.getElementById("dark-mode-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});