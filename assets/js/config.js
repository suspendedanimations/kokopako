import domselect from 'dom-select'

const config = {
	
	PATH: '',
	BASE: '/',
	
	index: 0,
	color: null,
	ref: undefined,
	objects: undefined,

	$body: document.body,
	$view: domselect('._view'),
	$loader: domselect('._open_loader'),

	width: window.innerWidth,
	height: window.innerHeight,

	isMobile: false,
	
	updateStylesheet: (color, objects) => {
		
		const style = document.querySelector('style')
        const css = `
	    	._primary_bg {background-color: #${color};}
	    	._primary_color {color: #${color};}
	    	.page-profile ._block ul li:before {background-color: #${color};}
	    	.page-profile ._hp-row ul ._a:before {background-color: #${color};}
	    	._document a:hover {color: #${color};}
	    `

	    style.innerHTML = css
	    
	    if(objects) {
	    	for(let index in window._objects) { 
	            if(window._objects.hasOwnProperty(index)) {
	                
	                window._objects[index].children[1].material.color.setHex(`0x${color}`)
	            }
	        }
	    }
    }
}

export default config