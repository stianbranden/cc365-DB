<script setup>

import {ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import {DateTime} from 'luxon'
const {VUE_APP_API_ROOT} = process.env

const route = useRoute()
const bot = ref(route.params.bot)
const chat = ref(route.params.chat)
const transcript = ref([])
const meta = ref()
let interval;
let first = true
getTranscript();

watch(
    _=> route.params.chat,
    getTranscript

)
//https://app.kindly.ai/workspace/2348/inbox/chat/637c8362ed96928c0ad3dcee
const getLang = _=>{
    const code = meta.value.language_code
    if ( code=== 'sv') return 'Swedish'
    if ( code=== 'nb') return 'Norwegian'
    if ( code=== 'da') return 'Danish'
    if ( code=== 'fi') return 'Finnish'
    return 'Jibberish '
}

function getTranscript(){
    //console.log('Run');
    if (first){
        first = false
        chat.value = route.params.chat
        bot.value = route.params.bot
        //console.log('first');
        interval = setInterval(getTranscript, 10000)
    }
    fetch(`${VUE_APP_API_ROOT}chattranscript/${bot.value}/${chat.value}`)
        .then(data=>data.json())
        .then(data=>{
            transcript.value = data.messages
            meta.value = data.chat
            meta.value.language = getLang()
            meta.value.botname = 'Elbot'
            if (bot.value === 2398 ) meta.value.botname = 'Gigabotti'
            if (!meta.value.active) clearInterval(interval)
            //console.log({meta, transcript});
        })
}


</script>

<template>
  <div>
    <div class="meta" v-if="meta">
        <div class="flex">
            <div class="label">Language</div>
            <div class="value">{{meta.language}} </div>
        </div>
        <div v-if="meta.context.agentDisplayName" class='flex'>
            <div class="label">Agent name</div>
            <div class="value">{{meta.context.agentDisplayName}} </div>
        </div>
        <div v-if="meta.context.takeover_email && !meta.context.takeover_email.endsWith('kindlyid')" class='flex'>
            <div class="label">Customer email</div>
            <div class="value">{{meta.context.takeover_email}} </div>
        </div>
        <div v-else class='flex'>
            <div class="label">Customer</div>
            <div class="value">Anonymous</div>
        </div>
        <div class="flex">
            {{DateTime.fromISO(meta.created).toFormat("DDD @TTT")}}
        </div> 
        <div class="flex" v-if="meta.active">
            ONGOING CHAT... Transcript will refresh every 10 seconds
        </div>
        <div class="flex" v-else>
            Chat completed
        </div>
    </div>
    <div class="meta" v-else>
        Loading {{chat}} for {{bot}}
    </div>

    <div class="transcript" v-if="transcript.length">
        <div class="message" v-for="message in transcript">
            <div class="info">
                <div class="sender BOT" v-if="message.sender=='BOT'">{{meta.botname}}</div>
                <div class="sender AGENT" v-else-if="message.sender=='AGENT'">{{message.name}}</div>
                <div class="sender SYSTEM" v-else-if="message.sender=='SYSTEM'">Automatic message</div>
                <div class="sender" v-else>Customer</div>
                <div class="time">{{DateTime.fromISO(message.created).toFormat("@TT")}}</div>
            </div>
            <div class="text" :class="message.sender" v-html="message.message"></div>
        </div>
    </div>

  </div>
</template>


<style lang="scss" scoped>
    .meta {
        margin-inline: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        //border: 1px solid white;
        max-width: 400px;
        .flex {
            display: flex;
            margin-block: 0.5rem;
            > div{
                margin-inline: 1rem;
            }
            .label {
                align-self: flex-end;
            }
            .value {
                align-self: flex-start;
            }
        }
    }
    .transcript {

        .message {
            margin: 1rem 3rem;
            display: grid;
            grid-template-columns: 100px auto;
            .text {
                &.BOT {
                    background: #{lighten($brand-color, 10%)};
                    color: white;
                }
                &.AGENT {
                    background: #{lighten($secondary-brand-color, 10%)};
                    color: white;
                }
                &.SYSTEM {
                    background: #{lighten($bar-font-color, 10%)};
                }
                &.USER {
                    background: #{lighten($pop-brand-color, 10%)};
                    color: white;
                }

                text-align: left;
                border: 1px solid white;
                border-radius: 1rem 1rem 1rem 0;
                padding: 0.5rem;
                background: white;
                color: black;
            }
            .info {
                display: flex;
                flex-direction: column;
                justify-content: space-around;
            }
        }
    }
</style>
