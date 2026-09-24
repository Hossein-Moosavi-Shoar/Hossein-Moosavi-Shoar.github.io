# Hossein Moosavi Shoa'r — Academic Website (al-folio)

Built on the [al-folio](https://github.com/alshedivat/al-folio) Jekyll theme.
No local Ruby needed — the site builds automatically on GitHub Actions when you push.

## One-time publish (do this once)
1. Create a GitHub account if you don't have one (e.g. `hmoosavi`).
2. In `G:/apply/al-folio` run:
   ```bash
   git remote set-url origin https://github.com/<username>/<username>.github.io.git
   git push -u origin master
   ```
   (Repo must be named `<username>.github.io` so the site lives at the root.)
3. Open the repo on GitHub → **Actions** tab → wait for the "Deploy site" workflow
   to finish (~5 min, it installs Ruby and builds the site in the cloud).
4. Repo → **Settings → Pages** → Source: `gh-pages` branch. Site is live at
   `https://<username>.github.io`.

## Then personalize (edit these)
| What | Where |
|---|---|
| Your GitHub username in `url:` | `_config.yml` line ~22 (`https://USERNAME.github.io`) |
| Profile photo | replace `assets/img/prof_pic.jpg` |
| Real Scholar / LinkedIn IDs | `_data/socials.yml` |
| Bio text | `_pages/about.md` |
| Publications | `_bibliography/papers.bib` |
| News items | `_news/` (one `.md` per item, newest first) |
| CV page data | `_data/cv.yml` |
| CV PDF download | `assets/pdf/cv.pdf` |

## Everyday updates
Edit a file → `git add -A && git commit -m "update" && git push` →
Actions rebuilds the site automatically in ~5 minutes.

## Local preview (optional, not required)
Install Ruby + Jekyll (`gem install jekyll bundler`), then:
```bash
cd G:/apply/al-folio
bundle install
bundle exec jekyll serve
```
Open http://localhost:4000
