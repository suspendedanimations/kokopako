import config from 'config'
import utils from 'utils'
import classes from 'dom-classes'
import Smooth from 'smooth-scrolling'

class Default extends Smooth {

    constructor(opt) {

        super(opt)

        this.dom.section = opt.section
    }
    
    init() {
        
        super.init()
    }
    
    resize() {
                
        this.resizing = true
        
        this.vars.bounding = this.dom.section.getBoundingClientRect().height - (this.vars.native ? 0 : config.height)
        
        super.resize()
        
        this.resizing = false
    }
    
    scrollTop(opt = { target: 0, duration: .8, onComplete: () => {}, ease: Expo.easeInOut }) {
        
        const tween = this.vars.native ? window : this.vars
        const obj = this.vars.native ? { scrollTo: { y: opt.target, autoKill: !config.is.mobile() } } : { target: opt.target }
        
        _.extend(obj, { onComplete: opt.onComplete, ease: opt.ease })
        
        TweenLite.to(tween, opt.duration, obj)
    }

    run() {
        
        super.run()

        this.transform = this.vars.target.toFixed(1) != this.vars.current.toFixed(1)

        if(this.dom.section) {
            const t1 = this.transform ? this.vars.current.toFixed(2) : Math.round(this.vars.current)
            this.dom.section.style['will-change'] = this.transform ? 'transform' : ''
            this.dom.section.style[this.prefix] = this.getTransform(t1 * -1)
        }
        
        this.transform ? classes.add(config.$body, 'is-scrolling') : classes.remove(config.$body, 'is-scrolling')
    }
    
    clearProps() {
        
        this.dom && this.dom.section && (this.dom.section.style[this.prefix] = this.dom.section.style['will-change'] = '')
    }
    
    destroy() {
        
        super.destroy()
        this.clearProps()
    }
}

export default Default