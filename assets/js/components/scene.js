import THREE from 'three'
import config from 'config'
import utils from 'utils'
import event from 'dom-event'

const vertex = `
    void main() {
        vec3 newPosition = position - (normal * 1.001);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`

const fragment = `
    uniform float opacity;
    void main() {
        gl_FragColor = vec4(1.0);
    }
`

export default class {
    
    constructor(opt) {

        this.renderer = new THREE.WebGLRenderer({ alpha: true })
        this.camera = new THREE.PerspectiveCamera(50, config.width/config.height, 1000/1000, 1000*400)
        this.scene = new THREE.Scene()
        
        this.el = document.createElement('div')
        this.el.className = opt && opt.className || '_three-container'
        this.parentNode = opt && opt.parentNode || document.body
        this.parentNode.insertBefore(this.el, this.parentNode.firstChild) || this.parentNode.appendChild(this.el)

        this.objects = window._objects = {}
        this.speeds = window.data.scene.speeds
        this.angles = window.data.scene.angles
        this.items = utils.js.arrayFrom(opt.items)

        this.mouseenter = this.mouseenter.bind(this)
        this.mouseleave = this.mouseleave.bind(this)
        this.animate = this.animate.bind(this)
        this.resize = this.resize.bind(this)

        this.tl = null
        this.rAF = null
        this.type = null
        this.current = null
        this.speed = 0.001
    }
    
    init() {

        this.addRenderer()
        this.addCamera()
        this.addEvents()
        this.addOBJ()
    }

    addCamera() {

        this.camera.position.z = 700
    }
    
    addRenderer() {

        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(config.width, config.height)

        this.el.appendChild(this.renderer.domElement)
    }

    addOBJ() {

        const color = config.color
        const objects = ['award', 'interview', 'jury', 'publication']
        const loader = new THREE.ObjectLoader()
        const shader = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment })
        const wireframe = new THREE.MeshBasicMaterial({ transparent: true, color: `#${color}`, wireframe: true, wireframeLinewidth: 1, opacity: .15 })
        const material = [shader, wireframe]
        
        let index = 0

        objects.forEach((slug) => {

            loader.load(`../assets/json/${slug}.json`, (obj) => {
                
                index++

                const geometry = obj.children[0].geometry
                const mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, material)
                
                obj.traverse((node) => {
                    if(node instanceof THREE.Mesh) {
                        node.geometry.computeFaceNormals()
                        node.geometry.computeVertexNormals()
                        node.geometry.normalsNeedUpdate = true
                    }
                })

                mesh.position.x = 0
                mesh.position.y = -50
                mesh.position.z = 0
                mesh.visible = false

                this.objects[slug] = mesh
                this.scene.add(mesh)

                index === objects.length && this.animate()
            })
        })
    }

    addEvents() {

        event.on(window, 'resize', this.resize)

        this.items.forEach((el) => {
            event.on(el, 'mouseenter', this.mouseenter)
            event.on(el, 'mouseleave', this.mouseleave)
        })
    }

    removeEvents() {

        event.off(window, 'resize', this.resize)

        this.items.forEach((el) => {
            event.off(el, 'mouseenter', this.mouseenter)
            event.off(el, 'mouseleave', this.mouseleave)
        })
    }

    mouseenter(e) {
        
        const target = e.currentTarget
        const type = this.type = target.getAttribute('data-type')
        const mesh = this.objects[type]
        const angle = this.angles[Math.floor(Math.random()*this.angles.length)]
        const speed = this.speeds[Math.floor(Math.random()*this.speeds.length)]
        
        this.tl && this.tl.progress(1).kill()

        this.current = type
        this.speed = speed

        mesh.visible = true
        mesh.rotation.x = angle
        mesh.rotation.y += 300

        TweenLite.to(this.el, .7, { autoAlpha: 1 })
    }
    
    mouseleave(e) {
        
        const target = e.currentTarget
        const type = target.getAttribute('data-type')
        const mesh = this.objects[type]
        const tl = this.tl = new TimelineMax({ paused: true, onComplete: () => mesh.visible = false })
        tl.to(this.el, .3, { autoAlpha: 0 })
        tl.restart()
    }
    
    resize() {
        
        this.camera.aspect = config.width/config.height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(config.width,config.height)
    }

    animate() {
        
        if(this.type)
            this.objects[this.type].rotation.y += this.speed

        this.rAF = requestAnimationFrame(this.animate.bind(this))
        this.camera.lookAt(this.scene.position)
        this.renderer.render(this.scene, this.camera)
    }

    destroy() {

        this.removeEvents()
        
        cancelAnimationFrame(this.rAF)

        this.renderer = null
        this.camera = null
        this.scene = null
        
        this.parentNode.removeChild(this.el)
    }
}