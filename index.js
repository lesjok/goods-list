const goods = document.querySelector('.goods');
const listItem = document.querySelectorAll('.goods__item');
const searchInput = document.querySelector('.search');
const selectInput = document.querySelector('.select');
const searchButton = document.querySelector('.button')

// получение данных с сервера
const getData = async () => {
  const data = await fetch('https://dummyjson.com/products');

  if(data.ok) {
    return data.json();
  } else {
    throw new Error(`Данные не были получены, ошибка ${data.status} ${data.statusText}`);
  }
};

// обработка полученных данных с сервера
const getGoods = callback => {
  getData()  
    .then(data => {
      const products = data.products.slice(0, 10);
      callback(products);
    })
    .catch(err => {
      console.error(err);
    })
}

// оборачиваем в try, catch для обработки ошибок
try {

// создание карточки товара
const createCard = ({ title }) => {
  const li = document.createElement('li');
    li.classList.add('goods__item');
    li.setAttribute('draggable', 'true');
    li.innerHTML = `
    <article class="good">
      <h3 class="good__title">${title}</h3>
    </article>
    `
    return li;
};

// создание модального окна
const createModal = ({ brand, category, description, discountPercentage, price, rating, stock, title }) => {
  const div = document.createElement('div');
  div.classList.add('modal');
  div.innerHTML = `
    <h4 class="modal__title">${title}</h4>
    <ul class="modal__list">
      <li>Brand: ${brand}</li>
      <li>Category: ${category}</li>
      <li>Description: ${description}</li>
      <li>Stock: ${stock}</li>
      <li>Discount: ${discountPercentage}</li>
      <li>Price: ${price}</li>
      <li>Rating: ${rating}</li>
    </ul> 
  `
  return div;
}

// добавление карточек товара на страницу
const renderGoodsList = (data) => {

  // функция фильтрации карточек по количеству и выбранной сортировке
  function filterAndSortGoods() {
    goods.innerHTML = '';
    let sortCards = [...data];

    // сортировка карточек по имени или цене
    if (selectInput.value === "name") {
      sortCards.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectInput.value === "price") {
      sortCards.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    }

    // добавляем карточки в контейнер и в массив отсортированных карточек
    for (let i = 0; i < searchInput.value; i++) {
      const card = createCard(sortCards[i]);
      const modal = createModal(sortCards[i]);
      sortCards.push(card);
      goods.append(card);
      card.append(modal);

      // вешаем события drag and drop на карточку
      card.addEventListener('dragstart', () => {
        card.classList.add('dragging');
      })
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      })
      goods.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(goods, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) {
          goods.appendChild(draggable);
        } else {
          goods.insertBefore(draggable, afterElement);
        }
      })
    }
  }
  filterAndSortGoods();
  
  // вешаем события на кнопку и выпадающий список
  selectInput.addEventListener('change', filterAndSortGoods);
  searchButton.addEventListener('click', filterAndSortGoods);
}

// получаем карточки товаров сразу
getGoods(renderGoodsList);
} catch (err) {
  console.warn(err);
}

// Drag and drop
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.goods__item:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}