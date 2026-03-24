var form = document.createElement('form');
form.id = 'search-form';
var input = document.createElement('input');

input.name = 'filter';
input.id = 'search';
input.autocomplete = 'off';
function normalizeDir(pathname) {
    if (!pathname) return '/';
    var dir = pathname;
    if (dir.endsWith('index.html')) dir = dir.slice(0, -'index.html'.length);
    if (!dir.endsWith('/')) dir += '/';
    return dir;
}

var dir = normalizeDir(window.location.pathname);
input.placeholder = 'search ' + dir;

form.appendChild(input);
var list = document.querySelector('table#list');
if (list && list.parentNode) {
    list.parentNode.insertBefore(form, list);
} else {
    document.body.prepend(form);
}

function performSearch() {
    var allRows = Array.from(document.querySelectorAll('#list tbody tr'));
    var listItems = allRows.filter(tr => !tr.querySelector('a[href="../"]'));
    var query = input.value.trim();

    if (!query) {
        listItems.forEach(item => item.removeAttribute('hidden'));
        return;
    }

    var regexStr = "(^|.*[^\\pL])" + query.split(/\s+/).join("([^\\pL]|[^\\pL].*[^\\pL])") + ".*$";
    var regex = RegExp(regexStr, "i");

    listItems.forEach(function(item) {
        var text = item.querySelector('td').textContent.replace(/\s+/g, " ");
        item.hidden = !regex.test(text);
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
