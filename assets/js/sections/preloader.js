import config from 'config'
import utils from 'utils'
import framework from 'framework'
import ajax from 'please-ajax'
import classes from 'dom-classes'
import event from 'dom-event'
import create from 'dom-create-element'
import gsap from 'gsap'

TweenLite.defaultEase = Expo.easeOut

class Preloader {
	
	constructor(onComplete) {
		
		this.preloaded = onComplete
		this.view = config.$view
		this.el = null

		this.isMobile = config.isMobile = config.width <= 1024 ? true : false
	}
	
	init(req, done) {

		classes.add(config.$body, 'is-loading')

		this.addMenu()

		ajax.get(`/data/data.json`, {
			success: (object) => {
				window.data = object.data
				this.addStylesheet()
			    done()
			}
		})
	}

	addMenu() {

		const bind = document.querySelector('._menu-icon')
		const menu = document.querySelector('._menu')
		const close = document.querySelector('._menu ._close')
		const links = utils.js.arrayFrom(document.querySelectorAll('._menu ._nav a'))

		const closest = (num, arr) => {
            let curr = arr[0]
            let diff = Math.abs (num - curr)
            for (var val = 0; val < arr.length; val++) {
                const newdiff = Math.abs(num-arr[val])
                if(newdiff < diff) {
                    diff = newdiff
                    curr = arr[val]
                }
            }
            return curr
        }

		event.on(bind, 'click', () => {

			classes.add(menu, 'is-active')

			const home = classes.has(config.$body, 'is-home')

			if(home) {

				const values = []
				const bounds = []
				const sections = utils.js.arrayFrom(document.querySelectorAll('.vs-section'))

				sections.forEach((section) => {

					const bounding = section.getBoundingClientRect()
					const top = bounding.top + config.smooth.vars.current

					bounds.push({ el: section, top: top })
					values.push(top)
				})

				const current = closest(config.smooth.vars.current, values)

				links.forEach((link, index) => {

					if(current === bounds[index].top) {
						classes.add(links[index], 'is-current')
					} else {
						classes.remove(link, 'is-current')
					}
				})
			}
		})

		event.on(close, 'click', () => classes.remove(menu, 'is-active'))

		links.forEach((el) => {
			event.on(el, 'click', (e) => {
				
				e.preventDefault()

				const target = e.currentTarget
				const anchor = target.getAttribute('data-scroll')
				const home = classes.has(config.$body, 'is-home')

				links.forEach((link) => classes.remove(link, 'is-current'))
				classes.add(target, 'is-current')

				classes.remove(menu, 'is-active')

				if(home) {
					
					const section = document.querySelector(`.vs-${anchor}`)
					const top = section.getBoundingClientRect().top + config.smooth.vars.current
					const bounding = utils.js.clamp(0, top, config.smooth.vars.bounding)

					config.smooth.scrollTo(bounding)

				} else {

					config.ref = anchor
					framework.go('/profile')
				}
			})
		})
	} 
	
	addStylesheet() {
		
		const projects = window.data.projects
		const pathname = window.location.pathname
		const slug = pathname.split('/').pop()
		const single = pathname.substring(0,9) === '/project/'

		if(single && !(slug in projects)) {
			window.location = '/profile'
		}

		const error = slug != 'home' && slug != 'profile' && slug != '/' && !single
		// const color = config.color = single ? projects[slug].index_color : error ? '151515' : projects[Object.keys(projects)[0]].index_color
		const color = config.color = single ? projects[slug].index_color : projects[Object.keys(projects)[0]].index_color
		const head = document.getElementsByTagName('head')[0]
	    const style = document.createElement('style')
	    const css = `
	    	._primary_bg {background-color: #${color};}
	    	._primary_color {color: #${color};}
	    	.page-profile ._block ul li:before {background-color: #${color};}
	    	.page-profile ._hp-row ul ._a:before {background-color: #${color};}
	    	._document a:hover {color: #${color};}
	    `
	    
	    style.setAttribute('type', 'text/css')
	    
	    if (style.styleSheet) {
	        style.styleSheet.cssText = css
	    } else {
	        style.appendChild(document.createTextNode(css))
	    }

	    head.appendChild(style)
	}
	
	resize(width, height) {
		
		config.width = width
		config.height = height
	}
	
	animateIn(req, done) {

		const tween = { index: 0 }
		const dom = config.$body.querySelector('._loader span')
		const tl = new TimelineMax({ paused: true, onComplete: () => {
			done()
			TweenMax.staggerTo(config.$body.querySelectorAll('._line'), 2, { opacity: .06, y: 0, ease: Expo.easeInOut }, .2)
			this.preloaded()
		}})
		tl.to(config.$body, 1.5, { autoAlpha: 1 })
		tl.from(config.$body.querySelector('._bg'), 2.5, { x: '-100%', ease: Expo.easeInOut }, .5)
		tl.to(tween, 2.5, { index: 87, onUpdate: () => {
			dom.innerHTML = tween.index.toFixed().length == '1' ? `0${tween.index.toFixed()}` : tween.index.toFixed()
		}, ease: Expo.easeInOut }, .5)
		tl.restart()
	}
	
	animateOut(req, done) {

		done()
	}

	destroy(req, done) {

		classes.add(config.$body, 'is-loaded')
		classes.remove(config.$body, 'is-loading')

		done()
	}
}

module.exports = Preloader