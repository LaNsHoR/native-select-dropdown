const test_id = id => cy.get(`*[data-test-id=${id}]`)

describe('Static render and parsing', () => {
  beforeEach( () => { cy.visit('/') })

  it('Render works ok.', () => {
    cy.get('select-dropdown').should('have.lengthOf', 12)
    cy.get('select-option').should('have.lengthOf', 92)
  })

  it('Invalid children are discarded.', () => {
    test_id('sd1').find('select-option:not([button-content])').should('have.lengthOf', 9)
    test_id('sd2').find('select-option:not([button-content])').should('have.lengthOf', 9)
    test_id('sd3').find('select-option:not([button-content])').should('have.lengthOf', 7)
    test_id('sd4').find('select-option:not([button-content])').should('have.lengthOf', 0)
    test_id('sd5').find('select-option:not([button-content])').should('have.lengthOf', 9)
    test_id('sd6').find('select-option:not([button-content])').should('have.lengthOf', 9)
    test_id('sd7').find('select-option:not([button-content])').should('have.lengthOf', 8)
    test_id('sd8').find('select-option:not([button-content])').should('have.lengthOf', 7)
    test_id('sd9').find('select-option:not([button-content])').should('have.lengthOf', 7)
    test_id('sd10').find('select-option:not([button-content])').should('have.lengthOf', 7)
    test_id('sd11').find('select-option:not([button-content])').should('have.lengthOf', 7)
  })

  it('Static default values', () => {
    test_id('sd1').should('have.value', '')
    test_id('sd2').should('have.value', 'Gentoo Penguin')
    test_id('sd3').should('have.value', 'placeholder value')
    test_id('sd4').should('have.value', '')
    test_id('sd5').should('have.value', 'Select an animal')
    test_id('sd6').should('have.value', 'My <b>custom</b> value')
    test_id('sd7').should('have.value', '')
    test_id('sd8').should('have.value', '')
    test_id('sd9').should('have.value', '')
    test_id('sd10').should('have.value', '')
    test_id('sd11').should('have.value', '')
  })

  it('Static default button content', () => {
    test_id('sd1').find('select-option[slot="button_content"]').should('have.value', 'Select an animal')
    test_id('sd2').find('select-option[slot="button_content"]').should('have.value', 'Gentoo Penguin')
    test_id('sd3').find('select-option[slot="button_content"]').should('have.value', 'PLACEHOLDER')
    test_id('sd4').find('select-option[slot="button_content"]').should('have.value', '')
    test_id('sd5').find('select-option[slot="button_content"]').should('have.value', 'Select an animal')
    test_id('sd6').find('select-option[slot="button_content"]').should('have.value', 'Say one')
    test_id('sd7').find('select-option[slot="button_content"]').should('have.value', '')
    test_id('sd8').find('select-option[slot="button_content"]').should('have.value', 'What\'s your favorite Arthur?')
    test_id('sd9').find('select-option[slot="button_content"]').should('have.value', 'What\'s your favorite Arthur?')
    test_id('sd10').find('select-option[slot="button_content"]').should('have.value', 'What\'s your favorite Arthur?')
    test_id('sd11').find('select-option[slot="button_content"]').should('have.value', 'What\'s your favorite Arthur?')
  })

  it('Only zero or one selected', () => {
    test_id('sd1').find('*[selected]').should('have.lengthOf', 1)
    test_id('sd2').find('*[selected]').should('have.lengthOf', 1)
    test_id('sd3').find('*[selected]').should('have.lengthOf', 1)
    test_id('sd4').find('*[selected]').should('have.lengthOf', 0)
    test_id('sd5').find('*[selected]').should('have.lengthOf', 1)
    test_id('sd6').find('*[selected]').should('have.lengthOf', 1)
    test_id('sd7').find('*[selected]').should('have.lengthOf', 0)
    test_id('sd8').find('*[selected]').should('have.lengthOf', 1)
    test_id('sd9').find('*[selected]').should('have.lengthOf', 1)
    test_id('sd10').find('*[selected]').should('have.lengthOf', 1)
    test_id('sd11').find('*[selected]').should('have.lengthOf', 1)
  })

  it('Reset content with innerHTML', () => {
    test_id('sd1').then( element => {
      const dropdown = element.get(0)
      dropdown.innerHTML = '<select-option>A</select-option><select-option selected>B</select-option><select-option>C</select-option>'
      test_id('sd1').find('select-option').should('have.lengthOf', 4)
      test_id('sd1').should('have.value', 'B')
      test_id('sd1').find('select-option[slot="button_content"]').should('have.text', 'B')
      dropdown.update_button()
    })
  })

  it('Reset content with innerHTML adding a placeholder', () => {
    test_id('sd1').then( element => {
      const dropdown = element.get(0)
      dropdown.innerHTML = '<select-option>A</select-option><select-option>B</select-option><select-option placeholder>C</select-option><select-option>D</select-option>'
      test_id('sd1').find('select-option').should('have.lengthOf', 5)
      test_id('sd1').should('have.value', '')
      test_id('sd1').find('select-option[slot="button_content"]').should('have.text', 'C')
      dropdown.update_button()
    })
  })
})

