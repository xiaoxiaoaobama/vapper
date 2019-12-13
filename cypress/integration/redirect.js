describe('Redirect', function () {
  it('visit', function () {
    cy.visit('http://0.0.0.0:4000/foo')

    cy.location().should((loc) => {
      expect(loc.toString()).to.eq('http://0.0.0.0:4000/')
    })

    cy.get('#app').should('have.length', 1)
    cy.get('#foo').should('have.length', 1)
    cy.get('#foo').should('contain', 'Foo')
  })
})
