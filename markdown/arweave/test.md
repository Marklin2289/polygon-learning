De petites astuces pour git en ligne de commande car cela ne fait de mal à personne

### Importer le repo distance en écrasant le repo local

```shell
git fetch -all
git reset --hard origin/master
```

A savoir:
- `git fetch` importe les fichiers sans *merge* ou *rebase*
- `git reset` fait le reste

🙄 [stack](https://stackoverflow.com/questions/1125968/how-do-i-force-git-pull-to-overwrite-local-files)

### Creer des alias

Dans le fichier `.git/config` ajoutez:

```
[alias]
    ph = !git add -A && git commit -m "ok" && git push
```

🙄 [blog](https://bardoloi.com/blog/2015/10/29/git-aliases/)