<template>
    <div>
        <div class="new">
            <button class="back" @click="navigate('MyCollections', {})">
                <font-awesome-icon icon="angle-left" />
                Go to MyCollections
            </button>
            <button class="create" @click="create = !create">Create new collection</button>
            <CreateCollection _id="new" v-if="create" @close="create = false" /> 
        </div>
        <div class="collections">
            <div 
                class="collection" 
                v-for="collection in store.state.collections" 
                :key="collection._id"
            >
                <div class="collection-header">
                    <span>
                     {{collection.name}}
                    </span>
                    <div class="icons">
                        <font-awesome-icon :icon="['far','edit']" @click="collection.edit = true" />
                        <font-awesome-icon :icon="['far', 'trash-alt']" @click="collection.delete = true"/>
                    </div> 
                </div>
                <div class="collection-delete" v-show="collection.delete">
                    <span>Remove collection?</span>
                    <button class="delete" @click="deleteCollection(collection._id)">Delete</button>
                    <button class="cancel" @click="collection.delete = false">Cancel</button>
                </div>
                <CreateCollection @close="collection.edit = false" :collection="collection" :_id="collection._id" v-if="collection.edit" />
            </div>
        </div>
    </div>

</template>


<script setup>
import CreateCollection from '../components/CreateCollection'
import {ref} from 'vue'
import {useStore} from 'vuex'
import {useRouter} from 'vue-router'

const store = useStore()
const create = ref(false)

const router = useRouter()
function navigate(name, params){
    router.push({name, params})
    menuOpen.value = false;
}

function deleteCollection(id){
    store.dispatch('removeCollection', id)
}

</script>


<style lang="scss" scoped>
   button.create, button.back {
       margin: 1rem;
       padding: 0.5rem;
       background-color: var(--buttoncolor);
       border: none;
       color: var(--textcolor);
       cursor: pointer;
   }
   .collections{
       width: 90vw;
       max-width: 500px;
       margin-inline: auto;
       .collection{
            padding: 1rem;
            background-color: var(--headercolor);
            color: var(--linkcolor);
            .collection-header{
                display: flex;
                justify-content: space-between;
                .icons > * {
                    margin-inline: 0.5rem;
                    &:hover {
                        color: var(--activelinkcolor);
                        cursor: pointer;
                    }
                }
            }
            .collection-delete {
                padding: 1rem;
                display: flex;
                justify-content: center;
                align-items: center;
                 > * {
                     margin-inline: 0.5rem;
                 }
                 > button {
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    background-color: var(--buttoncolor);
                    border: none;
                    color: var(--textcolor);
                    cursor: pointer;
                    &.delete{
                        background-color: var(--activealertbgcolor);
                    }
                    &.cancel {
                        background-color: var(--recentalertcolor);
                    }
                 }
            }
       }
   }
</style>