describe('Adding elements dynamically', () => {
  beforeEach( () => { cy.visit('/') })

  it('Add regular option', () => {
    test_id('sd1').then( element => {
      const dropdown = element.get(0)
      const count = dropdown.childElementCount
      const option = document.createElement('select-option')
      option.innerHTML = '<b>injected!</b>'
      dropdown.appendChild( option )
      test_id('sd1').find('select-option').should('have.lengthOf', count+1)
      test_id('sd1').find('select-option[slot="button_content"]').should('have.text', 'Select an animal')
    })
  })

  it('Add selected option', () => {
    test_id('sd1').then( element => {
      const dropdown = element.get(0)
      const option = document.createElement('select-option')
      option.innerHTML = '<b>injected!</b>'
      option.setAttribute('selected', '')
      dropdown.appendChild( option )
      test_id('sd1').find('select-option').should('have.lengthOf', 11)
      test_id('sd1').should('have.value', 'injected!')
      test_id('sd1').find('select-option[slot="button_content"]').should('have.text', 'injected!')
    })
  })

  it('Add selected option with custom value', () => {
    test_id('sd1').then( element => {
      const dropdown = element.get(0)
      const option = document.createElement('select-option')
      option.innerHTML = '<b>injected!</b>'
      option.setAttribute('selected', '')
      option.setAttribute('value', 5885)
      dropdown.appendChild( option )
      test_id('sd1').find('select-option').should('have.lengthOf', 11)
      test_id('sd1').should('have.value', '5885')
      test_id('sd1').find('select-option[slot="button_content"]').should('have.text', 'injected!')
    })
  })
})

