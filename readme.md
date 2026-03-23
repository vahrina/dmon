### information

- approximately 200gb of binaries sourced from myrient.erista.me
- includes nearly all zelda & mario titles
- serves as a lightweight local mirror for nintendo related archives
- facilitates rapid browsing via a static file index

### directory structure

- web root @ `/var/www/html`
- binaries @ `/var/www/html/files/`

```sh
> $ tree . -shL 3 --dirstfirst
[4.0K]  .
├── [4.0K]  assets
│   ├── [150K]  jquery.min.js
│   ├── [1.6K]  search.js
│   ├── [1.1K]  shortcuts.js
│   └── [4.2K]  style.css
├── [4.0K]  files
│   ├── [4.0K]  nintendo
│   │   ├── [ 12K]  2ds
│   │   ├── [ 12K]  3ds
│   │   ├── [120K]  amiibo
│   │   ├── [4.0K]  gamecube
│   │   ├── [4.0K]  wii
│   │   ├── [4.0K]  wii-u
│   │   └── [ 324]  index.html
│   └── [ 324]  index.html
├── [4.0K]  partials
│   ├── [2.6K]  bottom.html
│   ├── [ 301]  nav.html
│   ├── [ 473]  table-head.html
│   └── [ 655]  top.html
├── [3.0K]  index.html
└── [ 605]  readme.md

10 directories, 15 files
```

### shortcuts

| key                           | action                       |
| :---------------------------- | :--------------------------- |
| <kbd>/</kbd>                  | focus search                 |
| <kbd>esc</kbd>                | unfocus search               |
| <kbd>h</kbd>                  | go to `/`                    |
| <kbd>f</kbd>                  | go to `/files/`              |
| <kbd>r</kbd>                  | go to the source code        |
| <kbd>up</kbd> <kbd>down</kbd> | navigate between files       |
| <kbd>backspace</kbd>          | return to previous directory |

### maintenance

as of Mon Mar 23 22:32:31 CET 2026, downloads are currently unavailable, due to my local capacity (primarily owing to the absence of a server lol)
