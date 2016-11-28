import framework from 'framework'
import config from 'config'
import utils from 'utils'
import $ from 'dom-select'
import event from 'dom-event'
import classes from 'dom-classes'
import query from 'query-dom-components'
import List from '../components/projects'

class Default {
    
    constructor(opt = {}) {
        
        this.view = config.$view
        this.page = null
        this.a = null
    }
    
    init(req, done, options = { cache: true, sub: false }) {
        
        const view = this.view
        const ready = this.dataAdded.bind(this, done)
        const page = this.page = utils.biggie.loadPage(req, view, options, ready)
    }

    dataAdded(done) {

        this.ui = query({ el: this.page })
        
        this.a = $.all('a', this.page)
        
        utils.biggie.addRoutingEL(this.a)
    }
    
    addList(previous) {
        
        this.list = new List({ smooth: this.smooth })
        this.list.init(previous)
    }
    
    resize(width, height) {
        
        config.height = height
        config.width = width
    }
    
    destroy() {
        
        utils.biggie.removeRoutingEL(this.a)
        
        this.a = null
    }
}

module.exports = Default