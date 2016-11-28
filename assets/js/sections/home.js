import config from 'config'
import utils from 'utils'
import classes from 'dom-classes'
import Default from './default'
import Scene from '../components/scene'
import Split from '../lib/split'
import Smooth from '../lib/smooth/home'

class Home extends Default {
	
	constructor(opt) {
		
		super(opt)

		this.slug = 'home'
		this.ui = null
		this.previous = null
	}
	
	init(req, done) {

		this.previous = config.previous
		this.previous && classes.add(config.$body, 'is-previous')
		
		super.init(req, done)
	}
	
	dataAdded(done) {

		super.dataAdded()

		this.addScene()
		this.addSplit()
		this.addSmooth()
		super.addList(this.previous)
		
		done()
	}
	
	addSmooth() {

		console.warn('home addSmooth', this.previous)
		
		this.smooth = config.smooth = new Smooth({
			native: false,
			ease: .075,
			vs: { mouseMultiplier: .4 },
			section: this.ui.section,
			viewport: this.ui.viewport
		})

		this.smooth.init()
		this.previous && this.smooth.off(false)
	}
	
	addScene() {
		
		this.obj = new Scene({
			parentNode: document.querySelector('._view'),
			items: this.page.querySelectorAll('ul li a')
		})
		
		this.obj.init()
	}
	
	addSplit() {
		
		const split = new Split({ els: this.ui.split })
		split.init()
	}

	animateIn(req, done) {
		
		classes.add(config.$body, `is-${this.slug}`)
		
		const tl = new TimelineMax({ paused: true, onComplete: () => {

			classes.add(this.page, 'animate-in')
			
			if(config.ref) {
				
				const section = this.page.querySelector(`.vs-${config.ref}`)
				const top = section.getBoundingClientRect().top + this.smooth.vars.current
				const bounding = utils.js.clamp(0, top, this.smooth.vars.bounding)
				
				setTimeout(() => {
					this.smooth.scrollTo(bounding)
				}, 1000)
				
				delete config.ref
			}
			
			done()
		}})
		tl.to(this.page, 1, { autoAlpha: 1 })
		tl.restart()
	}
	
	animateOut(req, done) {
		
		classes.remove(config.$body, `is-${this.slug}`)

		TweenLite.to(this.page, 0.7, {
			autoAlpha: 0,
			ease: Expo.easeInOut,
			onComplete: done
		})
	}

	destroy(req, done) {

		super.destroy()
		
		this.obj && this.obj.destroy()
		this.smooth && this.smooth.destroy()
		this.list && this.list.destroy()
		
		this.ui = null
		this.previous = null

		delete config.smooth

		this.page.parentNode.removeChild(this.page)
		
		done()
	}
}

module.exports = Home