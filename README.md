# Pore Compare
Comparison of conductance data in the solid-state nanopore literature.

Check out the site [here](http://parkin.github.io/pore-compare/).

Inspired by [DNA Translocation in Nanometer Thick Silicon Nanopores](http://pubs.acs.org/doi/abs/10.1021/acsnano.5b02531).

![Screenshot](app/images/screenshot.jpg)

## Contributing

To contibute published data, please:

1. Edit the data at [app/data/data.json](app/data/data.json) and follow its formatting.
2. Add your bibtex bibliography entry to [app/assets/bib.bib](app/assets/bib.bib).

To add your data, please send in a pull request or [create a new issue](https://github.com/parkin/pore-compare/issues).

Other contributions, such as style and functionality improvements, are welcome!

## Development

### Deploying

The project is hosted on Github Pages, using the `gh-pages` branch. There is an npm task to deploy the site to the gh-pages branch.

```
npm run deploy
```

*Note that this will push to `gh-pages` with the force `-f` flag!*
