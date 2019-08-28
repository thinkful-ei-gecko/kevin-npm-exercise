import '../styles/index.css';
import $ from 'jquery';
import API from './api';
import STORE from './store';
import shoppingList from './shopping-list';

$(document).ready(function() {
  shoppingList.bindEventListeners();

  // On initial load, fetch Shopping Items and render
  API.getItems()
    .then((items) => {
      items.forEach((item) => STORE.addItem(item));
      shoppingList.render();
    })
    .catch(err => console.log(err.message));
});

