### information

- approximately 700gb of binaries sourced from [myrient](https://myrient.erista.me/files/)
- serves as a lightweight local mirror, containing a wide variety of legacy console related archives
- facilitates rapid browsing via a static file index
- locally hosted through cloudflare tunnel, there will be downtime respecting central eastern timezone

### directory structure

- web root @ [emu](https://emu.vah.wtf)
- binaries @ [emu/data](https://emu.vah.wtf/data)
- api @ [emu/api](https://emu.vah.wtf/api/)

### shortcuts

| key                           | action                       |
| :---------------------------- | :--------------------------- |
| <kbd>/</kbd>                  | focus search                 |
| <kbd>esc</kbd>                | unfocus search               |
| <kbd>g</kbd>                  | open global search           |
| <kbd>ctrl c</kbd>             | clear cache                  |
| <kbd>v</kbd>                  | toggle vim status            |
| <kbd>h</kbd>                  | go to `/`                    |
| <kbd>d</kbd>                  | go to `/data/`               |
| <kbd>r</kbd>                  | go to the source code        |
| <kbd>↑</kbd> <kbd>↓</kbd>     | navigate between files       |
| <kbd>backspace</kbd>          | return to previous directory |

### global search

inside the `/data/` directory, you may hit <kbd>g</kbd> & find fuzzy finding files to narrow your search down easier

feel free to blindly type your suggested game, or try out some of the filters i can provide you with

| filter criteria               | action                        |
| :---------------------------- | :---------------------------- |
| `~f query`                    | filter by file names          |
| `~d query`                    | filter by directory names     |
| `!exclusion`                  | exclude a certain directory   |

**examples**

```md
> include both file & dir in your query
ocarina of time

> find all 'zelda' roms
~f zelda

> find every 'game boy' directory except gbc
~d game boy !game-boy-color

> both exclusions (comma chaining/separation)
> will generate the same output
~f super mario !ds,3ds
~f super mario !ds !3ds
```

**please avoid putting a bare exclusion with no prior query**, it will impact search time **drastically** - hence exclusion last!

### downloads

- i will temporarily open up the server when asked for - shoot me a pm @ **vahrina** on discord with your intention so i can filter out spam easier
- download individual files
  ```sh
  wget -c "https://emu.vah.wtf/data/../[file]"
  ```

### api

- directory listings are exposed via nginx autoindex in json format @ [/api/[path]](https://emu.vah.wtf/api/)
- each entry contains: `name`, `type`, `size`, `mtime`
- examples below demonstrating fetching all [nintendo/n64/](https://emu.vah.wtf/data/nintendo/n64/) entries

**shell** | print json to stdout ([jq](https://jqlang.org/) optional)

```sh
# list all entries at a path
curl https://emu.vah.wtf/api/nintendo/n64/ | jq .

# filter only files, print names + sizes
curl -s https://emu.vah.wtf/api/nintendo/n64/ \
| jq '[.[] | select(.type=="file") | {name, size}]'
```

**browser** | paste into the devtools console

```js
// get all entries of type 'file'
fetch('/api/nintendo/n64/').then(r => r.json())
.then(entries => entries.filter(e => e.type === 'file'))

// only include 'name' & 'size' in the output
fetch('/api/nintendo/n64/').then(r => r.json())
.then(files => console.table(files, ['name', 'size']));

// or excluding a specific key value 'mtime' & 'size'
fetch('/api/nintendo/n64/').then(r => r.json())
.then(files => files.map(({ mtime, size, ...rest }) => rest))
```

if you'd like a cleaner table output, append following snippet at the end of the request ₍^. .^₎⟆

```js
.then(console.table);
```

### assets
![ ]('./assets/img/main.png')
![ ]('./assets/img/dir.png')

### to do's / roadmap

- [x] global search
- [x] rename `/files/` to `/data/`
- [x] recursively sum the total size of the subdir contents in `/data/`
- [x] vim status bar („• ֊ •„)
  - [x] ^ toggleable on `v`
- [x] proper caching + modal
- [ ] help modal for shortcuts
- [ ] expand secrets because i cant come up with any
- [ ] helper script to download dirs (wget cant crawl `index.html` due to js app not being a real dir listing)
- [x] directories with a trailing asterik '*' to their name indicate a 1:1 100% copy of myrient's dir

