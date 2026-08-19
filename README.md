# info

A simple page with information about me.

To run it locally:

```bash
python -m http.server 8080
```

The `<link>` and `<script>` tags carry `?v=N`. Bump it whenever you touch CSS
or JS or the browser will keep serving the old version. The same number lives
in `ASSET_VERSION`, at the top of `script.js`.
