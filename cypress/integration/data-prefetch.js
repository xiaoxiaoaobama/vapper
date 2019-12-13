describe('Data prefetch', function () {
  it('visit', function () {
    cy.visit('http://0.0.0.0:4000')

    cy.get('#app').should('have.length', 1)
    cy.get('#foo').should('have.length', 1)
    cy.get('.p1').should('contain', 'bar')
    cy.get('.p2').should('contain', 'bar')

    cy.window().its('__INITIAL_STATE__').should('deep.equal', {
      $$stroe: {
        storeMsg: 'bar'
      },
      $$selfStore: {
        Fooapp$: {
          msg: 'bar'
        }
      }
    })
  })
})
