<script setup>
import {useStore} from 'vuex'
import {ref} from 'vue'
const store = useStore()
const open = ref(false)
</script>

<template>
    <li class="info" title="Version number">
        <div class="icon-btn">
            <font-awesome-icon icon="code-branch" @click="open = !open" />
        </div>
        <span>v{{store.state.version}}</span>
    </li>
    <Teleport v-if="open" to="#modal"> 
        <div class="modal-drop" @click="open = !open" >
            <div class="modal-container">
                <div class="modal-container-header">
                    Release notes
                </div>
                <div class="release-note" v-for="note in store.state.releaseNotes" key="note._id">
                    <div class="note-header">
                        {{note.version}} - {{note.name}}
                    </div>
                    <div class="note-content" v-html="note.content" />
                </div>
            </div>
        </div>
    </Teleport>
</template>


<style lang="scss">
    .icon-btn {
        cursor: pointer;
    }
    .modal-drop {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 998;
        // opacity: 50%;
        height: 100vh;
        width: 100vw;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0,0,0,0.5);
        .modal-container {
            background-color: rgba(255,255,255,0.9);
            z-index: 999;
            width: 60vw;
            min-width: 400px;
            max-width: 800px;
            height: 80vh;
            position: relative;
            display: flex;
            // justify-content: center;
            align-items: center;
            flex-direction: column;
            border-radius: 1rem;
            .modal-container-header {
                color: #{$brand-color};
                font-size: 2rem;
                font-weight: bold;
                margin-block: 2rem;
            }
            .release-note {
                padding: 1rem;
                
                .note-header{
                    font-size: 1.5rem;
                    color: #{$secondary-brand-color};
                }
                .note-content {
                    li {
                        list-style: none;
                        padding-left: 1rem;
                    }
                }
            }
        }
    }
</style>