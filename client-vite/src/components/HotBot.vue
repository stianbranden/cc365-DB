
<script setup>
    import {onMounted, onBeforeUnmount, ref} from 'vue'
    import {useStore} from 'vuex'

    const store = useStore()
    let botCreated = false
    let selectedBot = store.getters.getSelectedBot



    const createBot = () => {
        selectedBot = store.getters.getSelectedBot
        if (selectedBot.key) {
            if (botCreated) removeBot()
            botCreated = true;
            const hotbot = document.createElement('script')
            //console.log('test', hotbot);
            hotbot.src = "https://chat.kindlycdn.com/kindly-chat.js"
            hotbot.async = true
            hotbot.id = "kindly-chat"
            hotbot.setAttribute("data-shadow-dom", "1")
            hotbot.setAttribute("data-bot-key", selectedBot.key)
            document.head.appendChild(hotbot)
            window.kindlyOptions = {
                position: {
                    right: '40px',
                    bubbleAvatar: '../assets/hotbot.webp'
                }
            }
            // console.log(window.kindlyChat);
        }
        else if (botCreated) removeBot()
    }

    const removeBot = () => {
        if ( botCreated){
            botCreated = false
            document.getElementById('kindly-chat').remove()
            document.getElementById("kindly-chat-api").remove()
            window.kindlyChat = null
        }
    }

    const changeBot = event =>{
        // console.log('Form changed', event.target.value)
        store.commit('setSelectedBot', event.target.value)
        createBot()
    }

    onMounted(()=>createBot())
    onBeforeUnmount(()=>removeBot())

</script>


<template>
<div>
    <div class="selector">
        <div>
            <label for="hotbot-selector">Select your hotbot</label>
            <select id="hotbot-selector" @change="changeBot($event)">
                <option v-for="bot in store.getters.getBotSelections" :selected="bot.name === selectedBot.name" :key="bot.name" :value="bot.name">{{bot.name}}</option>
            </select>
        </div>
    </div>
</div>

</template>

<style lang="scss" scoped>
    .selector {
        position: fixed;
        bottom: 40px;
        right: -190px;
        height: 100px;
        width: 200px;
        border: 1px solid white;
        border-radius: 0.5rem;
        margin: auto;
        z-index: 1000;
        > div {
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 1.5rem;
        }
        &:hover, &:focus {
            right: -10px;
        }
        transition: right 500ms ease-in;
    }
</style>