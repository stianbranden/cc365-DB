const unitsStage = {
    denmark: {
        abbr: 'dk',
        groups: ['DK-AS-EM,AC,CH,PH', 'DK-BU-EM,AC,PH', 'DK-BUHOT-PH', 'DK-CAS-EM', 'DK-PS-PH', 'DK-STA-EM,PH', 'DK-HOT-PH']
    }/*,
    helpdesk: {

    },
    kitchen: {

    }*/
}

let units = {}
Object.keys(unitsStage).forEach(key=>{
    let u = unitsStage[key];
    units[key] = {
        abbr: u.abbr,
        groups: [],
        key
    }
    u.groups.forEach(g=>{
        let a = g.split('-');
        if ( a[2].includes(',') ){
            let cs = a[2].split(',');
            cs.forEach(c=>{
                units[key].groups.push(`${a[0]}-${a[1]}-${c}`);
            });
        } else {
            units[key].groups.push(g);
        }
    })
});
//console.log(units);


module.exports = {
    units
}