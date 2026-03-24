### information

- approximately 300gb of binaries sourced from myrient.erista.me
- serves as a lightweight local mirror, containing a wide variety of legacy console related archives
- facilitates rapid browsing via a static file index

### directory structure

- web root @ `/var/www/html` (https://emu.vah.wtf)
- binaries @ `/var/www/html/data/`

```sh
> $ tree . --du -hL 2 --dirstfirst
[202K]  .
├── [165K]  assets
│   ├── [ 836]  logo-fire.css
│   ├── [3.4K]  logo-fire.js
│   ├── [1.7K]  search.js
│   ├── [1.1K]  shortcuts.js
│   └── [4.4K]  style.css
├── [ 12K]  data 
│   ├── [4.0K]  nintendo
│   ├── [4.0K]  sony
│   └── [ 325]  index.html
├── [2.4K]  readme.md
└── [5.0K]  index.html

 202K used in 5 directories, 18 files
```

> output reduced to how the structure compiles, disregarding unimportant content

### shortcuts

| key                           | action                       |
| :---------------------------- | :--------------------------- |
| <kbd>/</kbd>                  | focus search                 |
| <kbd>esc</kbd>                | unfocus search               |
| <kbd>h</kbd>                  | go to `/`                    |
| <kbd>d</kbd>                  | go to `/data/`               |
| <kbd>r</kbd>                  | go to the source code        |
| <kbd>up</kbd> <kbd>down</kbd> | navigate between files       |
| <kbd>backspace</kbd>          | return to previous directory |

### downloads

- i will temporarily open up the server when asked for - shoot me a pm @ **vahrina** on discord with your intention so i can filter out spam easier
- ordering an appropriate server soon enough!

### api

directory listings are exposed via nginx autoindex in json format

- endpoint @ `root/api/list/` (https://emu.vah.wtf/api/list/)
- response is nginx **autoindex** in **json** format with an array of objects containing all the data needed

### to do's / roadmap

- [ ] global search
- [x] rename `/files/` to `/data/`
- [x] recursively sum the total size of the subdir contents in `/data/`
- [ ] vim status bar („• ֊ •„)
- [ ] proper caching
- [ ] help modal for shortcuts
- [ ] include emulator binaries
- [ ] content coverage

