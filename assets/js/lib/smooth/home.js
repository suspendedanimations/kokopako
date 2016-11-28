import config from 'config'
import utils from 'utils'
import classes from 'dom-classes'
import Default from './parallax'

class Home extends Default {
    
    constructor(opt) {

        super(opt)
        
        this.dom.header = document.querySelector('header')
        this.dom.loader = document.querySelector('._loader div')
    }

    resize() {
        
        super.resize()

        this.vars.bounding += 215
    }
    
    run() {

        super.run()
        
        const t1 = this.transform ? this.vars.current.toFixed(2) : Math.round(this.vars.current)
        this.dom.header.style['will-change'] = this.dom.loader.style['will-change'] = this.transform ? 'transform' : ''
        this.dom.header.style[this.prefix] = this.dom.loader.style[this.prefix] = this.getTransform(t1 * -1)
    }
    
    clearProps() {
        
        super.clearProps()
        
        this.dom.header.style['will-change'] = ''
        this.dom.header.style[this.prefix] = ''
    }

    destroy() {

        super.destroy()
    }
}

export default Home