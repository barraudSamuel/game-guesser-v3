const orderUserByScore = ((a,b) => {
    let a_pts = a.pts ?? 0
    let b_pts = b.pts ?? 0
    if (a_pts > b_pts) {
        return -1;
    }
    if (a_pts < b_pts) {
        return 1
    }

    // Si les points sont égaux, trie par ordre alphabétique de display_name
    if (a.display_name.toLowerCase() < b.display_name.toLowerCase()) {
        return -1;
    }
    if (a.display_name.toLowerCase() > b.display_name.toLowerCase()) {
        return 1;
    }

    return 0
})

export {orderUserByScore}