const ARROW_TAG_NAME = 'select-arrow'
const OPTION_TAG_NAME = 'select-option'
const SELECT_TAG_NAME = 'select-dropdown'

class SelectArrow extends HTMLElement {
    constructor() {
        super()

        const observer = new MutationObserver(mutations => this.update(mutations))
        observer.observe(this, { childList: true, subtree: true, attributes: false })
    }

    connectedCallback() {
        this.setAttribute('slot', 'arrow')

        if (!this.hasAttribute('position'))
            this.setAttribute('position', 'right')
    }

    update() {
        this.parentElement?.update_button()
    }
}

class SelectOption extends HTMLElement {
    static get observedAttributes() { return ['label', 'value', 'selected'] }

    constructor() {
        super()

        const observer = new MutationObserver(mutations => this.update(mutations))
        observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ['label', 'value', 'selected'] })
    }

    connectedCallback() {
        if (this.hasAttribute('button-content'))
            return

        this.addEventListener('mousedown', () => this.click())
        this.addEventListener('mouseover', () => this.parentElement.preselect(this))
        this.addEventListener('keydown', event => this.keydown(event))

        this.setAttribute('slot', 'option')

        if (this.hasAttribute('selected'))
            this.parentElement.set_option(this, true)

        if (this.hasAttribute('placeholder'))
            this.parentElement.check_selected()
    }

    attributeChangedCallback(name, previous, current) {
        if (!this.parentElement)
            return

        // case 1: it was selected and it's not now
        if (name === 'selected' && previous === '' && current === null)
            return this.parentElement.check_selected()
        // case 2: label or value has changed or selected has been added
        if (this.hasAttribute('selected'))
            return this.parentElement.set_option(this, true)
    }

    update(mutations) {
        if (!this.parentElement)
            return

        mutations.forEach(mutation => {
            // case 1: it was selected and it's not now
            if (mutation.target === this && mutation.attributeName == 'selected' && !this.hasAttribute('selected'))
                return this.parentElement.check_selected()
            // case 2: label or value has changed or selected has been added, or the content has changed
            if (this.hasAttribute('selected'))
                return this.parentElement.set_option(this, true)
        })
    }

    click() {
        if (this.hasAttribute('disabled') || this.hasAttribute('button-content'))
            return
        this.parentElement.set_option(this)
    }

    set value(x) {
        this.setAttribute('value', x)
    }

    get value() {
        if (this.hasAttribute('value'))
            return this.getAttribute('value')
        if (this.hasAttribute('placeholder'))
            return undefined
        return this.textContent
    }
}

