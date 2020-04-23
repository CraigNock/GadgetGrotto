  // const items = require("../data/items.json");
  const { MongoClient } = require('mongodb');
  const assert = require('assert');

  const {
    ITEMS,
    retrieveAllItems,
  } = require('./item-functions');

  // an array that will store all the orders that have been completed
  // let completedOrders = [];

  // ************************************************************************** //
  // function that stores a confirmation order and the order details in memory  //
  // and sends back the confirmation number with a status 200                   //
  // ************************************************************************** //
  // const confirmPurchase = (req) => {
  // const { order } = req.body;
  // const { cartItems } = order;
  // //removing the sensitive payment info, replacing with basic confirmation
  // const safeOrder = {
  // ...order,
  // payment: 'Payment Confirmed',
  // }
  // // changes the number in stock of the item(s) purchased
  // cartItems.forEach((cartItem) => {
  //   items.forEach((item) => {
  //     if (cartItem.id === item.id) {
  //       item.numInStock = item.numInStock - cartItem.quantity;
  //     }
  //   });
  // });
  // // creating a confirmation number which will be sent back to the user and stored in the server memory
  // const random = Math.floor(Math.random() * 1000000);
  // completedOrders.push({ confirmation: random, order: safeOrder });

  // return { confirmation: random, status: 200 };
  // };

  const confirmPurchase = async (req, res) => {
    const { order } = req.body;
    const { cartItems } = order;
    const random = Math.floor(Math.random() * 1000000);
    //removing the sensitive payment info, replacing with basic confirmation
    //assumedly the payment would be processed or creditcard number verified as valid and stored securely
    const safeOrder = {
    ...order,
    payment: 'Payment Confirmed',
    }

    const client = new MongoClient('mongodb://localhost:27017', {
    useUnifiedTopology: true,
    });
    try{
      await client.connect();
      console.log('purch connected');
      const db = client.db('ecommerce');

      await cartItems.forEach( async (item) => {
        const newStock = item.numInStock - 1;
        const r = await db.collection('items')
          .updateOne({name: item.name}, { $set: {numInStock: newStock } });
        assert.equal(1, r.matchedCount);
        assert.equal(1, r.modifiedCount);
      });
      
      const rr = await db.collection('orders')
        .insertOne({ _id: random, order: safeOrder });
      assert.equal(1, rr.insertedCount);
      
      res.send({confirmation: random, status: 200 });
      client.close();
      console.log('purch disconnecto');

      retrieveAllItems();///might not work-> test
    } catch (err) {
      console.log(err.stack);
      res.status(500).json({status: 500, data:req.body, message: err.message});
    };
  };



  // ******************************************************************************************************* //
  // function that will sort through the history of purchases and return the details of a specified purchase //
  // ******************************************************************************************************* //
  // const orderHistory = (req, res) => {
  //   const {confirmation} = req.params;
  //   // will be used to determine the position of the required object in the array
  //   let position;
  //   completedOrders.forEach((order, index) => {
  //     if (order.confirmation == confirmation){
  //       position = index;
  //     }
  //   })
  //   res.send(completedOrders[position]);
  // };

  const orderHistory = async (req, res) => {
    const {confirmation} = req.params;
    const client = new MongoClient('mongodb://localhost:27017', {
      useUnifiedTopology: true,
    });

    try{
      await client.connect();
      console.log('get order connected');
      const db = client.db('ecommerce');
      
      const retrieved = await db.collection('orders')
        .findOne({
            $or:[ { _id: Number(confirmation) }, 
            {order: {user: {email: confirmation} } } ]//check works
          });
      console.log('retrieved', retrieved);
      retrieved
        ? res.send({ ...retrieved })
        : res.status(404).json({ status: 404, order: 'Not Found' });
      client.close();
      console.log('get order disconnected');
      
    } catch (err) {
      console.log('error', err);
    };
  };



  module.exports = {confirmPurchase, orderHistory};