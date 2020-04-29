const unitsStage = {
    denmark: {
        abbr: 'dk',
        groups: ['DK-AS-EM,AC,CH,PH,CB', 'DK-BU-EM,AC,PH,CB', 'DK-BUHOT-PH,CB', 'DK-CAS-EM', 'DK-PS-PH,CB', 'DK-STA-EM,PH,CB', 'DK-HOT-PH,CB']
    },
    helpdesk: {
        abbr: 'thd',
        groups: [
            'DK-HDP-PH,CB', 
            'DK-HDF-PH,CB',
            'FI-HDP-PH,CB',
            'FI-HDF-PH,CB',
            'NO-HDP-PH,CB',
            'NO-HDF-PH,CB',
            'SE-HDP-PH,CB',
            'SE-HDF-PH,CB',
        ]
    },
    kitchen: {
        abbr: 'k&i',
        groups: ['DK-KI-PH,CB,EM,AC',
            'NO-KI-PH,CB,EM,AC',
            'SE-KI-PH,CB,EM,AC',
            'DK-KIHOT-PH,CB',
            'NO-KIHOT-PH,CB',
            'SE-KIHOT-PH,CB',
            'NC-KI-PH,EM,AC'
        ]
    }
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