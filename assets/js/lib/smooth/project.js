import config from 'config'
import utils from 'utils'
import classes from 'dom-classes'
import Default from './parallax'

class Project extends Default {
    
    constructor(opt) {

        super(opt)
        
        this.dom.header = document.querySelector('header')
        this.dom.bar = opt.bar
    }

    resize() {

        super.resize()
                
        this.vars.bounding += 81
    }

    run() {

        super.run()
        
        // const t1 = this.transform ? this.vars.current.toFixed(2) : Math.round(this.vars.current)
        // this.dom.header.style['will-change'] = this.transform ? 'transform' : ''
        // this.dom.header.style[this.prefix] = this.getTransform(t1 * -1)
        
        this.vars.current > 400 ? classes.add(this.dom.bar, 'is-visible') : classes.remove(this.dom.bar, 'is-visible')
    }
}

export default Project