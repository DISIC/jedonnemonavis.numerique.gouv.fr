describe('Database Connection Test', () => {
    it('should connect to the PostgreSQL database successfully', () => {
      const dbUrl = 'postgresql://user:password@localhost:5432/jdma';
      
      // Extraire les informations de l'URL de connexion
      const { hostname, port, username, password, pathname } = new URL(dbUrl);
  
      const dbConfig = {
        host: hostname,
        port: Number(port),
        user: username,
        password: password,
        database: pathname.replace('/', ''), // Supprime le "/" initial du chemin
      };
  
      cy.task('checkDatabaseConnection', dbConfig).then((result) => {
        expect(result).to.be.true;
      });
    });
  });
  