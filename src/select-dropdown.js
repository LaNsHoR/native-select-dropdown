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

        this.addEventListener('mousedown', event => this.click(event))
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

    click(event) {
        if (this.hasAttribute('disabled') || this.hasAttribute('button-content')) {
            event?.preventDefault()
            event?.stopPropagation()
            return
        }
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

        this.internal_id = `SD_${crypto?.randomUUID?.() || String(Math.random()).replaceAll('.', '')}`

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
                    anchor-name: --${this.internal_id};
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
                }

                :host > .after_button > .options {
                    color: #568;
                    background: #fff;
                    border: 1px solid #e8eaed;
                    border-radius: 0 0 5px 5px;
                    z-index: 100;
                    box-sizing: border-box;
                    box-shadow: 0 1px 3px -2px #9098A9;
                    position-anchor: --${this.internal_id};
                    top: anchor(bottom);
                    left: anchor(left);
                    position: fixed;
                    margin: 0;
                    position-try:
                        top anchor(bottom),
                        bottom anchor(top);
                    position-try-fallbacks:
                        left anchor(left),
                        right anchor(right);
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

                ::slotted(select-option:last-child) {
                    border: 0
                }

                ::slotted(select-option.hidden) {
                    display: none;
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

                #search_box {
                    display: flex;
                    align-items: stretch;
                    justify-content: center;
                }

                #search_box input {
                    outline: 0;
                    border: 0;
                    border-bottom: 1px solid #e8eaed;
                    padding: 7px 12px;
                    display: block;
                    white-space: nowrap;
                    font-family: 'Roboto', sans-serif;
                    width: 100%;
                    font-size: 16px;
                    color: #568;
                }

                #search_x {
                    cursor: pointer;
                    background: none;
                    border: 0;
                    border-bottom: 1px solid #e8eaed;
                }

                #search_x.hidden {
                    display: none;
                }
                
                #search_box input::-webkit-search-cancel-button {
                    -webkit-appearance: none;
                    appearance: none;
                    display: none;
                }

                #search_box.hidden {
                    display: none;
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
                <slot id="arrow" name="arrow"></slot>
            </button>
            <div class="after_button">
                <div class="options" part="options" popover="manual" id="${this.internal_id}">
                    <div class="search" id="search_box" part="search-box">
                        <input type="search" id="search_input" part="search-input" />
                        <button id="search_x" part="search-x">✕</button>
                    </div>
                    <slot name='option'></slot>
                </div>
            </div>
        `

        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(template.content.cloneNode(true))

        this.button = this.shadowRoot.querySelector(':host > button')
        this.options = this.shadowRoot.querySelector('.options')
        this.search_box = this.shadowRoot.getElementById('search_box')
        this.search_input = this.shadowRoot.getElementById('search_input')
        this.search_x = this.shadowRoot.getElementById('search_x')

        this.addEventListener('keydown', event => this.keydown(event))
        this.addEventListener('childfocusout', event => this.onchildfocusout(event))
        this.button.addEventListener('focus', event => this.onfocus(event))
        this.button.addEventListener('focusout', event => this.onfocusout(event))
        this.button.addEventListener('click', event => this.toggle_open(event))

        this.selected_option = undefined
        this.preselected_option = undefined

        const observer = new MutationObserver(mutations => this.update(mutations))
        observer.observe(this, { childList: true, subtree: false, attributes: false })
        this.search_input.addEventListener('search', () => this.filter_options())
        this.search_input.addEventListener('input', () => this.filter_options())
        this.search_input.addEventListener('focusout', event => this.onfocusout(event))

        this.search_x.addEventListener('click', () => {
            this.search_input.value = ''
            this.filter_options()
        })

        this.close()
    }

    connectedCallback() {
        // add button-content select-option
        this.create_button_content()

        // if a value was set before connection, sync the button visually now that button_content exists
        if (this.selected_option)
            this.update_button()

        //  add the default placeholder if we need to
        this.check_selected()

        // display search box or not
        this.control_search_box_visibility()
        this.filter_options()
    }

    disconnectedCallback() {
        // close unconditionally: is_open relies on :popover-open which can return false
        // after the element leaves the active tree even though the popover is still in the
        // document top-layer. hidePopover throws if already-closed or disconnected — both
        // are no-ops for our purposes.
        try { this.options.hidePopover() } catch {}
    }

    static get observedAttributes() {
        // TODO: control dynamically attributes for search
        return ['disabled']
    }

    attributeChangedCallback(name, old_value, new_value) {
        switch(name) {
            case 'disabled':
                if(this.hasAttribute('disabled'))
                    this.close()
        }
    }

    get is_open() {
        return this.options?.matches?.(':popover-open') ?? false
    }

    // ==[Search control]=======================================

    get_visible_options() {
        return Array.from(this.querySelectorAll(`:scope > ${OPTION_TAG_NAME}:not([button-content]):not([hidden])`))
    }

    control_search_box_visibility() {
        const display_search = this.getAttribute('display-search')
        const display_number = display_search === null ? NaN : Number(display_search)
        const show = !Number.isNaN(display_number) ? display_number <= this.get_visible_options().length : Boolean(display_search)
        const placeholder = this.getAttribute('search-placeholder')
        this.search_input.placeholder = placeholder || ''
        this.search_box.classList.toggle('hidden', !show)
    }

    filter_options() {
        const filter_value = this.search_input.value.trim().toLowerCase()
        const options = this.get_visible_options()
        const has_filter = Boolean(filter_value)
        this.search_x.classList.toggle('hidden', !has_filter)

        options.forEach(option => {
            const text = (option.getAttribute('label') || '').toLowerCase()
            const label = (option.textContent || '').toLowerCase()
            const match = !filter_value || text.includes(filter_value) || label.includes(filter_value)
            option.classList.toggle('hidden', !match)
        })
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
        this.control_search_box_visibility()

        if (!this.button_content)
            return

        const show_selected_on = this.getAttribute('show-selected-on') || 'both'
        const restore = this.querySelectorAll(OPTION_TAG_NAME + '[hidden-internal]') || []

        // restore previously hidden options
        Array.from(restore).forEach(option => option.removeAttribute('hidden-internal'))

        // when opened, show the selected option only in the list (button will show the placeholder)
        if (this.is_open && show_selected_on == 'list') {
            const placeholder = this.querySelector(OPTION_TAG_NAME + '[placeholder]')
            this.button_content.innerHTML = placeholder?.getAttribute?.('label') || placeholder?.innerHTML || ''
            return
        }

        // when opened, show the selected option only in the button (option in the list will be hidden)
        if (this.is_open && show_selected_on == 'button') {
            this.selected_option?.setAttribute('hidden-internal', '')
        }

        // lazy options_data flow: while the dropdown is closed the selected <select-option> may not exist in the DOM, so fall back to the cached label/className we stored in set_option (or via set value)
        if (!this.selected_option && this._selected_label != null) {
            this.button_content.innerHTML = this._selected_label
            this.button_content.className = ''
            if (this._selected_className)
                this.button_content.classList.add(...this._selected_className.split(/\s+/).filter(Boolean))
            return
        }

        // show the selected option in both the button and the list
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

        if( this.is_open )
            this.options.hidePopover()
        else {
            // lazy options_data flow: build <select-option> children on demand so consumers with N dropdowns × M options don't pay the cost upfront
            this.materialize_options()
            this.options.showPopover()
            // if search is visible, focus it so the user can type immediately
            if (! this.search_box.classList.contains('hidden'))
                this.search_input.focus()
        }

        this.button.classList.toggle('opened', this.is_open)

        this.update_button()
    }

    close() {
        if (! this.is_open )
            return
        // restore filtered options
        this.search_input.value = ''
        this.filter_options()
        // close
        this.options.hidePopover()
        this.button.classList.remove('opened')
        // update button
        this.update_button()
        // lazy options_data flow: discard the materialized options now that the dropdown is hidden; the selection state lives in _selected_value/_selected_label so update_button still works
        this.dematerialize_options()
    }

    // ==[Events]===============================================

    onfocusout(event) {
        const next = event.relatedTarget

        if (this.contains(next) || this.shadowRoot.contains(next))
            return

        this.close()
        // for nested dropdowns: the parent already lost focus when the nested child was focused, so it won't lose focus again and won't be closed when the child loses its own
        // so we dispatch a custom event for potential parent dropdowns
        this.dispatchEvent(new CustomEvent('childfocusout', { bubbles: true, composed: true, relatedTarget: event.relatedTarget }))
    }

    onchildfocusout(event) {
        if (event.target != this)
            this.close()
    }

    onfocus(event) {
        this.clean_preselected()
        this.querySelector(`:scope > ${OPTION_TAG_NAME}[selected]`)?.setAttribute('pre-selected', '')
    }

    enter(event) {
        // prevent the default KeyboardEvent action (would mess with button focus)
        event.preventDefault()

        // if disabled, we do nothing
        if (this.hasAttribute('disabled'))
            return

        // open if closed
        if (! this.is_open || !this.preselected_option)
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
        this.preselected_option = undefined
    }

    set_option(option, internal = false) {
        const options = Array.from(this.querySelectorAll(`:scope > ${OPTION_TAG_NAME}`))

        // remove selected attribute of any option (but the current one)
        options.forEach(select_option => option != select_option && select_option.removeAttribute('selected'))

        // update the value and button content
        this.selected_option = option
        // cache selection so the button can keep displaying the right label after dematerialize_options removes the DOM node (lazy options_data flow)
        this._selected_value = option.value ?? option.getAttribute?.('value') ?? ''
        this._selected_label = option.getAttribute?.('label') ?? option.innerHTML ?? ''
        this._selected_className = option.className || ''
        this.update_button()
        this.clean_preselected()

        // if the option we are selecting is a new one, mark it as selected
        const changed = this.querySelector(OPTION_TAG_NAME + '[selected]') != option
        if (changed) {
            option.setAttribute('pre-selected', '')
            option.setAttribute('selected', '')
        }

        if (!internal) {
            // Synchronous, in order: focus the button, close the popover, then dispatch.
            // This way consumers that take focus from a change handler (e.g. open a modal)
            // can do so without the vendor stealing it back via a deferred refocus, which
            // would prevent onfocusout from firing and leave the popover in an inconsistent
            // open state in some flows (e.g. nested dropdowns inside an option).
            this.button.focus()
            this.close()
            if (changed)
                this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
        }
    }

    get value() {
        // lazy options_data flow: after dematerialize_options the DOM node is gone but _selected_value still holds the value cached in set_option, which is what consumers expect to read from their onchange handler
        return this.selected_option?.value || this._selected_value || ''
    }

    set value(value) {
        const options = Array.from(this.querySelectorAll(':scope > ' + OPTION_TAG_NAME))
        for (let option of options) {
            if (option.value == value && !option.hasAttribute('button-content'))
                return this.set_option(option, true)
        }
        // lazy options_data flow: the matching <select-option> isn't in the DOM yet. Cache the value and look up label/className from data so update_button can render the button without materializing the whole list. When no entry matches, fall back to the placeholder entry (mirrors set options_data behaviour) so consumers that legitimately set value to null/undefined/"unknown" don't blank out the placeholder text that the dropdown was already displaying. Prefer entry.button_text over entry.label so consumers that use the inline-management pattern (label='' + button_text='real name', see tab_modal_list.get_options_with_inline_managment) get the right text on the button — matches the eager path which reads option.getAttribute('label') (= button_text attribute) first
        this._selected_value = value
        if (this._options_data) {
            let entry = this._options_data.find(option => option != null && (typeof option === 'string' ? option == value : (option.value ?? '') == value))
            if (!entry)
                entry = this._options_data.find(option => option != null && typeof option !== 'string' && option.attributes?.placeholder != null)
            if (entry != null) {
                this._selected_label = typeof entry === 'string' ? entry : (entry.button_text ?? entry.label ?? entry.value ?? '')
                this._selected_className = typeof entry === 'string' ? '' : (entry.className || '')
            }
            else {
                this._selected_label = ''
                this._selected_className = ''
            }
            this.selected_option = undefined
            this.update_button()
        }
    }

    // ==[Lazy options_data]====================================
    // Consumers with many dropdowns sharing the same options (e.g. 33 event-listener rows × 2-3 selects) can call dropdown.options_data = [...] instead of appending <select-option> children. The list is materialized only when the dropdown opens and discarded on close, so the DOM only ever holds the options of the currently-open dropdown.

    set options_data(data) {
        this._options_data = Array.isArray(data) ? data : null
        // already-open dropdowns: tear down any stale materialized list so the next render uses the new data
        this.dematerialize_options()
        // resolve the cached selection against the new data so the button label stays consistent. fall back to the placeholder entry (data attributes.placeholder) when there's no matching value — this mirrors the eager-API check_selected behaviour, which picks a [placeholder] <select-option> as the displayed selection whenever no [selected] option exists. Without this fallback, lazy consumers that rely on the placeholder pattern (e.g. a list with no chosen value showing a "select one..." prompt) end up with an empty button until the user opens the dropdown for the first time and the placeholder's connectedCallback triggers the DOM-based check_selected
        if (this._options_data) {
            let entry = null
            if (this._selected_value != null) {
                const value = this._selected_value
                entry = this._options_data.find(option => option != null && (typeof option === 'string' ? option == value : (option.value ?? '') == value))
            }
            if (!entry)
                entry = this._options_data.find(option => option != null && typeof option !== 'string' && option.attributes?.placeholder != null)
            if (entry != null) {
                this._selected_label = typeof entry === 'string' ? entry : (entry.button_text ?? entry.label ?? entry.value ?? '')
                this._selected_className = typeof entry === 'string' ? '' : (entry.className || '')
                this.update_button()
            }
        }
        // if the dropdown was open while data changed, rebuild now (rare, but keeps the contract intact)
        if (this.is_open && this._options_data)
            this.materialize_options()
    }

    materialize_options() {
        if (!this._options_data || this._materialized)
            return
        this._options_data.forEach(option => {
            if (option == null)
                return
            const node = document.createElement(OPTION_TAG_NAME)
            if (typeof option === 'string') {
                node.textContent = option
                node.setAttribute('value', option)
            }
            else {
                if (option.className)
                    node.className = option.className
                if (option.label != null)
                    node.innerHTML = option.label
                node.setAttribute('value', option.value ?? '')
                if (option.button_text != null)
                    node.setAttribute('label', option.button_text)
                if (option.attributes) {
                    for (const [k, v] of Object.entries(option.attributes))
                        node.setAttribute(k, v)
                }
                if (option.child)
                    node.appendChild(option.child)
            }
            const opt_value = typeof option === 'string' ? option : (option.value ?? '')
            if (this._selected_value != null && opt_value == this._selected_value) {
                node.setAttribute('selected', '')
                // also assign synchronously so update_button later in toggle_open (before the MutationObserver microtask runs) can read selected_option directly
                this.selected_option = node
            }
            this.appendChild(node)
        })
        this._materialized = true
    }

    dematerialize_options() {
        if (!this._options_data || !this._materialized)
            return
        // detach option.child nodes first so they can be reused on next materialize (e.g. inline-management submenus built by get_options_with_inline_managment)
        const options = Array.from(this.querySelectorAll(`:scope > ${OPTION_TAG_NAME}:not([button-content])`))
        options.forEach(option => option.remove())
        this._materialized = false
        // the DOM selected node is gone; selection state lives in _selected_value/_selected_label, used by update_button's lazy fallback
        this.selected_option = undefined
        this.preselected_option = undefined
    }
}

customElements.define(SELECT_TAG_NAME, SelectDropdown)
customElements.define(OPTION_TAG_NAME, SelectOption)
customElements.define(ARROW_TAG_NAME, SelectArrow)