class SelectDropdown extends HTMLElement {
    constructor() {
        super()

        const template = document.createElement('template')

        template.innerHTML = `
            <style>
                :host(select-dropdown) {
                    display: inline-flex;
                    flex-direction: column;
                }

                :host(select-dropdown[disabled]) {
                    opacity: 0.5
                }

                :host > button {
                    color: #568;
                    background: #fff;
                    border: 1px solid #e8eaed;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    box-shadow: 0 1px 3px -2px #9098A9;
                    text-align: left;
                    font-family: 'Roboto', sans-serif;
                    padding: 0;
                }

                :host > button.opened {
                    border-radius: 5px 5px 0 0;
                    border-bottom: 0;
                }

                :host > button:focus-visible {
                    outline: 2px solid #68ceff;
                }

                :host > button.opened:focus-visible {
                    outline: 0
                }

                :host > .after_button {
                    height: 0;
                    overflow:visible;
                    z-index: 99999;
                }

                :host > .after_button > .options {
                    color: #568;
                    background: #fff;
                    border: 1px solid #e8eaed;
                    border-radius: 0 0 5px 5px;
                    z-index: 100;
                    visibility: hidden;
                    max-height: 0px;
                    box-sizing: border-box;
                    box-shadow: 0 1px 3px -2px #9098A9;
                }

                :host > .after_button > .options.opened {
                    visibility: visible;
                    max-height: unset;
                }

                :host(select-dropdown[disabled]) > .after_button > .options.opened {
                    visibility: hidden
                }

                ::slotted(select-option) {
                    border-bottom: 1px solid #e8eaed;
                    padding: 7px 12px;
                    display: block;
                    cursor: pointer;
                    white-space: nowrap;
                    font-family: 'Roboto', sans-serif;
                    width: -webkit-fill-available; 
                }

                ::slotted(select-option.auto-width) {
                    width: min-content;
                }

                ::slotted(select-option:last-child) {
                    border: 0
                }

                ::slotted(select-option[pre-selected]), ::slotted(select-option:focus-within) {
                    background: #68ceff;
                    color: #ffffff;
                    outline: 0;
                }

                ::slotted(select-option[selected]) {
                    background: #d9f0ff;
                    color: #05b0ff;
                }

                ::slotted(select-option[disabled]) {
                    background: #ededed;
                    cursor: default;
                    color: #adadad;
                }

                ::slotted(select-option[hidden]), ::slotted(select-option[hidden-internal]) {
                    visibility: hidden;
                    height:0 !important;
                    padding-top:0 !important;
                    padding-bottom:0 !important;
                    border-top:0 !important;
                    border-bottom:0 !important;
                }

                button[part="button"] {
                    display:flex;
                    align-items: center;
                }

                ::slotted(select-arrow[position="left"]) {
                    order: -1;
                    margin-left: 12px;
                }

                ::slotted(select-arrow[position="right"]) {
                    order: 1;
                    margin-right: 12px;
                }
            </style>

            <button part="button">
                <slot name="button_content"></slot>
                <slot id="arrow" name="arrow"></div>
            </button>
            <div class="after_button">
                <div class="options" part="options">
                    <slot name='option'></slot>
                </div>
            </div>
        `

        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(template.content.cloneNode(true))

        this.button = this.shadowRoot.querySelector(':host > button')
        this.options = this.shadowRoot.querySelector('.options')

        this.addEventListener('keydown', event => this.keydown(event))
        this.addEventListener('mousedown', event => this.onmousedown(event))
        this.addEventListener('childfocusout', event => this.onchildfocusout(event))
        this.button.addEventListener('focus', event => this.onfocus(event))
        this.button.addEventListener('focusout', event => this.onfocusout(event))
        this.button.addEventListener('click', event => this.toggle_open(event))


        this.selected_option = undefined
        this.preselected_option = undefined

        const observer = new MutationObserver(mutations => this.update(mutations))
        observer.observe(this, { childList: true, subtree: false, attributes: false })

        this.close()
    }

    connectedCallback() {
        // add button-content select-option
        this.create_button_content()

        //  add the default placeholder if we need to
        this.check_selected()
    }

    // ==[Change control]=======================================

    create_button_content() {
        this.button_content?.remove()
        this.button_content = document.createElement(OPTION_TAG_NAME)
        this.button_content.setAttribute('button-content', '')
        this.button_content.setAttribute('slot', 'button_content')
        this.appendChild(this.button_content)
    }

    update(mutations = []) {
        let nodes_added = []
        let nodes_removed = []

        mutations.forEach(mutation => {
            // added children must be scanned looking for "selected" attributes, which will replace the current selected, ignoring non select-option children
            nodes_added.push(...Array.from(mutation.addedNodes).filter(node => node.tagName == OPTION_TAG_NAME.toUpperCase()))
            // removed children must be scanned looking for "selected" attributes, which will be replaced by a default, ignoring non select-option children
            nodes_removed.push(...Array.from(mutation.removedNodes).filter(node => node.tagName == OPTION_TAG_NAME.toUpperCase()))
        })

        nodes_removed.forEach(node => {
            if (!node.hasAttribute('selected'))
                return

            this.check_selected()
        })

        nodes_added.forEach(node => {
            if (!node.hasAttribute('selected'))
                return

            this.set_option(node, true)
        })

        // check if button_content has been removed, if that's the case: regenerate
        if (this.button_content?.parentElement != this) {
            this.create_button_content()
            this.update_button()
        }

        this.update_arrow_size()
    }

