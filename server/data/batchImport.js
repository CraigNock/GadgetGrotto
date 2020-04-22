const { MongoClient } = require('mongodb');
const fs = require('file-system');
const assert = require('assert');

const companies = JSON.parse(fs.readFileSync('data/fixedCompanies.json'));
const items = JSON.parse(fs.readFileSync('data/fixedItems.json'));


const batchImport = async () => {

  const client = new MongoClient('mongodb://localhost:27017', {
    useUnifiedTopology: true,
  });

  try {
    client.connect();
    console.log('connecto');

    const db = client.db('ecommerce')
    const r = await db.collection('companies').insertMany(companies);
    assert.equal(companies.length, r.insertedCount);
    console.log('done companies');
    const rr = await db.collection('items').insertMany(items);
    assert.equal(items.length, rr.insertedCount);
    console.log('done items');

  } catch (err) { 
    console.log('err', err);
  }

  client.close();
  console.log('disconnecto');
};

// batchImport();
