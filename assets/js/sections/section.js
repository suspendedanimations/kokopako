import framework from 'framework'
import config from 'config'
import utils from 'utils'
import gsap from 'gsap'
import event from 'dom-event'
import classes from 'dom-classes'
import Default from './default'
import Smooth from '../lib/smooth/project'

class Section extends Default {
	
	constructor(opt) {
		
		super(opt)

		this.slug = 'section'
	}
	
	init(req, done) {
		
		super.init(req, done)
	}
	
	dataAdded(done) {

		super.dataAdded()
		
		const color = this.ui.section.getAttribute('data-color')

		config.updateStylesheet(color, false)
		config.color = color
		
		this.ui.back.forEach((el) => event.on(el, 'click', this.setPrevious))
		
		this.addSmooth()
		
		done()
	}

	addSmooth() {
		
		this.smooth = new Smooth({
			native: false,
			ease: .075,
			preload: true,
			vs: { mouseMultiplier: .4 },
			section: this.ui.section,
			viewport: this.ui.viewport,
			bar: this.ui.bar
		})
	}
	
	setPrevious(e) {

		config.previous = true
		framework.go('/profile')
	}

	animateIn(req, done) {
		
		classes.add(config.$body, `is-${this.slug}`)
		
		const previous = req.previous && req.previous.route
		const profile = previous && req.previous.route == '/profile'
		const project = previous && req.previous.route.substring(0,8) == '/project'		
		const color = this.ui.section.getAttribute('data-color')
		const bar = document.querySelector('._bar')
		const header = this.page.querySelector('._project_header')
		const content = this.page.querySelector('._project_content')
		const tl = new TimelineMax({ paused: true, onComplete: () => {
			setTimeout(() => {
				this.smooth.init()
				this.smooth.resize()
			}, 500)
			done()
		}})
		
		classes.add(this.ui.overflow, 'is-active')
		
		// console.warn(config.$loader, 'delay', project || !previous ? 1 : 0)

		!profile && tl.set(config.$loader, { scaleX: 1, height: 30, autoAlpha: 1, backgroundColor: `#${color}` })
		
		tl.to(this.page, .5, { autoAlpha: 1 })
		tl.to(config.$loader, .7, { height: 300, ease: Expo.easeInOut }, 0)
		tl.set(config.$loader, { autoAlpha: 0 }, '+=.3')
        tl.to(header, .5, { autoAlpha: 1 }, project || !previous ? .7 : 0)
		tl.to(content, .6, { y: 0 }, .7)
		tl.add(() => classes.add(bar, 'is-hidden'), 1.4)
		tl.restart()
	}
	
	animateOut(req, done) {
		
		const profile = config.previous
		const height = document.querySelector('._projects_overflow').getBoundingClientRect().height
		const bar = document.querySelector('._bar')

		classes.remove(config.$body, `is-${this.slug}`)
		classes.remove(bar, 'is-hidden')

		// this.smooth.vars.current < config.height && this.smooth.scrollTo(0)

		const tl = new TimelineMax({ paused: true, onComplete: () => {
			config.previous = undefined
			done()
		}})
		
		profile && tl.set(config.$loader, { height: 30 }, 0)
		profile && tl.staggerTo(this.ui.out, .6, { autoAlpha: 0 }, .06)
		profile && tl.to(config.$loader, .6, { autoAlpha: 1 }, 0)
		profile && tl.to(config.$loader, 1, { height: height, ease: Expo.easeOut }, 1)
		profile && tl.to(config.$loader, 2, { autoAlpha: 0 })
		profile && tl.to(this.page.querySelector('._project_content'), .6, { autoAlpha: 0, ease: Expo.easeOut }, 0)
		
		tl.to(this.page, .7, { autoAlpha: 0, ease: Expo.easeOut, clearProps: 'all' }, 0)
		
		tl.restart()
	}

	resize(width, height) {

		super.resize(width, height)
	}

	destroy(req, done) {

		super.destroy()
		
		this.smooth && this.smooth.destroy()
		
		this.ui.back.forEach((el) => event.off(el, 'click', this.setPrevious))

		this.page.parentNode.removeChild(this.page)
		
		done()
	}
}

module.exports = Section