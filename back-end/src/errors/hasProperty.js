const hasProperty = (key) => {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[key]) return next();
        else return next({ status: 400, message: `A valid "${key}" property is required.` })
    }
}

module.exports = hasProperty;