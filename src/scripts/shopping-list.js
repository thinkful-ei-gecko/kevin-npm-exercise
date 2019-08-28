import $ from 'jquery';
import API from './api';
import STORE from './store';

function generateError(message) {
  return `
    <section class="error-content">
      <button id="cancel-error">X</button>
      <p>${message}</p>
    </section>
  `;
}

function generateItemElement(item) {
  const checkedClass = item.checked ? 'shopping-item__checked' : '';
  const editBtnStatus = item.checked ? 'disabled' : '';

  let itemTitle = `<span class="shopping-item ${checkedClass}">${item.name}</span>`;
  if (item.isEditing) {
    itemTitle = `
      <form class="js-edit-item">
        <input class="shopping-item" type="text" value="${item.name}" />
      </form>
    `;
  }

  return `
    <li class="js-item-element" data-item-id="${item.id}">
      ${itemTitle}
      <div class="shopping-item-controls">
        <button class="shopping-item-edit js-item-edit" ${editBtnStatus}>
          <span class="button-label">edit</span>
        </button>
        <button class="shopping-item-toggle js-item-toggle">
          <span class="button-label">check</span>
        </button>
        <button class="shopping-item-delete js-item-delete">
          <span class="button-label">delete</span>
        </button>
      </div>
    </li>`;
}

function generateShoppingItemsString(shoppingList) {
  const items = shoppingList.map((item) => generateItemElement(item));
  return items.join('');
}

function renderError() {
  if (STORE.error) {
    const el = generateError(STORE.error);
    $('.error-container').html(el);
  } else {
    $('.error-container').empty();
  }
}

function render() {
  renderError();

  let items = [ ...STORE.items ];
  if (STORE.hideCheckedItems) {
    items = items.filter(item => !item.checked);
  }

  if (STORE.searchTerm) {
    items = items.filter(item => item.name.includes(STORE.searchTerm));
  }

  const shoppingListItemsString = generateShoppingItemsString(items);
  $('.js-shopping-list').html(shoppingListItemsString);
}

function handleNewItemSubmit() {
  $('#js-shopping-list-form').submit(function (event) {
    event.preventDefault();
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val('');
    API.createItem(newItemName)
      .then((newItem) => {
        STORE.addItem(newItem);
        render();
      })
      .catch((err) => {
        STORE.setError(err.message);
        renderError();
      });
  });
}

function getItemIdFromElement(item) {
  return $(item)
    .closest('.js-item-element')
    .data('item-id');
}

function handleItemCheckClicked() {
  $('.js-shopping-list').on('click', '.js-item-toggle', event => {
    const id = getItemIdFromElement(event.currentTarget);
    const item = STORE.findById(id);
    API.updateItem(id, { checked: !item.checked })
      .then(() => {
        STORE.findAndUpdate(id, { checked: !item.checked });
        render();
      })
      .catch((err) => {
        console.log(err);
        STORE.setError(err.message);
        renderError();
      }
      );
  });
}

function handleDeleteItemClicked() {
  $('.js-shopping-list').on('click', '.js-item-delete', event => {
    const id = getItemIdFromElement(event.currentTarget);

    API.deleteItem(id)
      .then(() => {
        STORE.findAndDelete(id);
        render();
      })
      .catch((err) => {
        console.log(err);
        STORE.setError(err.message);
        renderError();
      }
      );
  });
}

function handleEditShoppingItemSubmit() {
  $('.js-shopping-list').on('submit', '.js-edit-item', event => {
    event.preventDefault();
    const id = getItemIdFromElement(event.currentTarget);
    const itemName = $(event.currentTarget).find('.shopping-item').val();
    API.updateItem(id, { name: itemName })
      .then(() => {
        STORE.findAndUpdate(id, { name: itemName });
        STORE.setItemIsEditing(id, false);
        render();
      })
      .catch((err) => {
        console.log(err);
        STORE.setError(err.message);
        renderError();
      });
  });
}

function handleToggleFilterClick() {
  $('.js-filter-checked').click(() => {
    STORE.toggleCheckedFilter();
    render();
  });
}

function handleShoppingListSearch() {
  $('.js-shopping-list-search-entry').on('keyup', event => {
    const val = $(event.currentTarget).val();
    STORE.setSearchTerm(val);
    render();
  });
}

function handleItemStartEditing() {
  $('.js-shopping-list').on('click', '.js-item-edit', event => {
    const id = getItemIdFromElement(event.target);
    STORE.setItemIsEditing(id, true);
    render();
  });
}

function handleCloseError() {
  $('.error-container').on('click', '#cancel-error', () => {
    STORE.setError(null);
    renderError();
  });
}

function bindEventListeners() {
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleEditShoppingItemSubmit();
  handleToggleFilterClick();
  handleShoppingListSearch();
  handleItemStartEditing();
  handleCloseError();
}

export default {
  render,
  bindEventListeners
};
