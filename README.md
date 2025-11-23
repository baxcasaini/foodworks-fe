# Foodworks Dashboard - Frontend

## Requisiti di Sistema

### Node.js
- **Versione minima richiesta**: Node.js 18.19.0 o superiore
- **Versione consigliata**: Node.js 20.10.0 o superiore (LTS)
- **Versione massima supportata**: Node.js 20.x

Per verificare la versione installata:
```bash
node -v
```

Per installare Node.js:
- Scarica da [nodejs.org](https://nodejs.org/)
- Oppure usa nvm (Node Version Manager):
  ```bash
  nvm install 18.19.0
  nvm use 18.19.0
  ```

### npm
- **Versione**: npm 9.x o superiore (inclusa con Node.js 18+)

Per verificare:
```bash
npm -v
```

### Angular
- **Versione**: Angular 17.0.0
- **Angular CLI**: 17.0.0
- **Angular Material**: 17.0.0

### TypeScript
- **Versione**: TypeScript 5.2.0 o superiore

## Installazione

1. Assicurati di avere Node.js 18.19.0+ installato
2. Installa le dipendenze:
```bash
npm install
```

3. Avvia il server di sviluppo:
```bash
npm start
```

L'applicazione sarà disponibile su `http://localhost:4200`

## Note sulla Compatibilità

- **Angular 17** richiede Node.js 18.19.0+ o 20.10.0+
- Se usi Node.js 16 o inferiore, aggiorna prima Node.js
- Se usi Node.js 21+, potrebbero esserci problemi di compatibilità

## Verifica Versioni

Per verificare tutte le versioni installate:
```bash
node -v
npm -v
ng version
```

