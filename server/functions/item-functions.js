// const items = require("../data/items.json");
const { MongoClient } = require('mongodb');
const assert = require('assert');

//item storage in server, update periodically
let ITEMS = [];

// customized sort function 
const sortByStock = (a, b) => {
  const stockA = a.numInStock;
  const stockB = b.numInStock;
  let comparison = 0;
  if (stockB > stockA) {
    comparison = 1;
  } else {
    comparison = -1;
  };
  return comparison;
};

// ************************************************************** //
// function that will initially fetch all the items to the server //
// ************************************************************** //
// checks that global items storage has been populated, if not, populates from db
const retrieveAllItems = async () => {
  if (ITEMS.length > 0) return;
	const client = new MongoClient('mongodb://localhost:27017', {
	useUnifiedTopology: true,
	});
	try{
    await client.connect();
    console.log('retrive connecto');
    const db = client.db('ecommerce');
    const itemArr = await db.collection('items')
      .find()
      .toArray() 
      ITEMS = JSON.parse(JSON.stringify(itemArr));
      console.log('ITEMS RETRIEVED', ITEMS[0]._id);
      client.close();
      console.log('retrive disconnecto');
      return;
  
  } catch (err) {
    console.log('error', err);
  };
};


// ****************************************************************** //
// function that will filter the data by category specified by the user //
// ****************************************************************** //
const filterCategory = async (req, res) => {  
  if (ITEMS.length < 1) await retrieveAllItems();
  //category of items specified in the url
  const { category } = req.params;
  // filters the items by category into a new array
  let filteredItems = ITEMS.filter((item) => {
    if (item.category === category) {
      return item;
    }
  });
  res.send(filteredItems);
};

// const filterCategory = async (req, res) => {
// 	const { catagory } = req.params;
// 	const client = new MongoClient('mongodb://localhost:27017', {
// 	useUnifiedTopology: true,
// 	});
// 	try{
//     await client.connect();
//     console.log('connecto');
//     const db = client.db('ecommerce');
//     db.collection('items')
//       .find({catagory: catagory})
//       .toArray((err, result) => {
// 			res.send(result);
//       client.close();
//       console.log('disconnecto');
//     })
//   } catch (err) {
//     console.log('error', err);
//   };
// };


// ****************************************************************** //
// function that returns products related to the user's search query  //
// ****************************************************************** //
const getSearchResults = async (req, res) => { 
  if (ITEMS.length < 1) await retrieveAllItems();

  const { userInput } = req.params;
  // filters the items based on the user's input
  let getSearchResults = ITEMS.filter((item) => {
    if (item.name.toLowerCase().includes(userInput.toLowerCase())) {
      return item;
    }
  });
  // if the user has searched for a specific category, returns all items in the related category, priority goes to the names above
  ITEMS.filter((item) => {
    if (item.category.toLowerCase().includes(userInput.toLowerCase())) {
      getSearchResults.push(item);
    }
  });
  res.send(getSearchResults);
};

// const getSearchResults = async (req, res) => {  
//   const { userInput } = req.params;
//   const client = new MongoClient('mongodb://localhost:27017', {
// 	useUnifiedTopology: true,
// 	});
// 	try{
//     await client.connect();
//     console.log('connecto');
//     const db = client.db('ecommerce');
//     db.collection('items')
//       .find()
//       .toArray((err, result) => {
//       // console.log('result', result[0]);
// 			res.send(result);
//       client.close();
//       console.log('disconnecto');
//     })
//   } catch (err) {
//     console.log('error', err);
//   };
// };


// ********************************************** //
// returns the information of the specified item  //
// ********************************************** //
const getItemInformation = async (req, res) => {  
  if (ITEMS.length < 1) await retrieveAllItems();

  const {itemId} = req.params;

  // will be used to determine the position of the required item
  let position;

  ITEMS.forEach((item, index) => {
    if (item._id == itemId){
      position = index;
    }
  })

  res.send(ITEMS[position]);
}


// *********************************** //
// returns the categories in an array  //
// *********************************** //

let categories = [];
const getCategories = async (req, res) => { 
  if (ITEMS.length < 1) await retrieveAllItems();
  
  if (categories.length < 1) {
    let types = [];
    const makeTypes = () => {
      ITEMS.forEach((item) => {
        types.push(item.category);
      });
    };
    makeTypes();
    unique = (value, index, self) => {
      return self.indexOf(value) === index;
    };
    types = types.filter(unique);
    // console.log('types', types);
    categories = [...types];
    res.send(categories);
  } else {
    res.send(categories);
  }
};

// ******************************************************************************************************* //
// returns an array of the 3 items on special sorted by highest stock and 3 random items as featured items //
// ******************************************************************************************************* //
const getHomepage = async (req, res) => {  
// checks that global items storage has been populated, if not, populates
  await retrieveAllItems();

  // constant of how many items we want displayed
  const NUM_OF_ITEMS = 3;

  // cloning the items file so as to not change the order
  const sortedItems = [...ITEMS];
  sortedItems.sort(sortByStock);

  // the arrays that are used to select the items displayed on the homepage
  let itemsOnSale = [];
  let featuredItems = [];

  // sets random items in the featuredItems array | sets the 3 first items with the highest stock in the itemsOnSale array
  for (let i = 0; i < NUM_OF_ITEMS; ++i) {
      featuredItems.push(ITEMS[Math.floor(Math.random() * ITEMS.length)]);
      itemsOnSale.push(sortedItems[i]);
  };

  res.send( { sale: itemsOnSale, feature: featuredItems } );
};

module.exports = {
  ITEMS,
  retrieveAllItems,
  getHomepage,
  filterCategory,
  getCategories,
  getItemInformation,
  getSearchResults,
};