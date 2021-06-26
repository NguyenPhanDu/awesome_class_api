function pagination(array, page, perPage){
    let start = (page - 1) * perPage
    let end = page * perPage
    const items = array.slice(start, end);
    return items;
}

module.exports = {
    pagination
}