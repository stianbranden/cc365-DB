const User = require('../models/User')
const Access = require('../models/Access')

const getUsersWithAccess =  access_id =>{
    return new Promise( async (resolve, reject)=>{
        try {
            const access = await Access.findById(access_id)
            const q = {}
            const {rule} = access
            rule.forEach((value, key)=>{
                if ( key === 'upn' ) q._id = value
                else q[key] = value
            })
            //if ( access_id === '61c19b1c80dab6e523fb563b') console.log({rule, access, access_id, q});
            const users = await User.find(q)
            resolve(users)
        } catch (error) {
            reject(error)
        }
    })
}

const getAccessesWithUser = user_id =>{
    return new Promise( async (resolve, reject)=>{
        try {
            const allAccesses = await Access.find()
            const accesses = []
            for (let i = 0; i < allAccesses.length; i++){
                const users = await getUsersWithAccess(allAccesses[i]._id)
                if ( users.map(a=>a._id).includes(user_id) ) accesses.push(allAccesses[i])
            }
            resolve(accesses)
        } catch (error) {
            reject(error)
        }
    })
}

const pushAccesses = _=>{
    return new Promise( async (resolve, reject)=>{
        try {
            const users = await User.find()
            for ( let i = 0; i < users.length; i++){
                const user = users[i]
                const obj = {
                    pages: [],
                    custom_access: [],
                    alerts: [],
                    vizes: []
                }
                const accesses = await getAccessesWithUser(user._id)
                for ( let j = 0; j < accesses.length; j++ ){
                    const {grant, alerts, pages, vizes} = accesses[j]
                        if ( grant ){
                        grant.forEach(g=>{
                            obj.custom_access.push(genAccessLevel(g.label, g.alert, g.path))
                        })
                    }
                    if (alerts) obj.alerts.push(...alerts)
                    if (pages) obj.pages.push(...pages)
                    if (vizes) obj.vizes.push(...vizes)

                }
                await User.findByIdAndUpdate(user._id, obj)
            }
            resolve('OK')
        } catch (error) {
            reject(error)
        }
    })
}

const pushSingleUserAccess = user =>{
    return new Promise( async (resolve, reject)=>{
        try {
            const obj = {
                pages: [],
                custom_access: [],
                alerts: [],
                vizes: []
            }
            const accesses = await getAccessesWithUser(user._id)
            
            for ( let j = 0; j < accesses.length; j++ ){
                const {grant, alerts, pages, vizes} = accesses[j]
                if ( grant ){
                    grant.forEach(g=>{
                        obj.custom_access.push(genAccessLevel(g.label, g.alert, g.path))
                    })
                }
                if (alerts) obj.alerts.push(...alerts)
                if (pages) obj.pages.push(...pages)
                if (vizes) obj.vizes.push(...vizes)
            }
            await User.findByIdAndUpdate(user._id, obj)
            resolve('User ' + user.name + ' updated')
        } catch (error) {
            reject(error)
        }
    })
}



const genAccessLevel = (label='Alerts', alter='root', path)=>{
    if (!path){
      path = `/${label.toLowerCase()}/${alter}`
    }
    return {
      label,
      path,
      alter
    }
  }


module.exports = {getUsersWithAccess, getAccessesWithUser, pushAccesses, pushSingleUserAccess}