import './styles/index.css';
import $ from 'jquery';
import api from './scripts/api';
import store from './scripts/store';
import shoppingList from './scripts/shopping-list';

$(document).ready(function() {
  shoppingList.bindEventListeners();

  // On initial load, fetch Shopping Items and render
  api.getItems()
    .then((items) => {
      items.forEach((item) => store.addItem(item));
      shoppingList.render();
    })
    .catch(err => console.log(err.message));
});

