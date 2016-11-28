import framework from 'framework'
import config from 'config'
import utils from 'utils'
import event from 'dom-event'
import classes from 'dom-classes'
import Split from '../lib/split'
import Hammer from 'hammerjs'
import Hamster from 'hamsterjs'
import Mustache from 'mustache'
import create from 'dom-create-element'

export default class {
    
    constructor(opt) {
        
        this.template()

        this.smooth = opt.smooth

        this.state = {
            ready: false,
            index: undefined,
            length: this.index.length-1,
            animating: false,
            open: false
        }

        this.options = {
            delta: opt.delta || 5
        }

        this.hamster = new Hamster(config.$body)
        this.hammer = new Hammer.Manager(config.$body)
        this.delay = undefined

        this.click = this.click.bind(this)
        this.scroll = this.scroll.bind(this)
        this.swipe = this.swipe.bind(this)
        this.toggle = this.toggle.bind(this)
        this.mouseenter = this.mouseenter.bind(this)
    }

    template() {

        let index = 1

        const parent = document.getElementById('_project_list')
        const template = document.getElementById('template').innerHTML
        const projects = window.data.projects
        const data = {'projects': []}
        
        for (var prop in projects){
            if (projects.hasOwnProperty(prop)){

                const i = index.toString().length === 1 ? `0${index}` : index
                
                data.projects.push({
                    'index': i,
                    'key' : prop,
                    'data' : projects[prop]
                })

                index++
            }
        }
        
        Mustache.parse(template)

        const rendered = Mustache.render(template, data)
        const el = this.el = create({ selector: 'div', styles: '_projects_list', html: rendered })
        
        parent.innerHTML = ''
        parent.appendChild(el)
        
        this.bindUIElements()
    }

    bindUIElements() {

        this.overflow = document.querySelector('._projects_overflow')
        this.bind = document.querySelector('._projects_bind')
        this.link = document.querySelector('._projects_list ._project_link')
        this.list = utils.js.arrayFrom(this.el.querySelectorAll('._projects_list li'))
        this.splits = utils.js.arrayFrom(this.el.querySelectorAll('.js-split'))
        
        this.index = utils.js.arrayFrom(this.el.querySelectorAll('._project_index .el'))
        this.title = utils.js.arrayFrom(this.el.querySelectorAll('._project_title .el'))
        this.agency = utils.js.arrayFrom(this.el.querySelectorAll('._project_agency .el'))
        this.bg = utils.js.arrayFrom(this.el.querySelectorAll('._project_bg ._bg'))
    }

    init(previous) {

        this.previous = previous
        
        this.addSplit()

        this.addEvents()

        this.animate(config.index, this.list[config.index])

        this.previous && this.toggle()
    }

    addSplit() {

        const split = new Split({ els: this.splits })
        split.init()
    }

    addEvents() {

        this.list.forEach((el) => {
            event.on(el, 'click', this.click)
            event.on(el, 'mouseenter', this.mouseenter)
        })

        event.on(this.link, 'click', this.click)
        event.on(this.bind, 'click', this.toggle)

        this.hammer.add(new Hammer.Swipe())
        this.hammer.on('swipe', this.swipe)

        this.hamster.wheel(this.scroll)
    }

    removeEvents() {

        this.list.forEach((el) => {
            event.off(el, 'click', this.click)
            event.off(el, 'mouseenter', this.mouseenter)
        })

        event.off(this.link, 'click', this.click)
        event.off(this.bind, 'click', this.toggle)

        this.hammer.off('swipe', this.swipe)
        this.hammer.destroy()

        this.hamster.unwheel(this.scroll)
    }

    toggle(e) {

        e && e.preventDefault()
        
        this.state.open ? this.animateOut() : this.animateIn()
    }

