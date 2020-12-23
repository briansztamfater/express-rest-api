// ===================
//  Port
// ===================
process.env.PORT = process.env.PORT || 3000;


// ===================
//  Environment
// ===================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// ===================
//  Database
// ===================
let urlDb;

if (process.env.NODE_ENV === 'dev') {
  urlDb = 'mongodb://localhost:27017/cafe';
} else {
  urlDb = process.env.MONGO_URI;
}

process.env.URL_DB = urlDb;


// ===================
//  Token expiration
// ===================
process.env.TOKEN_EXPIRATION = '48h';


// ===================
//  Seed
// ===================

process.env.SEED = process.env.SEED || 'this-is-the-dev-seed';

// ===================
//  Google Client ID
// ===================

process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '865204013155-2eph0vh7lttm2lnq8kt2im8tb7hd3o2j.apps.googleusercontent.com';