    update_arrow_size() {
        let max_width = 0
        const arrow = this.querySelector(`:scope > ${ARROW_TAG_NAME}`)

        if (!arrow) {
            this.button_content.style.minWidth = `unset`
            return
        }

        const options = Array.from(this.querySelectorAll(`:scope > ${OPTION_TAG_NAME}:not([button-content])`))

        // reset
        options.forEach(option => (option.classList.add('auto-width')))

        options.forEach(option => {
            const box = option.getBoundingClientRect()
            max_width = box.width > max_width ? box.width : max_width
        })

        // restore
        options.forEach(option => (option.classList.remove('auto-width')))

        this.button_content.style.minWidth = `${max_width}px`
    }

    check_selected() {
        // check if we have a selected option, restore the value and button if we don't
        if (this.querySelector(OPTION_TAG_NAME + '[selected]'))
            return

        // if we have a placeholder, we use it
        const placeholder = this.querySelector(OPTION_TAG_NAME + '[placeholder]')
        if (placeholder)
            return this.set_option(placeholder, true)

        // if not, we set just an empty
        this.selected_option = undefined
        this.update_button()
    }

    // ==[Visuals]==============================================

    update_button() {
        if (!this.button_content)
            return

        const show_selected_on = this.getAttribute('show-selected-on') || 'both'
        const opened = this.button.classList.contains('opened')
        const restore = this.querySelectorAll(OPTION_TAG_NAME + '[hidden-internal]') || []

        // restore previously hidden options
        Array.from(restore).forEach(option => option.removeAttribute('hidden-internal'))

        // when opened, show the selected option only the list (button will show the placeholder)
        if (opened && show_selected_on == 'list') {
            const placeholder = this.querySelector(OPTION_TAG_NAME + '[placeholder]')
            this.button_content.innerHTML = placeholder?.getAttribute?.('label') || placeholder?.innerHTML || ''
            return
        }

        // when opened, show the selected option only in the button (option in the list will be hidden)
        if (opened && show_selected_on == 'button') {
            this.selected_option?.setAttribute('hidden-internal', '')
        }

        // show the selected option in both, button and list
        this.button_content.innerHTML = this.selected_option?.getAttribute?.('label') || this.selected_option?.innerHTML || ''
        this.button_content.className = ''
        const option_classes = [... this.selected_option?.classList || []]
        this.button_content.classList.add(...option_classes)
    }

    toggle_open(event) {
        this.button.focus()

        if (this.hasAttribute('disabled')) {
            // to close other opened dropdowns we need to focus the button first (line above) then blur
            this.button.blur()
            return this.close()
        }

        this.button.classList.toggle('opened')
        this.options.classList.toggle('opened')
        this.update_button()
    }

    close() {
        this.options.style.padding = 0
        if (!this.options.classList.contains('opened'))
            return
        this.button.classList.remove('opened')
        this.options.classList.remove('opened')
        this.update_button()
    }

    // ==[Events]===============================================

    onfocusout(event) {
        if (!this.contains(event.relatedTarget))
            this.close()
        // for nested dropdowns: parent lost the focus when nested child was focused, so it won't lost the focus again and won't be closed when the child lost its own
        // so we throw a custom event for potential parent dropdowns
        this.dispatchEvent(new CustomEvent('childfocusout', { bubbles: true, composed: true, taget: this, relatedTarget: event.relatedTarget, custom: true }))
    }

    onchildfocusout(event) {
        if (event.target != this)
            this.close()
    }