describe('Modify options dynamically', () => {
  beforeEach( () => { cy.visit('/') })

  it('Modify content of selected', () => {
    test_id('so1').then( element => {
      const option = element.get(0)
      option.setAttribute('selected', '')
      option.innerHTML = 'this has <b>changed!</b>'
      test_id('sd1').should('have.value', 'this has changed!')
      test_id('sd1').find('select-option[slot="button_content"]').should('have.text', 'this has changed!')
    })
  })

  it('Modify content and value of selected', () => {
    test_id('sd1').find('*[selected]').then( element => {
      const option = element.get(0)
      option.innerHTML = 'this has <b>changed!</b>'
      option.setAttribute('value', '43210')
      test_id('sd1').should('have.value', '43210')
      test_id('sd1').find('select-option[slot="button_content"]').should('have.text', 'this has changed!')
    })
  })

  it('Modify content, value and label of selected', () => {
    test_id('sd1').find('*[selected]').then( element => {
      const option = element.get(0)
      option.innerHTML = 'this has <b>changed!</b>'
      option.setAttribute('value', '43210')
      option.setAttribute('label', 'new label')
      test_id('sd1').should('have.value', '43210')
      test_id('sd1').find('select-option[slot="button_content"]').should('have.text', 'new label')
    })
  })

  it('Modify existing label of selected', () => {
    test_id('cat7').then( element => {
      const option = element.get(0)
      option.setAttribute('selected', '')
      option.setAttribute('label', 'new label')
      test_id('sd7').should('have.value', 'Cat')
      test_id('sd7').find('select-option[slot="button_content"]').should('have.text', 'new label')
    })
  })

  it('Add selected to an option', () => {
    test_id('so1').then( element => {
      const option = element.get(0)
      option.setAttribute('selected', '')
      test_id('sd1').should('have.value', 'Panda')
      test_id('sd1').find('select-option[slot="button_content"]').should('have.text', 'Panda')
    })
  })

  it('Add selected to a disabled option', () => {
    test_id('so3').then( element => {
      const option = element.get(0)
      option.setAttribute('selected', '')
      test_id('sd2').should('have.value', 'Lion')
      test_id('sd2').find('select-option[slot="button_content"]').should('have.text', 'Lion')
    })
  })

  it('Remove selected attribute and fallback to placeholder', () => {
    test_id('sd2').should('have.value', 'Gentoo Penguin')
    test_id('sd2').find('*[selected]').then( element => {
      const option = element.get(0)
      option.removeAttribute('selected')
      test_id('sd2').should('have.value', '')
      test_id('sd2').find('select-option[slot="button_content"]').should('have.text', 'Select an animal')
    })
  })

  it('Remove selected attribute with no placeholder', () => {
    test_id('sd6').should('have.value', 'My <b>custom</b> value')
    test_id('sd6').find('select-option[slot="button_content"]').should('have.text', 'Say one')
    test_id('sd6').find('*[selected]').then( element => {
      const option = element.get(0)
      option.removeAttribute('selected')
      test_id('sd6').should('have.value', '')
      test_id('sd6').find('select-option[slot="button_content"]').should('have.text', '')
    })
  })
})

describe('Remove options dynamically', () => {
  beforeEach( () => { cy.visit('/') })

  it('Remove regular option', () => {
    test_id('so1').then( element => {
      const option = element.get(0)
      const count = option.parentElement.childElementCount
      option.parentElement.removeChild(option)
      test_id('sd1').find('> *').should('have.lengthOf', count-1)
    })
  })

  it('Remove selected option', () => {
    test_id('sd2').find('*[selected]').then( element => {
      const option = element.get(0)
      const count = option.parentElement.childElementCount
      option.parentElement.removeChild(option)
      test_id('sd2').find('> *').should('have.lengthOf', count-1)
      test_id('sd2').should('have.value', '')
      test_id('sd2').find('select-option[slot="button_content"]').should('have.text', 'Select an animal')
    })
  })
})

describe('Component API', () => {
  beforeEach( () => { cy.visit('/') })

  it('Set option as value', () => {
    test_id('sd1').then( element => {
      const dropdown = element.get(0)
      dropdown.value = 'Cat'
      test_id('sd1').should('have.value', 'Cat')
      test_id('sd1').find('*[selected]').should('have.text', 'Cat')
    })
  })

  it('Set html option as value', () => {
    test_id('sd7').then( element => {
      const dropdown = element.get(0)
      dropdown.value = 'Gentoo Penguin'
      test_id('sd7').should('have.value', 'Gentoo Penguin')
      test_id('sd7').find('*[selected]').should('have.text', 'Gentoo Penguin')
    })
  })

  it('Set invalid value', () => {
    test_id('sd2').then( element => {
      const dropdown = element.get(0)
      dropdown.value = 'This is an invalid value'
      test_id('sd2').should('have.value', 'Gentoo Penguin')
      test_id('sd2').find('*[selected]').should('have.text', 'Gentoo Penguin')
    })
  })

  it('Set empty value, same as button-content', () => {
    test_id('sd12').then( element => {
      const dropdown = element.get(0)
      dropdown.value = ''
      test_id('sd12').should('have.value', '')
      test_id('so12').should('have.attr', 'selected')
    })
  })

  it('Set option value as prop', () => {
    test_id('so3').then( element => {
      const option = element.get(0)
      option.value = 'New Value as Prop'
      test_id('so3').should('have.value', 'New Value as Prop')
      test_id('so3').should('have.text', 'Lion')
      test_id('sd2').find('select-option[slot="button_content"]').should('have.text', 'Gentoo Penguin')
    })
  })

  it('Set option value (selected) as prop', () => {
    test_id('so4').then( element => {
      const option = element.get(0)
      option.value = 'New Value as Prop'
      test_id('so4').should('have.value', 'New Value as Prop')
      test_id('sd2').should('have.value', 'New Value as Prop')
    })
  })
})

