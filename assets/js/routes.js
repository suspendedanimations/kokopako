/* ----------
all routes needs to be defined inline
see https://github.com/bigwheel-framework/documentation/blob/master/routes-defining.md#as-section-standard-form
---------- */
module.exports = {
	'/': '/profile',
    '/home': '/profile',
	'/profile': { section: require('./sections/home') },
	'/project/:id': { section: require('./sections/section'), duplicate: true },
    '404': require('./sections/error')
}