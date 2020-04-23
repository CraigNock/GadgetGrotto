// const items = require("../data/items.json");
// const companies = require("../data/companies.json");
const { MongoClient } = require('mongodb');
const assert = require('assert');


// ********************************************************* //
// function that returns the products filtered by company ID //
// ********************************************************* //
// const getCompanyProducts = (req, res) => {
//     const { companyId } = req.params;
//     // filters through the items to find those released by that specific company
//     let filteredProducts = items.filter((item) => {
//         if (item.companyId == companyId) {
//             return item;
//         }
//     });
//     res.send(filteredProducts);
// };

const getCompanyProducts = async (req, res) => {
	const { companyId } = req.params;
	const client = new MongoClient('mongodb://localhost:27017', {
	useUnifiedTopology: true,
	});

	try{
    await client.connect();
    console.log('getcomp connecto');

    const db = client.db('ecommerce');
    const products = await db.collection('items')
      .find({companyId: Number(companyId)})
      .toArray()
		res.send(products);

    client.close();
    console.log('get comp disconnecto');
    
  } catch (err) {
    console.log('error', err);
  };
};

// ********************************************************* //
// function that returns the company's name based on its ID  //
// ********************************************************* //
// const getCompanyName = (req, res) => {
//     const { companyId } = req.params;
//     let companyName;
//     companies.forEach(company => {
//         if (company.id == companyId) {
//             companyName = company.name;
//         }
//     })
//     res.send({companyName: companyName});
// };

const getCompanyName = async (req, res) => {
	const { companyId } = req.params;
	console.log('companyId', companyId);
	const client = new MongoClient('mongodb://localhost:27017', {
	useUnifiedTopology: true,
	});

	try{
		await client.connect();
		console.log('connecto');

		const db = client.db('ecommerce');
		const retrievedCompany = await db.collection('companies')
			.findOne({ _id: Number(companyId) });
		console.log('retrievedCompany', retrievedCompany);
		retrievedCompany 
			? res.send({companyName: retrievedCompany.name})
			: res.status(404).json({ status: 404, companyName: 'Not Found' });
			

		client.close();
		console.log('disconnecto');
		
	} catch (err) {
	console.log('error', err);
	};

};




module.exports = {
    getCompanyProducts,
    getCompanyName,
};