describe('Mouse interactions', () => {
  beforeEach( () => { cy.visit('/') })

  it('Option list is closed by default', () => {
    test_id('sd1').shadow().find('.options').should('not.be.visible')
  })

  it('Option list is opened after clicking', () => {
    test_id('sd1').click().then( _ =>
      test_id('sd1').shadow().find('.options').should('be.visible')
    )
  })

  it('Option list is closed after clicking when it is opened', () => {
    test_id('sd1').click({ force: true }).then( _ =>
      test_id('sd1').click({ force: true }).then( _ =>
        test_id('sd1').shadow().find('.options').should('not.be.visible')
    ))
  })

  it('Option list is closed after losing focus', () => {
    test_id('sd1').click({ force: true }).then( _ =>
      test_id('sd2').click({ force: true }).then( _ =>
        test_id('sd1').shadow().find('.options').should('not.be.visible')
    ))
  })

  it('Click an option', () => {
    test_id('sd1').click({ force: true }).then( _ =>
      test_id('so1').click({ force: true }).then( _ => {
          test_id('sd1').shadow().find('.options').should('not.be.visible')
          test_id('sd1').find('select-option[slot="button_content"]').should('have.text', 'Panda')
          test_id('sd1').should('have.value', 'Panda')
      }))
  })

  it('Click on a disabled option', () => {
    // Browser page should be focused to pass this test, see this Cypress bug: https://github.com/cypress-io/cypress/issues/5023
    test_id('sd1').click().then( _ =>
      test_id('so2').click({ force: true }).then( _ => {
        test_id('sd1').shadow().find('.options').should('be.visible')
        test_id('sd1').find('select-option[slot="button_content"]').should('have.text', 'Select an animal')
        test_id('sd1').should('have.value', '')
      }))
  })
})

