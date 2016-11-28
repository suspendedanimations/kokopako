import config from 'config'
import utils from 'utils'
import gsap from 'gsap';
import classes from 'dom-classes';
import Default from './default';
import Split from '../lib/split'

class FourOFour extends Default {
    
    constructor(opt) {
        
        super(opt)

        this.slug = 'error'
        this.bind = null
    }
    
    init(req, done) {
        
        super.init(req, done)
    }
    
    dataAdded(done) {

        super.dataAdded()

        this.bind = document.querySelector('._projects_bind')
        
        classes.add(this.bind, 'is-inactive')
        
        this.bind.querySelector('._').innerHTML = 'Error 404'
        
        this.addSplit()
        
        done()
    }
    
    addSplit() {
        
        const split = new Split({ els: this.ui.split })
        split.init()
    }
    
    animateIn(req, done) {

        classes.add(config.$body, `is-${this.slug}`)

        const loader = document.querySelector('._loader')

        const tl = new TimelineMax({ paused: true, onComplete: done })
        tl.to(this.page, 1, { autoAlpha: 1, ease: Expo.easeInOut })
        tl.staggerTo(this.ui.span, 1, { y: 0 }, .1)
        tl.restart()
    }

    animateOut(req, done) {
        
        const tl = new TimelineMax({ paused: true, onComplete: () => {
            classes.remove(config.$body, `is-${this.slug}`)
            done()
        }})
        tl.staggerTo(this.ui.span, .8, { y: '-100%' }, .1)
        tl.to(this.page, .6, { autoAlpha: 0, ease: Expo.easeInOut })
        tl.restart()
    }
    
    destroy(req, done) {
        
        super.destroy()

        classes.remove(this.bind, 'is-inactive')
        this.bind.querySelector('._').innerHTML = 'Projects'
        
        this.smooth && this.smooth.destroy()

        this.page.parentNode.removeChild(this.page)
        
        done()
    }
}

module.exports = FourOFour