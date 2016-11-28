import config from 'config'
import utils from 'utils'
import classes from 'dom-classes'
import Default from './default'

class Parallax extends Default {
    
    constructor(opt) {

        super(opt)
        
        this.dom.viewport = utils.js.arrayFrom(opt.viewport)
        
        this.getCache = this.getCache.bind(this)
        this.inView = this.inView.bind(this)

        this.cache = null
    }

    resize() {

        this.resizing = true

        this.getCache()
        
        super.resize()
    }

    getCache() {
        
        this.cache = []
        
        for (let index = 0; index < this.dom.viewport.length; index++) {
            
            const el = this.dom.viewport[index]

            el.style.display = ''
            el.style[this.prefix] = ''
            
            const scroll = this.vars.target
            const bounding = el.getBoundingClientRect()
            const bounds = {
                el: el,
                bounding: bounding,
                state: true,
                parentNode: el.parentNode,
                height: bounding.height,
                top: bounding.top + scroll,
                bottom: bounding.bottom + scroll,
                speed: el.getAttribute('data-speed') || 0,
            }

            this.cache[this.cache.length] = bounds
        }
    }
    
    run() {

        super.run()

        for (let index = 0; index < this.dom.viewport.length; index++) {
            
            this.inView(this.dom.viewport[index], index)
        }
    }
    
    inView(el, index) {
        
        if(!this.cache || this.resizing) return
        
        const cache = this.cache[index]
        
        if(!cache) return
        
        const current = this.vars.current
        const transform = ((cache.top - cache.height/2) - current) * cache.speed
        const top = Math.round(cache.top - current)
        const bottom = Math.round((cache.bottom + Math.abs(transform)) - current)
        const visible = bottom > 0 && top < config.height
        
        if(cache.speed != 0) {
            
            const t1 = this.transform ? transform.toFixed(2) : Math.round(transform)
            
            el.style[this.prefix] = visible ? this.getTransform(t1) : ''
            el.style['will-change'] = visible && this.willchange ? 'transform' : ''
            el.style['pointer-events'] = visible ? '' : 'none'
        }
        
        // debug line: `bottom` should return the same as calling `el.getBoundingClientRect().bottom`
        // if(index === 0) console.log(visible, bottom.toFixed(), el.getBoundingClientRect().bottom.toFixed())
        
        visible ? (classes.add(el, 'in-viewport'), classes.remove(el, 'from-bottom')) : (classes.remove(el, 'in-viewport'), top > 0 && classes.add(el, 'from-bottom'))   
    }
    
    clearProps() {
        
        super.clearProps()
        
        this.dom.viewport.forEach((el, index) => el.style.display = el.style[this.prefix] = '')
    }

    destroy() {

        super.destroy()
        
        this.cache = null
    }
}

export default Parallax