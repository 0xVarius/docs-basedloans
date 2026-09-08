// Site-level configuration. Everything that differs between docs sites lives here
// (plus app/theme.css for the colour palette and public/logo.png).
export default {
  name: 'Based Loans',
  url: 'https://docs.based.loans',
  // Path to the GitBook content root (SUMMARY.md, README.md, .gitbook/assets), relative to this folder.
  contentDir: '..',
  logo: '/logo.png',
  // Max width for converted raster images. The content column is 768px, so 2x is plenty.
  imageMaxWidth: 1600,
  coverMaxWidth: 2400,
}
