import framework from 'framework'
import cache from 'cache'
import config from 'config'
import ajax from 'please-ajax'
import create from 'dom-create-element'
import classes from 'dom-classes'
import Mustache from 'mustache'

const utils = {
	
	css: {
		
		getRect(right, bottom, left=0, top=0) {

			return `rect(${top}px, ${right}px, ${bottom}px, ${left}px)`;
		}
	},
	
	js: {
		
		arrayFrom(opt) {
			
			return Array.prototype.slice.call(opt, 0);
		},
		
		clamp(min, value, max) {

			return Math.max(min, Math.min(value, max));
		},
		
		scrollTop() {

			if (window.pageYOffset) return window.pageYOffset;
			return document.documentElement.clientHeight ? document.documentElement.scrollTop : document.body.scrollTop;
		}
	},
	
	biggie: {
		
		addRoutingEL(a) {

			utils.js.arrayFrom(a).forEach((el) => el.onclick = utils.biggie.handleRoute)
		},

		removeRoutingEL(a) {

			utils.js.arrayFrom(a).forEach((el) => el.onclick = null)
		},

		handleRoute(e) {
        	
	        const target = e.currentTarget

	        if(classes.has(target, 'no-route') || target.hasAttribute('target') && target.getAttribute('target') == '_blank') return
	        
	        e.preventDefault()

	        framework.go(target.getAttribute('href'))
	    },

		getSlug(req, options) {
			
			let route = req.route === '/' ? '/home' : req.route === '404' ? '/404' : req.route
			const params = Object.keys(req.params).length === 0 && JSON.stringify(req.params) === JSON.stringify({})
			
			if(!params) {
				
				for (var key in req.params) {
			        if (req.params.hasOwnProperty(key)) {

			        	if(route.indexOf(key) > -1) {
			        		route = route.replace(`:${key}`, options.sub ? '' : req.params[key])
			        	}
			        }
			    }
			}
			
			if(route.substring(route.length-1) == '/') {
				route = route.slice(0, -1)
			}

			return route.substr(1)
		},
		
		createPage(req, slug) {
			
			const cn = slug.substring(0,7) === 'project' ? 'project' : slug.replace('/', '-')
			
			return create({
				selector: 'div',
				id: `page-${cn}`,
				styles: `page page-${cn}`
			})
		},
		
		loadPage(req, view, options, done) {
			
			const slug = utils.biggie.getSlug(req, options)
			const page = utils.biggie.createPage(req, slug)
			
			if(!cache[slug] || !options.cache) {
				
				const data = req.params.id ? window.data.projects[req.params.id] : window.data
				const href = slug.substring(0,7) === 'project' ? 'project' : slug
				
				if(req.params.id) {
					
					const projects = window.data.projects
					let index = 1
					
					data.projects = []
			        
			        for (var prop in projects){
			            if (projects.hasOwnProperty(prop)){
			            	
			                const i = index.toString().length === 1 ? `0${index}` : index
			                const o = {
			                    'index': i,
			                    'current': req.params.id === prop,
			                    'key': prop,
			                    'data': projects[prop]
			                }	                
			                
			                if(req.params.id === prop) {
			                	
			                	// data.projects.unshift(o)
			                	config.index = index-1
			                	config.color = projects[prop].index_color
			                	
			                } else {
			                	
			                	// data.projects.push(o)
			            	}
			            	
			            	data.projects.push(o)

			                index++
			            }
			        }
				}
				
 				ajax.get(`/templates/${href}.mst`, {
 					success: (object) => {
 						const rendered = Mustache.render(object.data, data)
					    page.innerHTML = rendered
 						if(options.cache) {
 							cache[slug] = rendered
 						}
 						done()
 					}
 				})
 				
 			} else {
						
 				page.innerHTML = cache[slug]
 				setTimeout(done, 500)
 			}
 			
 			view.appendChild(page)

			return page
		}
	}
}

export default utils