describe('Keyboard interactions', () => {
  beforeEach( () => { cy.visit('/') })

  // TODO: Tests TAB navigation once Cypress supports TABs properly: https://github.com/cypress-io/cypress/issues/299

  it('Enter opens a closed dropdown', () => {
    // for no reason, cypress makes a click when focusing this button, but only in this test, so we need to press ENTER twice
    test_id('sd1').shadow().find('button').focus().type('{enter}{enter}', {force: true})
    test_id('sd1').shadow().find('.options').should('be.visible')
  })

  it('Enter closes an opened dropdown', () => {
    test_id('sd1').shadow().find('button').focus().type('{enter}', {force: true}).type('{enter}', {force: true})
    test_id('sd1').shadow().find('.options').should('not.be.visible')
  })

  it('Navigation with arrow down starts with the first visible option', () => {
    test_id('sd1').shadow().find('button').focus().type('{enter}{downarrow}', {force: true})
    test_id('sd1').find('select-option[pre-selected]').should('have.text', 'Dog')
  })

  it('Navigation with arrow down skips disabled options', () => {
    test_id('sd1').shadow().find('button').focus().type('{enter}{downarrow}{downarrow}{downarrow}', {force: true})
    test_id('sd1').find('select-option[pre-selected]').should('have.text', 'Panda')
  })

  it('Navigation with arrow down stops with the last element', () => {
    test_id('sd1').shadow().find('button').focus().type('{enter}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}', {force: true})
    test_id('sd1').find('select-option[pre-selected]').should('have.text', 'Gentoo Penguin')
  })

  it('Navigation with arrow up starts with the first visible option', () => {
    test_id('sd1').shadow().find('button').focus().type('{enter}{uparrow}', {force: true})
    test_id('sd1').find('select-option[pre-selected]').should('have.text', 'Dog')
  })

  it('Navigation with arrow up skips disabled options', () => {
    test_id('sd1').shadow().find('button').focus().type('{enter}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{uparrow}', {force: true})
    test_id('sd1').find('select-option[pre-selected]').should('have.text', 'Shark')
  })

  it('Navigation with arrow up stops with the first element', () => {
    test_id('sd1').shadow().find('button').focus().type('{enter}{uparrow}{uparrow}{uparrow}', {force: true})
    test_id('sd1').find('select-option[pre-selected]').should('have.text', 'Dog')
  })

  it('Enters set the selected option', () => {
    // Browser page should be focused to pass this test, see this Cypress bug: https://github.com/cypress-io/cypress/issues/5023
    test_id('sd1').shadow().find('button').focus().type('{enter}{downarrow}{downarrow}{downarrow}{downarrow}{uparrow}', {force: true})
    test_id('sd1').shadow().find('button').focus().type('{enter}', {force: true})

    test_id('sd1').shadow().find('.options').should('not.be.visible')
    test_id('sd1').find('select-option[slot="button_content"]').should('have.text', 'Panda')
    test_id('sd1').should('have.value', 'Panda')
  })

  it('ESC closes an opened dropdown', () => {
    test_id('sd1').shadow().find('button').focus().type('{enter}', {force: true}).type('{esc}', {force: true})
    test_id('sd1').shadow().find('.options').should('not.be.visible')
  })
})

describe('Show selected modes', () => {
  beforeEach( () => { cy.visit('/') })

  it('No show-selected attribute behaves like both value', () => {
    test_id('so8').then( element => {
      const option = element.get(0)
      option.setAttribute('selected', '')
      test_id('sd8').click().then( _ => {
          test_id('so8').should('be.visible')
          test_id('sd8').find('select-option[slot="button_content"]').should('contain.text', 'Arthur 5')
        })
    })
  })

  it('Check show-selected="both"', () => {
    test_id('so9').then( element => {
      const option = element.get(0)
      option.setAttribute('selected', '')
      test_id('sd9').click().then( _ => {
          test_id('so9').should('be.visible')
          test_id('sd9').find('select-option[slot="button_content"]').should('contain.text', 'Arthur 5')
        })
    })
  })

  it('Check show-selected="button"', () => {
    test_id('so10').then( element => {
      const option = element.get(0)
      option.setAttribute('selected', '')
      test_id('sd10').click().then( _ => {
          test_id('so10').should('not.be.visible')
          test_id('sd10').find('select-option[slot="button_content"]').should('contain.text', 'Arthur 5')
        })
    })
  })

  it('Check show-selected="list"', () => {
    test_id('so11').then( element => {
      const option = element.get(0)
      option.setAttribute('selected', '')
      test_id('sd11').click().then( _ => {
          test_id('so11').should('be.visible')
          test_id('sd11').find('select-option[slot="button_content"]').should('have.text', "What's your favorite Arthur?")
        })
    })
  })
})

describe('Onchange Events', () => {
  beforeEach( () => { cy.visit('/') })

  it('Onchange event is fired', () => {
    test_id('sd11').click().then( element => {
      let current_event = false
      const dropdown = element.get(0)
      dropdown.onchange = event => ( current_event = event )
      test_id('so11').click().then( _ => {
        expect( current_event?.composed ).to.be.true
        expect( current_event?.bubbles ).to.be.true
      })
    })
  })
})
