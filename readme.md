### information

- approximately 700gb of binaries sourced from [myrient](https://myrient.erista.me/files/)
- serves as a lightweight local mirror, containing a wide variety of legacy console related archives
- facilitates rapid browsing via a static file index
- locally hosted through cloudflare tunnel, there will be downtime respecting central eastern timezone

### directory structure

- web root @ `/var/www/html` ([emu.vah.wtf](https://emu.vah.wtf))
- binaries @ `/var/www/html/data/`

```sh
> $ tree . --du -hL 2 --dirstfirst
[ 60K]  .
├── [ 12K]  assets
│   ├── [4.0K]  css
│   └── [4.0K]  js
├── [  15]  data -> /mnt/x/www-data
├── [ 12K]  partials
│   ├── [4.7K]  bottom.html
│   ├── [ 290]  nav.html
│   ├── [ 452]  table-head.html
│   └── [2.8K]  top.html
├── [3.3K]  readme.md
└── [3.2K]  index.html

  60K used in 7 directories, 13 files
```

> output reduced to how the structure compiles, disregarding unimportant content

### shortcuts

| key                           | action                       |
| :---------------------------- | :--------------------------- |
| <kbd>/</kbd>                  | focus search                 |
| <kbd>esc</kbd>                | unfocus search               |
| <kbd>g</kbd>                  | open global search           |
| <kbd>c</kbd>                  | clear cache & rebuild index  |
| <kbd>h</kbd>                  | go to `/`                    |
| <kbd>d</kbd>                  | go to `/data/`               |
| <kbd>r</kbd>                  | go to the source code        |
| <kbd>↑</kbd> <kbd>↓</kbd>     | navigate between files       |
| <kbd>backspace</kbd>          | return to previous directory |

### downloads

- i will temporarily open up the server when asked for - shoot me a pm @ **vahrina** on discord with your intention so i can filter out spam easier
- download individual files
  ```sh
  wget -c "https://emu.vah.wtf/data/../[file]"
  ```

### api

- directory listings are exposed via nginx autoindex in json format @ [/api/list/[path]](https://emu.vah.wtf/api/list/)
- each entry contains: `name`, `type`, `size`, `mtime`
- examples below demonstrating fetching all [nintendo/n64/](https://emu.vah.wtf/data/nintendo/n64/) entries

**shell** | print json to stdout ([jq](https://jqlang.org/) optional)

```sh
# list all entries at a path
curl https://emu.vah.wtf/api/list/nintendo/n64/ | jq .

# filter only files, print names + sizes
curl -s https://emu.vah.wtf/api/list/nintendo/n64/ \
| jq '[.[] | select(.type=="file") | {name, size}]'
```

**browser** | paste the devtools console on this origin

```js
// get all entries of type 'file'
fetch('/api/list/nintendo/n64/').then(r => r.json())
.then(entries => entries.filter(e => e.type === 'file'))

// only include 'name' & 'size' in the output
fetch('/api/list/nintendo/n64/').then(r => r.json())
.then(files => console.table(files, ['name', 'size']));

// or excluding a specific key value 'mtime' & 'size'
fetch('/api/list/nintendo/n64/').then(r => r.json())
.then(files => files.map(({ mtime, size, ...rest }) => rest))
```

if you'd like a cleaner table output, append following snippet at the end of the request ₍^. .^₎⟆

```js
.then(console.table);
```

### to do's / roadmap

- [x] global search
- [x] rename `/files/` to `/data/`
- [x] recursively sum the total size of the subdir contents in `/data/`
- [ ] vim status bar („• ֊ •„)
- [x] proper caching + modal
- [ ] help modal for shortcuts
- [ ] expand secrets because i cant come up with any
- [ ] helper script to download dirs (wget cant crawl `index.html` due to js app not being a real dir listing)

