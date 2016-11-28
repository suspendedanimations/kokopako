import utils from 'utils'
import SplitText from 'gsap-splitext'

export default class {
    
    constructor(opt) {
                
        this.els = utils.js.arrayFrom(opt.els)
        this.splits = []
    }
    
    init() {
        
        this.els.forEach((el) => {
            
            const split = new SplitText(el, { type: el.getAttribute('data-split') })
            this.splits.push(split)
        })
    }

    destroy() {
        
        this.els = this.splits = undefined
    } 
}