    onfocus(event) {
        this.clean_preselected()
        this.querySelector(`:scope > ${OPTION_TAG_NAME}[selected]`)?.setAttribute('pre-selected', '')
    }

    onmousedown(event) {
        // mouse down remove the focus even if the target element is the current focused element
        // this drives us to the impossibility of closing an opened component by clicking on its button [ button.opened => focusout (close) => click (toggle = open ) ]
        // so to fix this, we cancel this default behaviour of mousedown
        event.preventDefault()
    }

    enter(event) {
        // avoid the the default "PointerEvent" action (will mess with button focus)
        event.preventDefault()

        // if disabled, we do nothing
        if (this.hasAttribute('disabled'))
            return

        // open if closed
        if (!this.button.classList.contains('opened') || !this.preselected_option)
            return this.toggle_open(event)

        // set the current option if opened and preselected
        this.preselected_option?.click()
    }

    // ==[Accessibility]========================================

    keydown(event) {
        switch (event.key) {
            // arrows scroll the page, prevent default behaviour here
            case 'ArrowUp': return event.preventDefault() || this.move('previousElementSibling')
            case 'ArrowDown': return event.preventDefault() || this.move('nextElementSibling')
            case 'Escape': return this.close()
            case 'Enter': return this.enter(event)
        }
    }

    move(direction) {
        const forbidden = ['hidden', 'selected', 'button-content', 'disabled']
        const selector = `:scope > ${OPTION_TAG_NAME}`
        const query_current = forbidden.reduce((current, attribute) => `${current}:not([${attribute}])`, `${selector}[pre-selected]`)
        const query_first = forbidden.reduce((current, attribute) => `${current}:not([${attribute}])`, `${selector}`)
        const current = this.querySelector(query_current)
        let element = current?.[direction] || current || this.querySelector(query_first)
        while (element && (!forbidden.every(attribute => !element.hasAttribute(attribute)) || element.tagName != 'SELECT-OPTION'))
            element = element[direction]
        // the base slot element is the first and last sibling of any list of slotted elements, we ignore them
        if (!element || element.tagName == 'SLOT' || element == current)
            return

        this.preselect(element)
    }

    // ==[Value Control]========================================

    preselect(option) {
        this.clean_preselected()

        if (option.hasAttribute('disabled'))
            return

        option.setAttribute('pre-selected', '')
        this.preselected_option = option
    }

    clean_preselected() {
        const elements = this.querySelectorAll(`:scope > ${OPTION_TAG_NAME}[pre-selected]`)
        Array.from(elements).forEach(element => element.removeAttribute('pre-selected'))
    }

    set_option(option, internal = false) {
        const options = Array.from(this.querySelectorAll(`:scope > ${OPTION_TAG_NAME}`))

        // remove selected attribute of any option (but the current one)
        options.forEach(select_option => option != select_option && select_option.removeAttribute('selected'))

        // update the value and button content
        this.selected_option = option
        this.update_button()
        this.clean_preselected()

        // if the option we are selecting is a new one, we perform the change
        if (this.querySelector(OPTION_TAG_NAME + '[selected]') != option) {
            // setting selected attribute and dispatching a change event
            option.setAttribute('pre-selected', '')
            option.setAttribute('selected', '')
            !internal && this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
        }

        if (!internal) {
            // complete the current event listener execution then, focus
            setTimeout(() => this.button.focus(), 1)
            this.close()
        }
    }

    get value() {
        return this.selected_option?.value || ''
    }

    set value(value) {
        const options = Array.from(this.querySelectorAll(':scope > ' + OPTION_TAG_NAME))
        for (let option of options) {
            if (option.value == value && !option.hasAttribute('button-content'))
                return this.set_option(option, true)
        }
    }
}

customElements.define(SELECT_TAG_NAME, SelectDropdown)
customElements.define(OPTION_TAG_NAME, SelectOption)
customElements.define(ARROW_TAG_NAME, SelectArrow)
