import SplitText from 'gsap-splitext'

export default class {
    
    constructor(opt) {
        
        this.els = opt.els
        this.type = this.el.getAttribute('data-split')
        this.splits = undefined
    }
    
    init(req, done) {
        
        this.els.forEach((el) => {
            
            const split = new SplitText(this.el, { type: this.type })
            this.splits.push(split)
        })
        
    }

    destroy() {
        
        this.split = undefined
    } 
}