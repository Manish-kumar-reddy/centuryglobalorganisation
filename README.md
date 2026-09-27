# Century Global Organisation — Website

A multi-page static website (plain HTML, CSS and JavaScript — no build step).

## Folder structure

```
century-global-website/
├── index.html          Home
├── about.html          About Us
├── opportunities.html  Opportunities / career path
├── gallery.html        Gallery (with filters + lightbox)
├── join-us.html        Application form + contact
├── 404.html            "Page not found" page (Netlify uses it automatically)
├── css/style.css       All styles (colours and fonts are at the top, in :root)
├── js/main.js          Menu, hero animation, slider, counters, gallery, form
└── assets/images/      Logo and photos
```

## View it on your computer

Double-click `index.html`. Or, from this folder, run:

```
python3 -m http.server 8000
```

and open http://localhost:8000

## Put it online (Netlify — same place as your current site)

1. Go to https://app.netlify.com and open your **centuryglobalorganization** site.
2. Open **Deploys**, then drag this whole `century-global-website` folder onto the page.
3. Your site updates at https://centuryglobalorganization.netlify.app

### Application form
The Join Us form uses **Netlify Forms**, so it only sends once the site is on Netlify.
Applications (including resumes) appear in Netlify under **Forms → application**.
You can turn on email alerts there: **Forms → Form notifications**.

## Common edits

- **Change colours:** edit `--orange`, `--ember` and `--navy-deep` at the top of `css/style.css`.
- **Add gallery photos:** copy the photo into `assets/images/`. Then in `gallery.html`, replace
  `<div class="g-ph">…</div>` with `<img src="assets/images/your-photo.jpg" alt="What the photo shows">`.
- **Add a photo to a slide on the home page:** in `index.html`, add a background image to the slide, for example
  `<div class="slide s1 active" style="background-image:url('assets/images/team.jpg')">`
- **Change contact details:** search the HTML files for `99594 50304` or `info@centuryglobalorganisation.com`.
- **Facebook / LinkedIn:** replace the `href="#"` links in each page's footer with your real profile links.
