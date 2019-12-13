describe('Data prefetch', function () {
  it('visit', function () {
    cy.visit('http://0.0.0.0:4000')

    cy.get('#app').should('have.length', 1)
    cy.get('#foo').should('have.length', 1)
    cy.get('#foo').should('contain', 'bar')

    cy.window().its('__INITIAL_STATE__').should('deep.equal', {
      $$selfStore: {
        Fooapp$: {
          msg: 'bar'
        }
      }
    })
  })
})
