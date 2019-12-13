describe('Redirect', function () {
  it('visit', function () {
    cy.visit('http://0.0.0.0:4000/foo')

    cy.location().should((loc) => {
      expect(loc.toString()).to.eq('http://0.0.0.0:4000/')
    })

    cy.get('#app').should('have.length', 1)
    cy.get('#foo').should('have.length', 1)
    cy.get('.p1').should('contain', 'Foo')
    cy.get('.go-to-bar').should('contain', 'Go to bar')

    // Go to bar and redirect to baz
    cy.get('.go-to-bar').click()
    cy.location().should((loc) => {
      expect(loc.toString()).to.eq('http://0.0.0.0:4000/baz')
    })
    cy.get('.p3').should('contain', 'Baz')
  })
})
