var form = document.createElement('form');
var input = document.createElement('input');

input.name = 'filter';
input.id = 'search';
input.placeholder = 'search...';

form.appendChild(input);
document.querySelector('h1').after(form);

var listItems = Array.from(document.querySelectorAll('#list tbody tr'));

function performSearch() {
    var query = input.value.trim();
    if (!query) {
        listItems.forEach(item => item.removeAttribute('hidden'));
        return;
    }

    var regexStr = "(^|.*[^\\pL])" + query.split(/\s+/).join("([^\\pL]|[^\\pL].*[^\\pL])") + ".*$";
    var regex = RegExp(regexStr, "i");

    listItems.forEach(function(item) {
        item.removeAttribute('hidden');
    });

    listItems.filter(function(item) {
        var text = item.querySelector('td').textContent.replace(/\s+/g, " ");
        return !regex.test(text);
    }).forEach(function(item) {
        item.hidden = true;
    });
}

function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

input.addEventListener('input', debounce(performSearch, 250));

form.addEventListener('submit', e => e.preventDefault());
