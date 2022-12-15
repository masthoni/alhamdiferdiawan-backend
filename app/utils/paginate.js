const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: rows } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems.length > 0 ? totalItems.length / limit : totalItems / limit);
  
    return { totalItems: totalItems.length > 0 ? totalItems.length : totalItems, rows, totalPages, currentPage };
};

const getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
};

module.exports = {getPagination, getPagingData}