    click(e) {

        const target = e.currentTarget
        const href = target.getAttribute('data-href')
        const color = target.getAttribute('data-color')
        const index = target.getAttribute('data-index')
        const bar = document.querySelector('._bar')
        const bg = document.querySelector('._bar ._bg')
        const loader = config.$loader
        
        // bg.style['background-color'] = 
        loader.style['background-color'] = `#${color}`
        
        TweenMax.set(loader, { height: '', autoAlpha: 1, scaleX: 0 })
        TweenMax.to(loader, 1.5, { scaleX: 1, ease: Expo.easeOut, onComplete: () => {

            classes.add(this.el, 'is-hidden')

            this.animateOut()

            framework.go(href)
        }})
    }

    mouseenter(e) {
        
        const target = e.currentTarget
        const index = Math.abs(target.getAttribute('data-index')) - 1
        
        this.state.animating = false

        clearTimeout(this.delay)

        this.animate(index)
    }

    scroll(event, delta, deltaX, deltaY) {

        if(!this.state.open || this.state.animating || delta > -this.options.delta && delta < this.options.delta) return
        
        const index = this.getNext(delta)

        this.animate(index, true)
    }

    swipe(e) {

        const delta = e.deltaY

        if(!this.state.open || this.state.animating || delta > -this.options.delta && delta < this.options.delta) return
          
        const index = this.getNext(delta)

        this.animate(index, true)
    }

    getNext(delta) {
        
        const next = delta >= this.options.delta ? this.state.index - 1 : this.state.index + 1

        return next < 0 ? this.state.length : next > this.state.length ? 0 : next
    }

    animate(index, delay = false) {

        if(this.state.animating || this.state.index === index) return

        if(delay) {

            clearTimeout(this.delay)
            this.state.animating = true
        }
        
        const previous = typeof this.state.index === 'number'
        const color = this.list[index].getAttribute('data-color')
        const href = this.list[index].getAttribute('data-href')

        const check = (el, i) => {
            if(i === index) {
                classes.remove(el, 'is-less')
                classes.remove(el, 'is-greater')
                classes.add(el, 'is-current')
            } else {
                if (i === this.state.index) {
                    classes.remove(el, 'is-current')
                }
                index > i ? classes.add(el, 'is-less') : classes.add(el, 'is-greater')
            }
        }
        
        previous && classes.remove(this.list[this.state.index], 'is-current')
        
        this.index.forEach((el, i) => check(el, i))
        this.title.forEach((el, i) => check(el, i))
        
        previous && classes.remove(this.agency[this.state.index], 'is-current')
        previous && classes.remove(this.bg[this.state.index], 'is-current')

        classes.add(this.agency[index], 'is-current')
        classes.add(this.bg[index], 'is-current')

        classes.add(this.list[index], 'is-current')
        
        this.link.setAttribute('data-href', href)
        this.link.setAttribute('data-color', color)
        this.link.setAttribute('data-index', index)
                
        config.color = color
        config.index = this.state.index = index

        if(delay) {
           this.delay = setTimeout(() => {
                this.state.animating = false
            }, 1000)
        }
    }
    
    animateIn() {

        const loader = document.querySelector('._loader_bg')
        const done = () => {
            classes.add(this.overflow, 'is-active')
            this.state.open = true
        }

        this.smooth.off(false)
        
        this.el.style['pointer-events'] = 'auto'

        classes.add(this.bind, 'is-active')
        classes.add(config.$body, 'is-open')
        
        if(!this.previous) {
            TweenMax.to(loader, .9, { scaleX: 1, ease: Expo.easeOut, clearProps: 'transform', onComplete: done })
        } else {
            TweenMax.set(loader, { autoAlpha: 0, scaleX: 1 })
            TweenMax.to(loader, 1.6, { autoAlpha: 1, onComplete: done })
        }
    }

    animateOut(done) {

        classes.remove(config.$body, 'is-previous')
        classes.remove(this.overflow, 'is-active')
        classes.remove(this.bind, 'is-active')

        this.smooth.on(false)

        classes.remove(config.$body, 'is-open')

        this.el.style['pointer-events'] = 'none'

        this.state.open = false

        config.updateStylesheet(config.color, true)

        done && setTimeout(done, 1000)
    }

    destroy() {

        this.removeEvents()
    }
}